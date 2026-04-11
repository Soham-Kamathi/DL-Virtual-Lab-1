from pathlib import Path
from typing import Any, Dict, List, Tuple


PresetKey = Tuple[float, int]


def _backend_dir() -> Path:
    return Path(__file__).resolve().parents[2]


def build_preset_registry() -> Dict[PresetKey, Dict[str, Any]]:
    backend_dir = _backend_dir()
    logs_dir = backend_dir / "logs" / "presets"
    outputs_dir = backend_dir / "outputs"

    return {
        (0.1, 32): {
            "id": "preset_1",
            "noise_factor": 0.1,
            "latent_dim": 32,
            "metrics_path": logs_dir / "dae_metrics_nf0.1_ld32.json",
            "images": {
                "original": "/outputs/preset_1/original.png",
                "noisy": "/outputs/preset_1/noisy.png",
                "denoised": "/outputs/preset_1/denoised.png",
            },
            "image_files": {
                "original": outputs_dir / "preset_1" / "original.png",
                "noisy": outputs_dir / "preset_1" / "noisy.png",
                "denoised": outputs_dir / "preset_1" / "denoised.png",
            },
        },
        (0.3, 64): {
            "id": "preset_2",
            "noise_factor": 0.3,
            "latent_dim": 64,
            "metrics_path": logs_dir / "dae_metrics_nf0.3_ld64.json",
            "images": {
                "original": "/outputs/preset_2/original.png",
                "noisy": "/outputs/preset_2/noisy.png",
                "denoised": "/outputs/preset_2/denoised.png",
            },
            "image_files": {
                "original": outputs_dir / "preset_2" / "original.png",
                "noisy": outputs_dir / "preset_2" / "noisy.png",
                "denoised": outputs_dir / "preset_2" / "denoised.png",
            },
        },
        (0.5, 128): {
            "id": "preset_3",
            "noise_factor": 0.5,
            "latent_dim": 128,
            "metrics_path": logs_dir / "dae_metrics_nf0.5_ld128.json",
            "images": {
                "original": "/outputs/preset_3/original.png",
                "noisy": "/outputs/preset_3/noisy.png",
                "denoised": "/outputs/preset_3/denoised.png",
            },
            "image_files": {
                "original": outputs_dir / "preset_3" / "original.png",
                "noisy": outputs_dir / "preset_3" / "noisy.png",
                "denoised": outputs_dir / "preset_3" / "denoised.png",
            },
        },
    }


PRESET_REGISTRY = build_preset_registry()


def _distance_to_preset(
    noise_factor: float,
    latent_dim: int,
    preset_noise: float,
    preset_latent: int,
) -> float:
    noise_span = 0.5 - 0.1
    latent_span = 128 - 32

    noise_delta = (noise_factor - preset_noise) / noise_span
    latent_delta = (latent_dim - preset_latent) / latent_span
    return (noise_delta * noise_delta) + (latent_delta * latent_delta)


def find_nearest_presets(noise_factor: float, latent_dim: int, k: int = 2) -> List[Dict[str, Any]]:
    if not PRESET_REGISTRY:
        raise ValueError("Preset registry is empty")

    ranked: List[Dict[str, Any]] = []
    for (preset_noise, preset_latent), preset in PRESET_REGISTRY.items():
        ranked.append(
            {
                **preset,
                "distance": round(
                    _distance_to_preset(
                        noise_factor=noise_factor,
                        latent_dim=latent_dim,
                        preset_noise=preset_noise,
                        preset_latent=preset_latent,
                    ),
                    6,
                ),
            }
        )

    ranked.sort(key=lambda item: item["distance"])
    return ranked[: max(1, k)]


def find_closest_preset(noise_factor: float, latent_dim: int) -> Dict[str, Any]:
    """Return the nearest preset using normalized Euclidean distance."""
    return find_nearest_presets(noise_factor=noise_factor, latent_dim=latent_dim, k=1)[0]
