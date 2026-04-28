from typing import Tuple

import torch
from torch.utils.data import DataLoader
from torchvision import datasets, transforms


def get_data_loaders(batch_size: int = 128) -> Tuple[DataLoader, DataLoader]:
    """Create Fashion-MNIST train and test DataLoaders.

    `transforms.ToTensor()` converts images from [0, 255] uint8 to [0.0, 1.0]
    float tensors, which is the normalization range used by this pipeline.
    """
    transform = transforms.ToTensor()

    train_dataset = datasets.FashionMNIST(
        root="./data",
        train=True,
        download=True,
        transform=transform,
    )
    test_dataset = datasets.FashionMNIST(
        root="./data",
        train=False,
        download=True,
        transform=transform,
    )

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False)
    return train_loader, test_loader


def add_gaussian_noise(images: torch.Tensor, noise_factor: float = 0.3) -> torch.Tensor:
    """Add Gaussian noise and clip the tensor to the valid image range [0, 1]."""
    noise = torch.randn_like(images) * noise_factor
    noisy_images = images + noise
    return torch.clamp(noisy_images, 0.0, 1.0)
