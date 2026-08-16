"""Model-provider contracts and the current MobileNetV2 provider."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any, Protocol


class ProviderError(Exception):
    """An internal provider error with a safe API error code."""

    def __init__(self, code: str) -> None:
        super().__init__(code)
        self.code = code


@dataclass(frozen=True)
class ProviderPrediction:
    class_name: str
    confidence: float


class ModelProvider(Protocol):
    model_name: str
    model_version: str
    class_names: list[str]
    output_class_count: int

    def predict(self, image_path: Path) -> ProviderPrediction:
        ...


class MobileNetV2Provider:
    """Loads the configured MobileNetV2 checkpoint without guessing labels."""

    def __init__(self, model_path: Path, class_names: list[str], model_name: str, model_version: str, input_size: int, device_name: str) -> None:
        self.model_name = model_name
        self.model_version = model_version
        self.class_names = class_names
        self.output_class_count = len(class_names)
        self._model: Any = None
        self._transform: Any = None
        self._device: Any = None
        self._model_path = model_path
        self._input_size = input_size
        self._device_name = device_name

    def load(self) -> None:
        try:
            import torch
            from torch import nn
            from torchvision import models, transforms

            requested_device = self._device_name.lower()
            self._device = torch.device("cuda" if requested_device == "cuda" and torch.cuda.is_available() else "cpu")
            model = models.mobilenet_v2(weights=None)
            model.classifier[1] = nn.Sequential(nn.Dropout(0.2), nn.Linear(model.classifier[1].in_features, self.output_class_count))
            checkpoint = torch.load(self._model_path, map_location=self._device, weights_only=False)
            state_dict = checkpoint.get("state_dict", checkpoint) if isinstance(checkpoint, dict) else checkpoint
            if not isinstance(state_dict, dict):
                raise ProviderError("MODEL_LOAD_FAILED")
            checkpoint_class_count = None
            for key in ("classifier.1.1.weight", "classifier.1.weight"):
                weights = state_dict.get(key)
                if hasattr(weights, "shape") and len(weights.shape) == 2:
                    checkpoint_class_count = int(weights.shape[0])
                    break
            if checkpoint_class_count is not None and checkpoint_class_count != self.output_class_count:
                raise ProviderError("MODEL_NOT_CONFIGURED")
            model.load_state_dict(state_dict, strict=True)
            model.to(self._device)
            model.eval()
            self._model = model
            self._transform = transforms.Compose([
                transforms.Resize((self._input_size, self._input_size)),
                transforms.ToTensor(),
                transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
            ])
        except ProviderError:
            raise
        except Exception as error:
            raise ProviderError("MODEL_LOAD_FAILED") from error

    def predict(self, image_path: Path) -> ProviderPrediction:
        if self._model is None or self._transform is None or self._device is None:
            raise ProviderError("MODEL_LOAD_FAILED")
        try:
            from PIL import Image
            import torch

            with Image.open(image_path) as image:
                tensor = self._transform(image.convert("RGB")).unsqueeze(0).to(self._device)
            with torch.no_grad():
                output = self._model(tensor)
                if getattr(output, "ndim", None) != 2 or output.shape[0] != 1 or output.shape[1] != self.output_class_count:
                    raise ProviderError("INVALID_MODEL_OUTPUT")
                probabilities = torch.softmax(output, dim=1)[0]
                index = int(torch.argmax(probabilities).item())
                confidence = float(probabilities[index].item())
            if index < 0 or index >= len(self.class_names) or not 0 <= confidence <= 1:
                raise ProviderError("INVALID_MODEL_OUTPUT")
            return ProviderPrediction(class_name=self.class_names[index], confidence=confidence)
        except ProviderError:
            raise
        except Exception as error:
            raise ProviderError("INFERENCE_FAILED") from error
