from fastapi import APIRouter, HTTPException, Request

from app.schemas.experiment_schema import RunExperimentRequest
from app.services.inference_service import ArtifactNotFoundError, InferenceService

router = APIRouter(tags=["Experiment"])


def _get_inference_service(request: Request) -> InferenceService:
    service = getattr(request.app.state, "inference_service", None)
    if service is None:
        raise HTTPException(status_code=500, detail="Inference service is not initialized")
    if service.startup_error:
        raise HTTPException(status_code=503, detail=service.startup_error)
    return service


import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
import data_loader
import model
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List

class MLPParams(BaseModel):
    hidden_layers: List[int] = [128]
    activation: str = "relu"
    solver: str = "adam"
    alpha: float = 0.0001
    batch_size: int = 32
    epochs: int = 10
    learning_rate: float = 0.001
    dataset: str = "mnist_784"

def _select_required_metrics(metrics: dict) -> dict:
    keys = ["epochs", "train_loss", "val_loss", "psnr", "ssim"]
    return {key: metrics.get(key, []) for key in keys}

@router.get("/api/dataset/preview")
def preview_dataset(name: str = "mnist_784", n: int = 16):
    try:
        samples = data_loader.get_preview_samples(name, n_samples=n)
        return {"samples": samples}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

@router.get("/")
def health_check(request: Request) -> dict[str, bool | str]:
    service = _get_inference_service(request)
    return {"status": "ok", "model_loaded": service.is_model_loaded}


@router.get("/models")
def get_models(request: Request) -> list[str]:
    service = _get_inference_service(request)
    return service.get_available_models()


@router.get("/metrics")
def get_metrics(request: Request, model_type: str = "denoising_autoencoder"):
    service = _get_inference_service(request)
    if model_type not in service.get_available_models():
        raise HTTPException(status_code=400, detail="Unsupported model_type")
    try:
        return _select_required_metrics(service.get_saved_metrics(model_type=model_type))
    except ArtifactNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/sample-images")
def get_sample_images(request: Request, model_type: str = "denoising_autoencoder") -> dict[str, str]:
    service = _get_inference_service(request)
    if model_type not in service.get_available_models():
        raise HTTPException(status_code=400, detail="Unsupported model_type")
    try:
        return service.get_sample_image_urls(model_type=model_type)
    except ArtifactNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post("/run-experiment")
def run_experiment(payload: RunExperimentRequest, request: Request):
    service = _get_inference_service(request)

    if payload.model_type not in service.get_available_models():
        raise HTTPException(status_code=400, detail="Unsupported model_type")

    try:
        artifacts = service.get_experiment_artifacts(
            model_type=payload.model_type,
            noise_factor=payload.noise_factor,
            latent_dim=payload.latent_dim,
        )
        metrics = _select_required_metrics(artifacts["metrics"])
        images = artifacts["images"]
        secondary_images = artifacts.get("secondary_images")
    except ArtifactNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    return {
        "status": "success",
        "metrics": metrics,
        "images": images,
        "secondary_images": secondary_images,
        "selected_preset": artifacts["selected_preset"],
        "requested_params": {
            "model_type": payload.model_type,
            "noise_factor": payload.noise_factor,
            "latent_dim": payload.latent_dim,
        },
    }


@router.post("/api/mlp/run-stream")
def run_simulation_stream(params: MLPParams):
    """SSE endpoint that streams epoch-by-epoch MLP training progress."""
    try:
        X_train, X_test, y_train, y_test = data_loader.get_dataset(params.dataset)

        def event_generator():
            yield from model.train_mlp_streaming(
                X_train,
                y_train,
                X_test,
                y_test,
                params.model_dump(),
            )

        return StreamingResponse(
            event_generator(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            },
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
