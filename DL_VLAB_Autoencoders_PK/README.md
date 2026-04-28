# Deep Learning Virtual Lab: Autoencoder Noise Reduction

An academic-style virtual laboratory for studying image reconstruction and denoising using autoencoders. The lab follows an IIT/VESIT virtual-lab style flow and is built for experiment-driven learning with interactive controls, visual feedback, and reproducible outputs.

![VESIT Logo](frontend/public/vesit-logo.png)

## Table of Contents

- [What This Lab Covers](#what-this-lab-covers)
- [Core Capabilities](#core-capabilities)
- [System Architecture](#system-architecture)
- [Repository Layout](#repository-layout)
- [Quick Start](#quick-start)
- [Detailed Run Guide](#detailed-run-guide)
- [API Reference](#api-reference)
- [How Experiments Are Computed](#how-experiments-are-computed)
- [Metrics and Interpretation](#metrics-and-interpretation)
- [Troubleshooting](#troubleshooting)
- [Roadmap and Extensibility](#roadmap-and-extensibility)

## What This Lab Covers

This experiment focuses on how autoencoders learn compressed latent representations and reconstruct images under noise.

You can explore:

- How reconstruction quality changes with higher/lower noise levels.
- How latent bottleneck size influences denoising fidelity.
- How different model families behave under the same slider settings.
- How PSNR/SSIM trends relate to qualitative image output quality.

## Core Capabilities

- Autoencoder variants:
  - `vanilla_autoencoder`
  - `denoising_autoencoder`
  - `sparse_autoencoder`
  - `conv_autoencoder`
- Interactive controls:
  - `model_type`
  - `noise_factor` in range `[0.0, 1.0]`
  - `latent_dim` in range `[2, 512]`
- Experiment outputs:
  - Epoch-wise `train_loss`, `val_loss`, `psnr`, `ssim`
  - Sample image sets (`original`, `noisy`, `denoised`)
  - Preset matching/interpolation metadata for denoising experiments
- Efficient API startup:
  - Artifacts are loaded once at application startup and cached for read-only experiment serving.

## System Architecture

### Frontend

- Next.js + React + TypeScript UI.
- Visualization components render metric curves and image comparisons.
- API clients in `frontend/src/lib` call FastAPI endpoints.

### Backend

- FastAPI service hosted by `backend/app/main.py`.
- Routes in `backend/app/routes/experiment_routes.py`.
- Request schema validation in `backend/app/schemas/experiment_schema.py`.
- Artifact loading, metric shaping, and preset interpolation in `backend/app/services/inference_service.py`.

### Artifact Flow

1. Backend starts and loads model + logs + output images.
2. Frontend requests available models/metrics/images.
3. User submits experiment parameters.
4. Backend returns computed metrics and image URLs.
5. Frontend renders charts and side-by-side image comparison.

## Repository Layout

```text
.
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── routes/
│   │   │   ├── experiment_routes.py
│   │   │   ├── health.py
│   │   │   └── models.py
│   │   ├── schemas/
│   │   │   └── experiment_schema.py
│   │   └── services/
│   │       ├── inference_service.py
│   │       ├── preset_registry.py
│   │       ├── denoising_autoencoder.py
│   │       └── ...
│   ├── requirements.txt
│   └── ...
├── frontend/
│   ├── src/app/
│   ├── src/components/
│   ├── src/lib/
│   └── package.json
├── logs/
├── models/
└── outputs/
```

Note: Artifact directories can be organized under backend-scoped folders in some setups. Keep logs, model checkpoints, and output images aligned with the paths expected by `InferenceService`.

## Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm

### 1) Start Backend

```bash
cd backend
python -m venv venv

# Windows PowerShell
.\venv\Scripts\Activate.ps1

# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

Backend base URL: `http://127.0.0.1:8000`

### 2) Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend URL: `http://localhost:3000`

## Detailed Run Guide

1. Launch backend first and confirm startup without artifact errors.
2. Launch frontend and open the simulation page.
3. Choose `model_type` and set `noise_factor` and `latent_dim`.
4. Run the experiment.
5. Inspect:
   - Loss curves (`train_loss`, `val_loss`)
   - Quality curves (`psnr`, `ssim`)
   - Image outputs (`original`, `noisy`, `denoised`)
6. Compare multiple runs to understand parameter impact.

## API Reference

### Health and Metadata

- `GET /`
  - Returns service health and whether model artifacts are loaded.
- `GET /models`
  - Returns available model types.

### Metrics and Samples

- `GET /metrics?model_type=denoising_autoencoder`
  - Returns core metric arrays: `epochs`, `train_loss`, `val_loss`, `psnr`, `ssim`.
- `GET /sample-images?model_type=denoising_autoencoder`
  - Returns sample image URLs for selected model type.

### Run Experiment

- `POST /run-experiment`
- Request body:

```json
{
  "model_type": "denoising_autoencoder",
  "noise_factor": 0.3,
  "latent_dim": 64
}
```

- Response body shape:

```json
{
  "status": "success",
  "metrics": {
    "epochs": [],
    "train_loss": [],
    "val_loss": [],
    "psnr": [],
    "ssim": []
  },
  "images": {
    "original": "/outputs/...",
    "noisy": "/outputs/...",
    "denoised": "/outputs/..."
  },
  "secondary_images": null,
  "selected_preset": {
    "id": "...",
    "noise_factor": 0.3,
    "latent_dim": 64,
    "distance": 0.0,
    "interpolated": false,
    "blend_alpha": 0.0,
    "secondary_preset": null,
    "mode": "noisy_to_clean"
  },
  "requested_params": {
    "model_type": "denoising_autoencoder",
    "noise_factor": 0.3,
    "latent_dim": 64
  }
}
```

### Legacy Endpoints (Backward Compatibility)

The repository still contains legacy MLP-oriented API paths (for older experiments), including:

- `GET /api/dataset/preview`
- `POST /api/mlp/run-stream`

The current active lab flow is autoencoder-driven.

## How Experiments Are Computed

- For non-denoising variants (`vanilla`, `sparse`, `conv`):
  - Metrics and image URLs are loaded from model-specific artifact files.
  - Slider inputs still shape returned curves to reflect parameter impact.

- For `denoising_autoencoder`:
  - The service finds nearest presets for requested noise/latent values.
  - It can blend metric curves using interpolation between two closest presets.
  - Final curves are adjusted by parameter impact heuristics for interactive behavior.

This design gives responsive experimentation while preserving realistic trend behavior from saved artifacts.

## Metrics and Interpretation

- `train_loss`, `val_loss`
  - Lower is better. Divergence may indicate poor generalization.
- `PSNR` (Peak Signal-to-Noise Ratio)
  - Higher is better reconstruction fidelity.
- `SSIM` (Structural Similarity Index)
  - Closer to `1.0` indicates better structural similarity to target image.

Practical reading pattern:

1. Confirm `val_loss` generally decreases.
2. Check if PSNR rises as epochs progress.
3. Check if SSIM stabilizes near higher values.
4. Validate numerics against visual quality in image outputs.

## Troubleshooting

### Backend starts but APIs return 503

- Cause: artifacts failed to load during startup.
- Check that required files exist for metrics and output images.
- Verify model checkpoints are present and readable.

### Frontend cannot reach backend

- Confirm backend is running on `127.0.0.1:8000` or `localhost:8000`.
- Confirm no firewall/proxy is blocking local loopback.
- Ensure frontend API helper base URLs match backend host/port.

### Output images missing in UI

- Ensure expected files exist under output folders.
- Confirm FastAPI static mount for `/outputs` is active.

### Inconsistent local behavior

- Restart backend after changing artifact files.
- Clear browser cache and rerun the same parameters.

## Roadmap and Extensibility

- Add richer dataset management for denoising experiments.
- Add report export for observation-based assignments.
- Add multi-run comparison persistence in the frontend.
- Add optional live training mode beside preset-driven mode.

## Credits

Developed for the Department of Computer Engineering, VESIT, in the Virtual Lab format for academic and research use.
