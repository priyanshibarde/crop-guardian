# Crop Guardian inference service

This is a localhost-only Python inference service. Express remains the public
API and sends a generated `imageKey`; this service resolves that key only
under `IMAGE_ROOT`. It never accepts an external filesystem path and never
returns one to the frontend.

The service now separates model-independent lifecycle code in
`model_service.py` from the provider contract in `model_provider.py`.
MobileNetV2 is the current provider implementation, but no model is enabled
unless its assets are configured and validated. A missing or invalid model or
class mapping returns `status: unavailable` with `MODEL_NOT_CONFIGURED`.

## Local setup (Windows PowerShell)

```powershell
cd C:\Users\HP\AI-Project\server\inference
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python app.py
```

The service binds to `127.0.0.1:5001` by default. The Node backend and React
frontend are started separately. Python is not installed or managed by the
Node project.

## Configuration

Environment variables may be set before `python app.py`:

```powershell
$env:MODEL_PATH='C:\path\to\verified-model.pth'
$env:CLASS_NAMES_PATH='C:\path\to\class_names.json'
$env:MODEL_NAME='crop-guardian-custom'
$env:MODEL_VERSION='2026.08.0'
$env:MODEL_INPUT_SIZE='224'
$env:MODEL_PROVIDER='mobilenetv2'
$env:IMAGE_ROOT='C:\Users\HP\AI-Project\server\uploads'
$env:INFERENCE_PORT='5001'
```

No model is downloaded automatically. Do not add model binaries, class
mapping files, uploaded images, or secrets to Git.

## Required future model contract

When Crop Guardian supplies its own verified model, provide:

1. A model file at `MODEL_PATH`. The current provider expects a PyTorch
   MobileNetV2-compatible checkpoint whose classifier output count matches the
   class mapping. A future provider may support another format, but it must
   implement the same provider interface.
2. A UTF-8 `class_names.json` at `CLASS_NAMES_PATH` containing a JSON array of
   unique, non-empty strings in the exact output-index order:

```json
["Crop___Class_0", "Crop___Class_1"]
```

   The order must come from the model training/export process. It must never
   be guessed from filenames or reconstructed manually.
3. Documented input dimensions. The current default is `224`, configured by
   `MODEL_INPUT_SIZE`.
4. Documented preprocessing. The current provider converts images to RGB,
   resizes deterministically to the configured square size, converts to a
   tensor, and applies ImageNet normalization with means
   `[0.485, 0.456, 0.406]` and standard deviations
   `[0.229, 0.224, 0.225]`.
5. A model version tied to an immutable training/export revision in
   `MODEL_VERSION`.

Before enabling a model, verify the checkpoint, class-index order, input
contract, and output shape independently. The service validates that the
mapping is a non-empty array of unique strings and that its count matches the
provider output. It refuses to predict on configuration or output errors.

## Local checks

From this directory:

```powershell
python -m py_compile app.py model_service.py model_provider.py test_model_service.py
python -m unittest -v test_model_service.py
```

With the service running:

```powershell
Invoke-RestMethod http://127.0.0.1:5001/health
Invoke-RestMethod http://127.0.0.1:5001/model
```

`POST /predict` accepts `{ "imageKey": "generated-file-key.png" }` only.
Missing assets return `MODEL_NOT_CONFIGURED`; no disease, confidence, or
treatment is fabricated.

## Limitations

Any pretrained model is dataset-dependent. Lighting, backgrounds, image
quality, crop variety, and field conditions can change performance. Outputs
are not guaranteed agricultural advice. A future Crop Guardian model should
be trained and validated for the application's target crops and real-world
conditions.
