# Crop Guardian inference service

This is a localhost-only Python inference service for Phase 4B. It uses the
Daksh159 MobileNetV2 model only when both the model weights and a verified
`class_names.json` are available. The current Hugging Face repository model
card mentions that file, but the repository listing currently does not provide
it, so the service intentionally returns `MODEL_NOT_CONFIGURED` until it is
verified and supplied.

The service does not accept arbitrary filesystem paths. Node sends a generated
image storage key, and this process resolves it only beneath `IMAGE_ROOT`.

## Setup in Windows PowerShell

```powershell
cd C:\Users\HP\AI-Project\server\inference
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

Do not download model files automatically at server startup. After the model
repository and class mapping have been independently verified, place the files
in `models\` or configure their absolute paths with environment variables:

```powershell
$env:MODEL_PATH='C:\path\to\mobilenetv2_plant.pth'
$env:CLASS_NAMES_PATH='C:\path\to\class_names.json'
$env:MODEL_VERSION='verified-revision'
$env:IMAGE_ROOT='C:\Users\HP\AI-Project\server\uploads'
python app.py
```

The model weights can be downloaded manually from the specified official
repository with PowerShell when you are ready:

```powershell
New-Item -ItemType Directory -Force .\models | Out-Null
Invoke-WebRequest `
  -Uri 'https://huggingface.co/Daksh159/plant-disease-mobilenetv2/resolve/main/mobilenetv2_plant.pth?download=true' `
  -OutFile .\models\mobilenetv2_plant.pth
```

Do not download or create `class_names.json` until its contents and source are
verified. The service will remain unavailable without it.

The process binds only to `127.0.0.1`. `GET /health` is available locally.
`POST /predict` accepts JSON with an internal `imageKey`, not a filesystem
path. Missing or invalid model assets return `status: unavailable` and never a
fabricated prediction.

The model is pretrained on PlantVillage-style augmented data. Its reported
validation accuracy is dataset-specific; field performance can differ due to
lighting, backgrounds, image quality, crop variety, and disease prevalence.
Predictions are not guaranteed agricultural advice. A future Crop Guardian
model should replace this implementation behind the same service boundary.
