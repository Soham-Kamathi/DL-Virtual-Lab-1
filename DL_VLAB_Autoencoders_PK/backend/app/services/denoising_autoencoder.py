import torch
from torch import nn


class DenoisingAutoencoder(nn.Module):
    """Fully connected denoising autoencoder for 28x28 grayscale images."""

    def __init__(self, latent_dim: int = 64) -> None:
        super().__init__()
        self.encoder = nn.Sequential(
            nn.Linear(28 * 28, 256),
            nn.ReLU(),
            nn.Linear(256, latent_dim),
            nn.ReLU(),
        )
        self.decoder = nn.Sequential(
            nn.Linear(latent_dim, 256),
            nn.ReLU(),
            nn.Linear(256, 28 * 28),
            nn.Sigmoid(),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        batch_size = x.size(0)
        x = x.view(batch_size, -1)
        x = self.encoder(x)
        x = self.decoder(x)
        x = x.view(batch_size, 1, 28, 28)
        return x
