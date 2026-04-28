import json
import argparse
from pathlib import Path
from typing import Dict, List

import numpy as np
import torch
from skimage.metrics import peak_signal_noise_ratio, structural_similarity
from torch import nn, optim
from torchvision.utils import save_image

from app.services.data_loader import add_gaussian_noise, get_data_loaders
from app.services.denoising_autoencoder import DenoisingAutoencoder


BACKEND_DIR = Path(__file__).resolve().parents[2]
MODELS_DIR = BACKEND_DIR / "models"
LOGS_DIR = BACKEND_DIR / "logs"
OUTPUTS_DIR = BACKEND_DIR / "outputs"
BEST_MODEL_PATH = MODELS_DIR / "dae.pth"


def _ensure_output_dirs() -> None:
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    LOGS_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)


def _compute_batch_metrics(targets: torch.Tensor, predictions: torch.Tensor) -> Dict[str, float]:
    """Compute average PSNR and SSIM for a batch."""
    target_np = targets.detach().cpu().numpy()
    pred_np = predictions.detach().cpu().numpy()

    psnr_scores: List[float] = []
    ssim_scores: List[float] = []

    for i in range(target_np.shape[0]):
        clean_img = target_np[i, 0]
        denoised_img = pred_np[i, 0]

        psnr_scores.append(peak_signal_noise_ratio(clean_img, denoised_img, data_range=1.0))
        ssim_scores.append(structural_similarity(clean_img, denoised_img, data_range=1.0))

    return {
        "psnr": float(np.mean(psnr_scores)),
        "ssim": float(np.mean(ssim_scores)),
    }


def _save_sample_outputs(
    clean_images: torch.Tensor,
    noisy_images: torch.Tensor,
    denoised_images: torch.Tensor,
) -> None:
    """Save one example clean/noisy/denoised image triplet."""
    save_image(clean_images[0].detach().cpu(), OUTPUTS_DIR / "original_image.png")
    save_image(noisy_images[0].detach().cpu(), OUTPUTS_DIR / "noisy_image.png")
    save_image(denoised_images[0].detach().cpu(), OUTPUTS_DIR / "denoised_image.png")


def train_dae(
    epochs: int = 5,
    batch_size: int = 128,
    latent_dim: int = 64,
    noise_factor: float = 0.3,
    learning_rate: float = 1e-3,
    use_gpu: bool = True,
) -> Dict[str, List[float]]:
    """Train denoising autoencoder and save model, metrics, and sample outputs."""
    _ensure_output_dirs()

    if use_gpu:
        if not torch.cuda.is_available():
            raise RuntimeError("GPU requested, but CUDA is not available on this machine.")
        device = torch.device("cuda")
    else:
        device = torch.device("cpu")

    if device.type == "cuda":
        torch.backends.cudnn.benchmark = True
        print(f"Using GPU: {torch.cuda.get_device_name(0)}")
    else:
        print("Using CPU")

    train_loader, test_loader = get_data_loaders(batch_size=batch_size)

    model = DenoisingAutoencoder(latent_dim=latent_dim).to(device)
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=learning_rate)

    history: Dict[str, List[float]] = {
        "epochs": [],
        "train_loss": [],
        "val_loss": [],
        "psnr": [],
        "ssim": [],
    }
    best_val_loss = float("inf")
    best_epoch = -1

    for epoch in range(1, epochs + 1):
        model.train()
        running_train_loss = 0.0

        for clean_images, _ in train_loader:
            clean_images = clean_images.to(device, non_blocking=True)
            noisy_images = add_gaussian_noise(clean_images, noise_factor=noise_factor)

            optimizer.zero_grad()
            denoised_images = model(noisy_images)
            loss = criterion(denoised_images, clean_images)
            loss.backward()
            optimizer.step()

            running_train_loss += loss.item()

        avg_train_loss = running_train_loss / len(train_loader)

        model.eval()
        running_val_loss = 0.0
        epoch_psnr: List[float] = []
        epoch_ssim: List[float] = []

        sample_clean = None
        sample_noisy = None
        sample_denoised = None

        with torch.no_grad():
            for clean_images, _ in test_loader:
                clean_images = clean_images.to(device, non_blocking=True)
                noisy_images = add_gaussian_noise(clean_images, noise_factor=noise_factor)
                denoised_images = model(noisy_images)

                val_loss = criterion(denoised_images, clean_images)
                running_val_loss += val_loss.item()

                batch_metrics = _compute_batch_metrics(clean_images, denoised_images)
                epoch_psnr.append(batch_metrics["psnr"])
                epoch_ssim.append(batch_metrics["ssim"])

                if sample_clean is None:
                    sample_clean = clean_images
                    sample_noisy = noisy_images
                    sample_denoised = denoised_images

        avg_val_loss = running_val_loss / len(test_loader)
        avg_psnr = float(np.mean(epoch_psnr))
        avg_ssim = float(np.mean(epoch_ssim))

        history["epochs"].append(epoch)
        history["train_loss"].append(float(avg_train_loss))
        history["val_loss"].append(float(avg_val_loss))
        history["psnr"].append(avg_psnr)
        history["ssim"].append(avg_ssim)

        if avg_val_loss < best_val_loss:
            best_val_loss = avg_val_loss
            best_epoch = epoch
            torch.save(model.state_dict(), BEST_MODEL_PATH)
            print(f"Saved best model at epoch {epoch} with val loss {avg_val_loss:.6f}")

        print(
            f"Epoch {epoch}/{epochs} | "
            f"Train Loss: {avg_train_loss:.6f} | "
            f"Val Loss: {avg_val_loss:.6f} | "
            f"PSNR: {avg_psnr:.4f} | "
            f"SSIM: {avg_ssim:.4f}"
        )

        if sample_clean is not None and sample_noisy is not None and sample_denoised is not None:
            _save_sample_outputs(sample_clean, sample_noisy, sample_denoised)

    print(f"Best checkpoint: epoch {best_epoch}, val loss {best_val_loss:.6f}")

    history["best_epoch"] = [best_epoch]
    history["best_val_loss"] = [float(best_val_loss)]

    with (LOGS_DIR / "dae_metrics.json").open("w", encoding="utf-8") as f:
        json.dump(history, f, indent=2)

    return history


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train denoising autoencoder on Fashion-MNIST")
    parser.add_argument("--epochs", type=int, default=5)
    parser.add_argument("--batch-size", type=int, default=128)
    parser.add_argument("--latent-dim", type=int, default=64)
    parser.add_argument("--noise-factor", type=float, default=0.3)
    parser.add_argument("--lr", type=float, default=1e-3)
    parser.add_argument("--cpu", action="store_true", help="Force CPU training")
    args = parser.parse_args()

    train_dae(
        epochs=args.epochs,
        batch_size=args.batch_size,
        latent_dim=args.latent_dim,
        noise_factor=args.noise_factor,
        learning_rate=args.lr,
        use_gpu=not args.cpu,
    )
