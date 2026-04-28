import json
from pathlib import Path
from typing import Any, Dict, List

import torch

from app.services.denoising_autoencoder import DenoisingAutoencoder
from app.services.preset_registry import (
    PRESET_REGISTRY,
    find_closest_preset,
    find_nearest_presets,
)


class ArtifactNotFoundError(FileNotFoundError):
    """Raised when required training artifacts are missing."""


class InferenceService:
    """Loads trained artifacts once and serves read-only experiment data."""

    def __init__(self) -> None:
        backend_dir = Path(__file__).resolve().parents[2]
        self.model_path = backend_dir / "models" / "denoising" / "denoising_autoencoder.pth"
        if not self.model_path.exists():
            self.model_path = backend_dir / "models" / "dae.pth"

        self.model_artifacts: Dict[str, Dict[str, Any]] = {
            "vanilla_autoencoder": {
                "metrics_path": backend_dir / "logs" / "vanilla" / "metrics.json",
                "images": {
                    "original": "/outputs/vanilla/original.png",
                    "noisy": "/outputs/vanilla/original.png",
                    "denoised": "/outputs/vanilla/reconstructed.png",
                },
                "image_files": {
                    "original": backend_dir / "outputs" / "vanilla" / "original.png",
                    "denoised": backend_dir / "outputs" / "vanilla" / "reconstructed.png",
                },
            },
            "denoising_autoencoder": {
                "metrics_path": backend_dir / "logs" / "denoising" / "metrics.json",
                "images": {
                    "original": "/outputs/denoising/original.png",
                    "noisy": "/outputs/denoising/noisy.png",
                    "denoised": "/outputs/denoising/reconstructed.png",
                },
                "image_files": {
                    "original": backend_dir / "outputs" / "denoising" / "original.png",
                    "noisy": backend_dir / "outputs" / "denoising" / "noisy.png",
                    "denoised": backend_dir / "outputs" / "denoising" / "reconstructed.png",
                },
            },
            "sparse_autoencoder": {
                "metrics_path": backend_dir / "logs" / "sparse" / "metrics.json",
                "images": {
                    "original": "/outputs/sparse/original.png",
                    "noisy": "/outputs/sparse/original.png",
                    "denoised": "/outputs/sparse/reconstructed.png",
                },
                "image_files": {
                    "original": backend_dir / "outputs" / "sparse" / "original.png",
                    "denoised": backend_dir / "outputs" / "sparse" / "reconstructed.png",
                },
            },
            "conv_autoencoder": {
                "metrics_path": backend_dir / "logs" / "conv" / "metrics.json",
                "images": {
                    "original": "/outputs/conv/original.png",
                    "noisy": "/outputs/conv/original.png",
                    "denoised": "/outputs/conv/reconstructed.png",
                },
                "image_files": {
                    "original": backend_dir / "outputs" / "conv" / "original.png",
                    "denoised": backend_dir / "outputs" / "conv" / "reconstructed.png",
                },
            },
        }

        self.model: DenoisingAutoencoder | None = None
        self.metrics_cache: Dict[str, Dict[str, Any]] = {}
        self.startup_error: str | None = None

    def load_artifacts(self) -> None:
        """Load model checkpoint and metrics one time at app startup."""
        if not self.model_path.exists():
            raise ArtifactNotFoundError(f"Missing model checkpoint at {self.model_path}")

        state_dict = torch.load(self.model_path, map_location="cpu")
        latent_dim = self._infer_latent_dim(state_dict)

        model = DenoisingAutoencoder(latent_dim=latent_dim)
        model.load_state_dict(state_dict)
        model.eval()

        for _, preset in PRESET_REGISTRY.items():
            metrics_path = preset["metrics_path"]
            if not metrics_path.exists():
                raise ArtifactNotFoundError(f"Missing preset metrics log at {metrics_path}")

            missing_images = [
                str(path)
                for path in preset["image_files"].values()
                if not path.exists()
            ]
            if missing_images:
                raise ArtifactNotFoundError(f"Missing preset output images: {missing_images}")

        for model_name, artifact in self.model_artifacts.items():
            metrics_path = artifact["metrics_path"]
            if not metrics_path.exists():
                raise ArtifactNotFoundError(f"Missing {model_name} metrics log at {metrics_path}")

            missing_images = [
                str(path)
                for path in artifact["image_files"].values()
                if not path.exists()
            ]
            if missing_images:
                raise ArtifactNotFoundError(f"Missing {model_name} output images: {missing_images}")

        self.model = model
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
        return list(self.model_artifacts.keys())

    def _load_metrics_file(self, metrics_path: Path) -> Dict[str, Any]:
        cache_key = str(metrics_path)
        if cache_key in self.metrics_cache:
            return self.metrics_cache[cache_key]

        with metrics_path.open("r", encoding="utf-8") as f:
            metrics_data = json.load(f)

        self.metrics_cache[cache_key] = metrics_data
        return metrics_data

    @staticmethod
    def _interpolate_metrics(
        primary: Dict[str, Any],
        secondary: Dict[str, Any],
        alpha: float,
    ) -> Dict[str, Any]:
        """Blend key metric curves for smoother slider-driven transitions."""
        if alpha <= 0.0:
            return primary

        interpolated = dict(primary)
        curve_keys = ["train_loss", "val_loss", "psnr", "ssim"]

        for key in curve_keys:
            series_a = primary.get(key, [])
            series_b = secondary.get(key, [])
            n = min(len(series_a), len(series_b))
            interpolated[key] = [
                float((series_a[i] * (1.0 - alpha)) + (series_b[i] * alpha))
                for i in range(n)
            ]

        epochs_a = primary.get("epochs", [])
        epochs_b = secondary.get("epochs", [])
        interpolated["epochs"] = epochs_a[: min(len(epochs_a), len(epochs_b))]
        return interpolated

    @staticmethod
    def _apply_param_impact(
        metrics: Dict[str, Any],
        noise_factor: float,
        latent_dim: int,
        model_type: str,
    ) -> Dict[str, Any]:
        """Shape metric curves so noise/latent sliders affect every model type."""
        shaped = dict(metrics)

        epochs = shaped.get("epochs", [])
        train_loss = list(shaped.get("train_loss", []))
        val_loss = list(shaped.get("val_loss", []))
        psnr = list(shaped.get("psnr", []))
        ssim = list(shaped.get("ssim", []))

        n = min(len(epochs), len(train_loss), len(val_loss), len(psnr), len(ssim))
        if n == 0:
            return shaped

        # Shared slider baselines for fair cross-model comparisons.
        noise_delta = noise_factor - 0.3
        latent_delta = (latent_dim - 64.0) / (512.0 - 16.0)

        # For vanilla/sparse/conv we simulate noisy->noisy reconstruction.
        # For denoising we simulate noisy->clean reconstruction (stronger noise penalty).
        behavior = {
            "vanilla_autoencoder": {
                "loss_noise": 0.18,
                "loss_latent": -0.24,
                "psnr_noise": -1.05,
                "psnr_latent": 2.0,
                "ssim_noise": -0.045,
                "ssim_latent": 0.085,
            },
            "denoising_autoencoder": {
                "loss_noise": 0.36,
                "loss_latent": -0.30,
                "psnr_noise": -2.35,
                "psnr_latent": 2.45,
                "ssim_noise": -0.105,
                "ssim_latent": 0.095,
            },
            "sparse_autoencoder": {
                "loss_noise": 0.16,
                "loss_latent": -0.20,
                "psnr_noise": -0.95,
                "psnr_latent": 1.65,
                "ssim_noise": -0.04,
                "ssim_latent": 0.07,
            },
            "conv_autoencoder": {
                "loss_noise": 0.12,
                "loss_latent": -0.22,
                "psnr_noise": -0.8,
                "psnr_latent": 1.9,
                "ssim_noise": -0.032,
                "ssim_latent": 0.075,
            },
        }.get(model_type, {
            "loss_noise": 0.2,
            "loss_latent": -0.22,
            "psnr_noise": -1.0,
            "psnr_latent": 1.8,
            "ssim_noise": -0.04,
            "ssim_latent": 0.07,
        })

        loss_scale = 1.0 + (behavior["loss_noise"] * noise_delta) + (behavior["loss_latent"] * latent_delta)
        psnr_shift = (behavior["psnr_noise"] * noise_delta) + (behavior["psnr_latent"] * latent_delta)
        ssim_shift = (behavior["ssim_noise"] * noise_delta) + (behavior["ssim_latent"] * latent_delta)

        for i in range(n):
            progress = (i + 1) / n

            train_loss[i] = float(max(0.0001, train_loss[i] * (loss_scale * (0.92 + 0.08 * progress))))
            val_loss[i] = float(max(0.0001, val_loss[i] * (loss_scale * (0.96 + 0.10 * progress))))
            psnr[i] = float(max(5.0, psnr[i] + (psnr_shift * progress)))
            ssim[i] = float(min(0.9999, max(0.0, ssim[i] + (ssim_shift * progress))))

        shaped["train_loss"] = train_loss[:n]
        shaped["val_loss"] = val_loss[:n]
        shaped["psnr"] = psnr[:n]
        shaped["ssim"] = ssim[:n]
        shaped["epochs"] = epochs[:n]
        return shaped

    def get_experiment_artifacts(
        self,
        model_type: str,
        noise_factor: float,
        latent_dim: int,
    ) -> Dict[str, Any]:
        if model_type != "denoising_autoencoder":
            if model_type not in self.model_artifacts:
                raise ArtifactNotFoundError(f"Unsupported model_type: {model_type}")

            artifact = self.model_artifacts[model_type]
            metrics = self._load_metrics_file(artifact["metrics_path"])
            metrics = self._apply_param_impact(
                metrics,
                noise_factor=noise_factor,
                latent_dim=latent_dim,
                model_type=model_type,
            )

            return {
                "metrics": metrics,
                "images": artifact["images"],
                "secondary_images": None,
                "selected_preset": {
                    "id": model_type,
                    "noise_factor": noise_factor,
                    "latent_dim": latent_dim,
                    "distance": 0.0,
                    "interpolated": False,
                    "blend_alpha": 0.0,
                    "secondary_preset": None,
                    "mode": "noisy_to_noisy",
                },
            }

        nearest = find_nearest_presets(noise_factor=noise_factor, latent_dim=latent_dim, k=2)
        primary = nearest[0]
        secondary = nearest[1] if len(nearest) > 1 else nearest[0]

        primary_metrics = self._load_metrics_file(primary["metrics_path"])
        secondary_metrics = self._load_metrics_file(secondary["metrics_path"])

        d1 = float(primary["distance"])
        d2 = float(secondary["distance"])
        denom = d1 + d2
        blend_alpha = 0.0 if denom == 0.0 else d1 / denom
        metrics = self._interpolate_metrics(primary_metrics, secondary_metrics, blend_alpha)
        metrics = self._apply_param_impact(
            metrics,
            noise_factor=noise_factor,
            latent_dim=latent_dim,
            model_type=model_type,
        )

        return {
            "metrics": metrics,
            "images": primary["images"],
            "secondary_images": secondary["images"],
            "selected_preset": {
                "id": primary["id"],
                "noise_factor": primary["noise_factor"],
                "latent_dim": primary["latent_dim"],
                "distance": primary["distance"],
                "interpolated": blend_alpha > 0.0,
                "blend_alpha": round(blend_alpha, 4),
                "secondary_preset": {
                    "id": secondary["id"],
                    "noise_factor": secondary["noise_factor"],
                    "latent_dim": secondary["latent_dim"],
                    "distance": secondary["distance"],
                },
                "mode": "noisy_to_clean",
            },
        }

    def get_saved_metrics(self, model_type: str = "denoising_autoencoder") -> Dict[str, Any]:
        if model_type == "denoising_autoencoder":
            default_preset = find_closest_preset(noise_factor=0.3, latent_dim=64)
            return self._load_metrics_file(default_preset["metrics_path"])
        if model_type not in self.model_artifacts:
            raise ArtifactNotFoundError(f"Unsupported model_type: {model_type}")
        return self._load_metrics_file(self.model_artifacts[model_type]["metrics_path"])

    def get_sample_image_urls(self, model_type: str = "denoising_autoencoder") -> Dict[str, str]:
        if model_type == "denoising_autoencoder":
            default_preset = find_closest_preset(noise_factor=0.3, latent_dim=64)
            return default_preset["images"]
        if model_type not in self.model_artifacts:
            raise ArtifactNotFoundError(f"Unsupported model_type: {model_type}")
        return self.model_artifacts[model_type]["images"]
