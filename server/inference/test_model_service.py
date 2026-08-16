from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from model_service import ModelConfig, ModelService


class ModelServiceChecks(unittest.TestCase):
    def test_missing_model_returns_model_not_configured(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            class_file = root / "class_names.json"
            class_file.write_text(json.dumps(["Tomato___healthy"]), encoding="utf-8")
            result = ModelService(ModelConfig(root / "missing.pth", class_file, "test", "test", 224, "mobilenetv2", "cpu")).predict(root / "missing.png")
            self.assertEqual(result["error"]["code"], "IMAGE_NOT_FOUND")
            result = ModelService(ModelConfig(root / "missing.pth", class_file, "test", "test", 224, "mobilenetv2", "cpu"))._load()
            self.assertEqual(result["error"]["code"], "MODEL_NOT_CONFIGURED")

    def test_missing_class_names_returns_model_not_configured(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            model_file = root / "model.pth"
            model_file.write_bytes(b"checkpoint")
            result = ModelService(ModelConfig(model_file, root / "missing.json", "test", "test", 224, "mobilenetv2", "cpu"))._load()
            self.assertEqual(result["error"]["code"], "MODEL_NOT_CONFIGURED")

    def test_malformed_class_names_returns_model_not_configured(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            model_file = root / "model.pth"
            class_file = root / "class_names.json"
            model_file.write_bytes(b"checkpoint")
            class_file.write_text("{not-json", encoding="utf-8")
            result = ModelService(ModelConfig(model_file, class_file, "test", "test", 224, "mobilenetv2", "cpu"))._load()
            self.assertEqual(result["error"]["code"], "MODEL_NOT_CONFIGURED")

    def test_missing_and_invalid_images_have_safe_codes(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            service = ModelService(ModelConfig(root / "missing.pth", root / "missing.json", "test", "test", 224, "mobilenetv2", "cpu"))
            self.assertEqual(service.predict(root / "missing.png")["error"]["code"], "IMAGE_NOT_FOUND")
            invalid = root / "invalid.png"
            invalid.write_bytes(b"not-an-image")
            self.assertEqual(service.predict(invalid)["error"]["code"], "INVALID_IMAGE")

    def test_metadata_never_exposes_paths_and_configuration_is_false(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            service = ModelService(ModelConfig(root / "model.pth", root / "class_names.json", "custom", "v1", 224, "future-provider", "cpu"))
            metadata = service.metadata()
            self.assertFalse(metadata["configured"])
            self.assertEqual(metadata["model"], {"name": "custom", "version": "v1", "provider": "future-provider"})
            self.assertNotIn("model_path", json.dumps(metadata))

    def test_environment_paths_are_resolved_without_changing_the_contract(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            with patch.dict("os.environ", {"MODEL_PATH": "~/verified/model.pth", "CLASS_NAMES_PATH": "~/verified/classes.json", "MODEL_NAME": "custom", "MODEL_VERSION": "v1", "MODEL_INPUT_SIZE": "224", "MODEL_PROVIDER": "mobilenetv2"}, clear=False):
                config = ModelConfig.from_env()
            self.assertTrue(config.model_path.is_absolute())
            self.assertTrue(config.class_names_path.is_absolute())
            self.assertEqual(config.input_size, 224)


if __name__ == "__main__":
    unittest.main()
