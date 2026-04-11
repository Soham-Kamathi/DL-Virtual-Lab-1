import json
from pathlib import Path
from typing import Any, Dict, List

import torch

from app.services.denoising_autoencoder import DenoisingAutoencoder


class ArtifactNotFoundError(FileNotFoundError):
    """Raised when required training artifacts are missing."""


class InferenceService:
    """Loads trained artifacts once and serves read-only experiment data."""

    def __init__(self) -> None:
        backend_dir = Path(__file__).resolve().parents[2]
        self.model_path = backend_dir / "models" / "dae.pth"
        self.metrics_path = backend_dir / "logs" / "dae_metrics.json"
        self.outputs_dir = backend_dir / "outputs"

        self.model: DenoisingAutoencoder | None = None
        self.metrics: Dict[str, Any] = {}
        self.startup_error: str | None = None

    def load_artifacts(self) -> None:
        """Load model checkpoint and metrics one time at app startup."""
        if not self.model_path.exists():
            raise ArtifactNotFoundError(f"Missing model checkpoint at {self.model_path}")

        if not self.metrics_path.exists():
            raise ArtifactNotFoundError(f"Missing metrics log at {self.metrics_path}")

        state_dict = torch.load(self.model_path, map_location="cpu")
        latent_dim = self._infer_latent_dim(state_dict)

        model = DenoisingAutoencoder(latent_dim=latent_dim)
        model.load_state_dict(state_dict)
        model.eval()

        with self.metrics_path.open("r", encoding="utf-8") as f:
            metrics_data = json.load(f)

        self.model = model
        self.metrics = metrics_data
        self.startup_error = None

    @staticmethod
    def _infer_latent_dim(state_dict: Dict[str, torch.Tensor]) -> int:
        """Infer latent size from saved checkpoint weights."""
        key = "encoder.2.weight"
        if key not in state_dict:
            raise ValueError("Could not infer latent_dim from checkpoint. Missing encoder.2.weight")
        return int(state_dict[key].shape[0])

    @property
    def is_model_loaded(self) -> bool:
        return self.model is not None

    def get_available_models(self) -> List[str]:
        return ["denoising_autoencoder"]

    def get_saved_metrics(self) -> Dict[str, Any]:
        if not self.metrics:
            raise ArtifactNotFoundError("Metrics are not loaded")
        return self.metrics

    def get_sample_image_urls(self) -> Dict[str, str]:
        expected_files = [
            self.outputs_dir / "original_image.png",
            self.outputs_dir / "noisy_image.png",
            self.outputs_dir / "denoised_image.png",
        ]
        missing = [str(path) for path in expected_files if not path.exists()]
        if missing:
            raise ArtifactNotFoundError(f"Missing output images: {missing}")

        return {
            "original": "/outputs/original_image.png",
            "noisy": "/outputs/noisy_image.png",
            "denoised": "/outputs/denoised_image.png",
        }
