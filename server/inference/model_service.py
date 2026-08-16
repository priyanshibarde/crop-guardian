"""Safe MobileNetV2 inference service for Crop Guardian.

The service intentionally refuses to predict until both the model weights and
the verified class_names.json are present and valid. It never invents labels.
"""

from __future__ import annotations

import json
import os
import time
from pathlib import Path
from typing import Any


MODEL_NAME = "plant-disease-mobilenetv2"
EXPECTED_CLASS_COUNT = 38
SUPPORTED_FORMATS = {"JPEG", "PNG", "WEBP"}


def _default_asset_path(filename: str) -> Path:
    return Path(__file__).resolve().parent / "models" / filename


def _model_path() -> Path:
    return Path(os.getenv("MODEL_PATH", str(_default_asset_path("mobilenetv2_plant.pth"))).strip()).expanduser()


def _class_names_path() -> Path:
    return Path(os.getenv("CLASS_NAMES_PATH", str(_default_asset_path("class_names.json"))).strip()).expanduser()


def _model_version() -> str:
    return os.getenv("MODEL_VERSION", "unverified").strip() or "unverified"


def _model_info() -> dict[str, str]:
    return {"name": MODEL_NAME, "version": _model_version()}


class ModelService:
    def __init__(self) -> None:
        self._model: Any = None
        self._transform: Any = None
        self._class_names: list[str] | None = None
        self._device: Any = None
        self._load_error: str | None = None

    def _unavailable(self, reason: str) -> dict[str, Any]:
        return {"status": "unavailable", "prediction": None, "model": _model_info(), "error": {"code": "MODEL_NOT_CONFIGURED", "message": reason}}

    def _load(self) -> dict[str, Any] | None:
        if self._model is not None and self._class_names is not None:
            return None
        if self._load_error is not None:
            return self._unavailable(self._load_error)

        model_path = _model_path()
        class_names_path = _class_names_path()
        if not model_path.is_file():
            self._load_error = "The MobileNetV2 model file is not configured."
            return self._unavailable(self._load_error)
        if not class_names_path.is_file():
            self._load_error = "The verified class_names.json file is not configured."
            return self._unavailable(self._load_error)

        try:
            raw_names = json.loads(class_names_path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            self._load_error = "The class_names.json file could not be read."
            return self._unavailable(self._load_error)
        if not isinstance(raw_names, list) or len(raw_names) != EXPECTED_CLASS_COUNT or not all(isinstance(name, str) and name.strip() for name in raw_names):
            self._load_error = "The verified class_names.json must contain exactly 38 non-empty labels."
            return self._unavailable(self._load_error)

        try:
            import torch
            from torchvision import models, transforms
            from torch import nn

            self._device = torch.device("cuda" if os.getenv("INFERENCE_DEVICE", "cpu").lower() == "cuda" and torch.cuda.is_available() else "cpu")
            model = models.mobilenet_v2(weights=None)
            model.classifier[1] = nn.Sequential(nn.Dropout(0.2), nn.Linear(model.classifier[1].in_features, EXPECTED_CLASS_COUNT))
            checkpoint = torch.load(model_path, map_location=self._device, weights_only=False)
            state_dict = checkpoint.get("state_dict", checkpoint) if isinstance(checkpoint, dict) else checkpoint
            model.load_state_dict(state_dict, strict=True)
            model.to(self._device)
            model.eval()
            self._model = model
            self._class_names = [name.strip() for name in raw_names]
            self._transform = transforms.Compose([
                transforms.Resize((224, 224)),
                transforms.ToTensor(),
                transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
            ])
            return None
        except Exception as error:  # Keep dependency/model details out of API responses.
            self._load_error = f"The inference model could not be loaded: {type(error).__name__}."
            return self._unavailable(self._load_error)

    def predict(self, image_path: Path) -> dict[str, Any]:
        unavailable = self._load()
        if unavailable is not None:
            return unavailable

        try:
            from PIL import Image
            import torch

            max_bytes = int(os.getenv("MAX_INFERENCE_BYTES", str(10 * 1024 * 1024)))
            if not image_path.is_file() or image_path.stat().st_size <= 0:
                return {"status": "failed", "prediction": None, "model": _model_info(), "error": {"code": "IMAGE_NOT_FOUND", "message": "The referenced image could not be read."}}
            if image_path.stat().st_size > max_bytes:
                return {"status": "failed", "prediction": None, "model": _model_info(), "error": {"code": "IMAGE_TOO_LARGE", "message": "The image exceeds the inference size limit."}}
            with Image.open(image_path) as image:
                image.verify()
            with Image.open(image_path) as image:
                if image.format not in SUPPORTED_FORMATS:
                    return {"status": "failed", "prediction": None, "model": _model_info(), "error": {"code": "UNSUPPORTED_IMAGE_TYPE", "message": "Only JPEG, PNG, and WebP images are supported."}}
                tensor = self._transform(image.convert("RGB")).unsqueeze(0).to(self._device)
            started = time.perf_counter()
            with torch.no_grad():
                probabilities = torch.softmax(self._model(tensor), dim=1)[0]
            index = int(torch.argmax(probabilities).item())
            confidence = float(probabilities[index].item())
            return {"status": "completed", "prediction": {"class_name": self._class_names[index], "confidence": confidence}, "model": _model_info(), "inferenceTimeMs": round((time.perf_counter() - started) * 1000, 2)}
        except Exception:
            return {"status": "failed", "prediction": None, "model": _model_info(), "error": {"code": "INFERENCE_FAILED", "message": "The image could not be analyzed."}}


model_service = ModelService()
