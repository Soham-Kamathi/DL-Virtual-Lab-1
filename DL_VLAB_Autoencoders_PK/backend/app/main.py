from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.routes.experiment_routes import router as experiment_router
from app.services.inference_service import ArtifactNotFoundError, InferenceService


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load model and logs one time at startup for efficient inference APIs."""
    inference_service = InferenceService()
    try:
        inference_service.load_artifacts()
    except (ArtifactNotFoundError, ValueError, RuntimeError) as exc:
        inference_service.startup_error = str(exc)
    app.state.inference_service = inference_service
    yield

app = FastAPI(
    title="Medical Imaging Noise Reduction Virtual Lab API",
    version="0.1.0",
    description="Backend API for running denoising autoencoder experiments.",
    lifespan=lifespan,
)

# CORS is needed so the Next.js frontend can call this API from another origin.
# Restrict this list in production to your deployed frontend domains only.
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

backend_dir = Path(__file__).resolve().parents[1]
outputs_dir = backend_dir / "outputs"

app.mount("/outputs", StaticFiles(directory=outputs_dir), name="outputs")

app.include_router(experiment_router)
