from __future__ import annotations

import torch
from torch import nn, optim

from app.services.data_loader import get_data_loaders
from app.services.models.vanilla_autoencoder import VanillaAutoencoder
from app.services.training.utils import (
    compute_batch_metrics,
    default_history,
    elapsed_seconds,
    ensure_output_dirs,
    epoch_progress,
    get_device,
    save_history,
    save_sample_outputs,
    started_at,
)


def train_vanilla(
    epochs: int = 8,
    batch_size: int = 128,
    latent_dim: int = 64,
    learning_rate: float = 1e-3,
    use_gpu: bool = True,
) -> dict:
    model_name = "vanilla"
    model_dir, log_dir, output_dir = ensure_output_dirs(model_name)
    device = get_device(use_gpu=use_gpu)

    train_loader, val_loader = get_data_loaders(batch_size=batch_size)

    model = VanillaAutoencoder(latent_dim=latent_dim).to(device)
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=learning_rate)

    history = default_history()
    best_val_loss = float("inf")

    sample_original = None
    sample_reconstructed = None

    start = started_at()
    print(f"[Vanilla] Training on {device} for {epochs} epochs")

    for epoch in range(1, epochs + 1):
        model.train()
        running_train_loss = 0.0

        for images, _ in epoch_progress(train_loader, f"[Vanilla] Epoch {epoch}/{epochs} train"):
            images = images.to(device, non_blocking=True)

            optimizer.zero_grad()
            reconstructed = model(images)
            loss = criterion(reconstructed, images)
            loss.backward()
            optimizer.step()

            running_train_loss += loss.item()

        avg_train_loss = running_train_loss / len(train_loader)

        model.eval()
        running_val_loss = 0.0
        epoch_psnr = []
        epoch_ssim = []

        with torch.no_grad():
            for images, _ in epoch_progress(val_loader, f"[Vanilla] Epoch {epoch}/{epochs} val"):
                images = images.to(device, non_blocking=True)
                reconstructed = model(images)

                val_loss = criterion(reconstructed, images)
                running_val_loss += val_loss.item()

                batch_metrics = compute_batch_metrics(images, reconstructed)
                epoch_psnr.append(batch_metrics["psnr"])
                epoch_ssim.append(batch_metrics["ssim"])

                if sample_original is None:
                    sample_original = images
                    sample_reconstructed = reconstructed

        avg_val_loss = running_val_loss / len(val_loader)
        avg_psnr = float(sum(epoch_psnr) / len(epoch_psnr))
        avg_ssim = float(sum(epoch_ssim) / len(epoch_ssim))

        history["epochs"].append(epoch)
        history["train_loss"].append(float(avg_train_loss))
        history["val_loss"].append(float(avg_val_loss))
        history["psnr"].append(avg_psnr)
        history["ssim"].append(avg_ssim)

        torch.save(model.state_dict(), model_dir / "vanilla_autoencoder.pth")
        if avg_val_loss < best_val_loss:
            best_val_loss = avg_val_loss
            torch.save(model.state_dict(), model_dir / "best_model.pth")

        print(
            f"[Vanilla] Epoch {epoch}/{epochs} | "
            f"Train: {avg_train_loss:.6f} | Val: {avg_val_loss:.6f} | "
            f"PSNR: {avg_psnr:.4f} | SSIM: {avg_ssim:.4f}"
        )

    if sample_original is not None and sample_reconstructed is not None:
        save_sample_outputs(output_dir, sample_original, sample_reconstructed)

    save_history(history, log_dir)

    total_time = elapsed_seconds(start)
    print(f"[Vanilla] Done. Best val loss: {best_val_loss:.6f}. Time: {total_time:.2f}s")
    return history
