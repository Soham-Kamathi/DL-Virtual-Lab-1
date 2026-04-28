import json
import time
from pathlib import Path
from typing import Dict, List, Tuple

import numpy as np
import torch
from skimage.metrics import peak_signal_noise_ratio, structural_similarity
from torchvision.utils import save_image
from tqdm import tqdm


def backend_dir() -> Path:
    return Path(__file__).resolve().parents[3]


def get_device(use_gpu: bool = True) -> torch.device:
    if use_gpu and torch.cuda.is_available():
        return torch.device("cuda")
    return torch.device("cpu")


def ensure_output_dirs(model_name: str) -> Tuple[Path, Path, Path]:
    root = backend_dir()
    model_dir = root / "models" / model_name
    log_dir = root / "logs" / model_name
    output_dir = root / "outputs" / model_name

    model_dir.mkdir(parents=True, exist_ok=True)
    log_dir.mkdir(parents=True, exist_ok=True)
    output_dir.mkdir(parents=True, exist_ok=True)
    return model_dir, log_dir, output_dir


def compute_batch_metrics(targets: torch.Tensor, predictions: torch.Tensor) -> Dict[str, float]:
    target_np = targets.detach().cpu().numpy()
    pred_np = predictions.detach().cpu().numpy()

    psnr_scores: List[float] = []
    ssim_scores: List[float] = []

    for i in range(target_np.shape[0]):
        clean_img = target_np[i, 0]
        recon_img = pred_np[i, 0]
        psnr_scores.append(peak_signal_noise_ratio(clean_img, recon_img, data_range=1.0))
        ssim_scores.append(structural_similarity(clean_img, recon_img, data_range=1.0))

    return {
        "psnr": float(np.mean(psnr_scores)),
        "ssim": float(np.mean(ssim_scores)),
    }


def default_history() -> Dict[str, List[float]]:
    return {
        "epochs": [],
        "train_loss": [],
        "val_loss": [],
        "psnr": [],
        "ssim": [],
    }


def save_history(history: Dict[str, List[float]], log_dir: Path, filename: str = "metrics.json") -> None:
    with (log_dir / filename).open("w", encoding="utf-8") as f:
        json.dump(history, f, indent=2)


def save_sample_outputs(
    output_dir: Path,
    original: torch.Tensor,
    reconstructed: torch.Tensor,
    noisy: torch.Tensor | None = None,
) -> None:
    save_image(original[0].detach().cpu(), output_dir / "original.png")
    if noisy is not None:
        save_image(noisy[0].detach().cpu(), output_dir / "noisy.png")
    save_image(reconstructed[0].detach().cpu(), output_dir / "reconstructed.png")


def epoch_progress(iterable, description: str):
    return tqdm(iterable, desc=description, leave=False)


def started_at() -> float:
    return time.perf_counter()


def elapsed_seconds(start: float) -> float:
    return time.perf_counter() - start
