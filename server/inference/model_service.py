"""Provider-independent model configuration, validation, and inference."""

from __future__ import annotations

import json
import math
import os
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from model_provider import MobileNetV2Provider, ModelProvider, ProviderError


SUPPORTED_FORMATS = {"JPEG", "PNG", "WEBP"}
DEFAULT_MODEL_NAME = "plant-disease-mobilenetv2"
DEFAULT_MODEL_VERSION = "unverified"
DEFAULT_INPUT_SIZE = 224
DEFAULT_MAX_BYTES = 10 * 1024 * 1024


def _default_asset_path(filename: str) -> Path:
    return Path(__file__).resolve().parent / "models" / filename


@dataclass(frozen=True)
class ModelConfig:
    model_path: Path
    class_names_path: Path
    model_name: str
    model_version: str
    input_size: int
    provider: str
    device: str

    @classmethod
    def from_env(cls) -> "ModelConfig":
        input_size_value = os.getenv("MODEL_INPUT_SIZE", str(DEFAULT_INPUT_SIZE)).strip()
        try:
            input_size = int(input_size_value)
        except ValueError:
            input_size = 0
        return cls(
            model_path=Path(os.getenv("MODEL_PATH", str(_default_asset_path("mobilenetv2_plant.pth"))).strip()).expanduser(),
            class_names_path=Path(os.getenv("CLASS_NAMES_PATH", str(_default_asset_path("class_names.json"))).strip()).expanduser(),
            model_name=os.getenv("MODEL_NAME", DEFAULT_MODEL_NAME).strip() or DEFAULT_MODEL_NAME,
            model_version=os.getenv("MODEL_VERSION", DEFAULT_MODEL_VERSION).strip() or DEFAULT_MODEL_VERSION,
            input_size=input_size,
            provider=os.getenv("MODEL_PROVIDER", "mobilenetv2").strip().lower(),
            device=os.getenv("INFERENCE_DEVICE", "cpu").strip().lower() or "cpu",
        )


def model_metadata(config: ModelConfig | None = None) -> dict[str, str]:
    current = config or ModelConfig.from_env()
    return {"name": current.model_name, "version": current.model_version, "provider": current.provider}


class ModelService:
    def __init__(self, config: ModelConfig | None = None) -> None:
        self.config = config or ModelConfig.from_env()
        self._provider: ModelProvider | None = None
        self._load_error: str | None = None
        self._load_code: str = "MODEL_NOT_CONFIGURED"

    def _result(self, status: str, prediction: object = None, error: dict[str, str] | None = None, inference_time_ms: float | None = None) -> dict[str, Any]:
        result: dict[str, Any] = {"status": status, "prediction": prediction, "model": model_metadata(self.config)}
        if error is not None:
            result["error"] = error
        if inference_time_ms is not None:
            result["inferenceTimeMs"] = inference_time_ms
        return result

    def _unavailable(self, message: str | None = None) -> dict[str, Any]:
        return self._result("unavailable", error={"code": self._load_code, "message": message or self._load_error or "The inference model is unavailable."})

    def _validate_configuration(self) -> tuple[list[str] | None, dict[str, Any] | None]:
        if self.config.input_size <= 0:
            self._load_error = "The model input size is invalid."
            return None, self._unavailable()
        if self.config.provider != "mobilenetv2":
            self._load_error = "The configured model provider is not available."
            return None, self._unavailable()
        if not self.config.model_path.is_file():
            self._load_error = "The model file is not configured."
            return None, self._unavailable()
        if not self.config.class_names_path.is_file():
            self._load_error = "The verified class_names.json file is not configured."
            return None, self._unavailable()
        try:
            raw_names = json.loads(self.config.class_names_path.read_text(encoding="utf-8"))
        except (OSError, UnicodeDecodeError, json.JSONDecodeError):
            self._load_error = "The class_names.json file is invalid."
            return None, self._unavailable()
        if not isinstance(raw_names, list) or not raw_names or not all(isinstance(name, str) and name.strip() for name in raw_names):
            self._load_error = "The class_names.json file must contain a non-empty array of labels."
            return None, self._unavailable()
        names = [name.strip() for name in raw_names]
        if len(set(names)) != len(names):
            self._load_error = "The class_names.json file contains duplicate labels."
            return None, self._unavailable()
        return names, None

    def _load(self) -> dict[str, Any] | None:
        if self._provider is not None:
            return None
        if self._load_error is not None:
            return self._unavailable()
        class_names, error = self._validate_configuration()
        if error is not None or class_names is None:
            return error
        try:
            provider = MobileNetV2Provider(self.config.model_path, class_names, self.config.model_name, self.config.model_version, self.config.input_size, self.config.device)
            provider.load()
            if provider.output_class_count != len(class_names):
                self._load_code = "MODEL_NOT_CONFIGURED"
                self._load_error = "The class mapping is incompatible with the model output."
                return self._unavailable()
            self._provider = provider
            return None
        except ProviderError as error:
            self._load_code = error.code
            self._load_error = "The configured inference model could not be loaded."
            return self._unavailable()

    def metadata(self) -> dict[str, Any]:
        configured = self._provider is not None
        if self._provider is None and self._load_error is None:
            class_names, error = self._validate_configuration()
            configured = error is None and class_names is not None
        return {"configured": configured, "model": model_metadata(self.config)}

    def health(self) -> dict[str, Any]:
        return {"status": "ok", **self.metadata()}

    def _validate_image(self, image_path: Path) -> dict[str, str] | None:
        try:
            max_bytes = int(os.getenv("MAX_INFERENCE_BYTES", str(DEFAULT_MAX_BYTES)))
        except ValueError:
            max_bytes = DEFAULT_MAX_BYTES
        try:
            if not image_path.is_file() or image_path.stat().st_size <= 0:
                return {"code": "IMAGE_NOT_FOUND", "message": "The referenced image could not be read."}
            if image_path.stat().st_size > max_bytes:
                return {"code": "IMAGE_TOO_LARGE", "message": "The image exceeds the inference size limit."}
            from PIL import Image

            with Image.open(image_path) as image:
                image.verify()
                if image.format not in SUPPORTED_FORMATS:
                    return {"code": "INVALID_IMAGE", "message": "Only JPEG, PNG, and WebP images are supported."}
        except Exception:
            return {"code": "INVALID_IMAGE", "message": "The image is invalid or could not be read."}
        return None

    def predict(self, image_path: Path) -> dict[str, Any]:
        image_error = self._validate_image(image_path)
        if image_error is not None:
            return self._result("failed", error=image_error)
        unavailable = self._load()
        if unavailable is not None:
            return unavailable
        assert self._provider is not None
        started = time.perf_counter()
        try:
            prediction = self._provider.predict(image_path)
            if not prediction.class_name or not math.isfinite(prediction.confidence) or not 0 <= prediction.confidence <= 1:
                return self._result("failed", error={"code": "INVALID_MODEL_OUTPUT", "message": "The model returned an invalid prediction."})
            return self._result("completed", prediction={"class_name": prediction.class_name, "confidence": prediction.confidence}, inference_time_ms=round((time.perf_counter() - started) * 1000, 2))
        except ProviderError as error:
            safe_messages = {"MODEL_LOAD_FAILED": "The configured inference model could not be loaded.", "INVALID_MODEL_OUTPUT": "The model returned an invalid prediction.", "INFERENCE_FAILED": "The image could not be analyzed."}
            return self._result("failed", error={"code": error.code, "message": safe_messages.get(error.code, "The image could not be analyzed.")})


model_service = ModelService()
