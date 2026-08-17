"""Local-only HTTP wrapper for the Crop Guardian inference service."""

from __future__ import annotations

import json
import os
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

# Ensure inference directory is always in sys.path regardless of execution CWD
_INFERENCE_DIR = str(Path(__file__).resolve().parent)
if _INFERENCE_DIR not in sys.path:
    sys.path.insert(0, _INFERENCE_DIR)

from model_service import model_service


INFERENCE_HOST = os.getenv("INFERENCE_HOST", "0.0.0.0")
INFERENCE_PORT = int(os.getenv("INFERENCE_PORT", "5001"))
IMAGE_ROOT = Path(os.getenv("IMAGE_ROOT", str(Path(__file__).resolve().parent.parent / "uploads"))).resolve()


def response(status: str, prediction: object = None, error: object = None) -> dict[str, object]:
    result: dict[str, object] = {"status": status, "prediction": prediction, "model": model_service.metadata()["model"]}
    if error is not None:
        result["error"] = error
    return result


class Handler(BaseHTTPRequestHandler):
    def _send(self, code: int, payload: object) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:  # noqa: N802
        path = urlparse(self.path).path
        if path == "/health":
            self._send(200, model_service.health())
        elif path == "/model":
            self._send(200, model_service.metadata())
        else:
            self._send(404, response("failed", error={"code": "NOT_FOUND", "message": "Route not found."}))

    def do_POST(self) -> None:  # noqa: N802
        if urlparse(self.path).path != "/predict":
            self._send(404, response("failed", error={"code": "NOT_FOUND", "message": "Route not found."}))
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length <= 0 or length > 1024 * 1024:
                self._send(400, response("failed", error={"code": "INVALID_REQUEST", "message": "A valid image reference is required."}))
                return
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
            image_key = payload.get("imageKey") if isinstance(payload, dict) else None
            if not isinstance(image_key, str) or not image_key or Path(image_key).name != image_key:
                self._send(400, response("failed", error={"code": "INVALID_IMAGE_REFERENCE", "message": "The image reference is invalid."}))
                return
            image_path = (IMAGE_ROOT / image_key).resolve()
            if IMAGE_ROOT not in image_path.parents:
                self._send(400, response("failed", error={"code": "INVALID_IMAGE_REFERENCE", "message": "The image reference is invalid."}))
                return
            result = model_service.predict(image_path)
            self._send(200 if result["status"] in {"completed", "unavailable"} else 422, result)
        except (ValueError, json.JSONDecodeError):
            self._send(400, response("failed", error={"code": "INVALID_REQUEST", "message": "The request body is invalid."}))

    def log_message(self, _format: str, *_args: object) -> None:
        return


if __name__ == "__main__":
    print(f"Crop Guardian inference service listening on http://{INFERENCE_HOST}:{INFERENCE_PORT}")
    ThreadingHTTPServer((INFERENCE_HOST, INFERENCE_PORT), Handler).serve_forever()
