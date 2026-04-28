import argparse

from app.services.training.train_conv import train_conv
from app.services.training.train_denoising import train_denoising
from app.services.training.train_sparse import train_sparse
from app.services.training.train_vanilla import train_vanilla


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Train all Fashion-MNIST autoencoder variants and save artifacts.",
    )
    parser.add_argument("--epochs", type=int, default=8, help="Training epochs for all models")
    parser.add_argument("--batch-size", type=int, default=128, help="Batch size for all models")
    parser.add_argument("--latent-dim", type=int, default=64, help="Latent dimension for FC autoencoders")
    parser.add_argument("--noise-factor", type=float, default=0.3, help="Gaussian noise factor for denoising AE")
    parser.add_argument("--lambda-sparsity", type=float, default=1e-4, help="L1 sparsity weight for sparse AE")
    parser.add_argument("--learning-rate", type=float, default=1e-3, help="Adam learning rate")
    parser.add_argument("--cpu", action="store_true", help="Force CPU training even if CUDA is available")
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    use_gpu = not args.cpu

    print("=== Training Configuration ===")
    print(f"epochs={args.epochs}")
    print(f"batch_size={args.batch_size}")
    print(f"latent_dim={args.latent_dim}")
    print(f"noise_factor={args.noise_factor}")
    print(f"lambda_sparsity={args.lambda_sparsity}")
    print(f"learning_rate={args.learning_rate}")
    print(f"use_gpu={use_gpu}")

    train_vanilla(
        epochs=args.epochs,
        batch_size=args.batch_size,
        latent_dim=args.latent_dim,
        learning_rate=args.learning_rate,
        use_gpu=use_gpu,
    )
    train_denoising(
        epochs=args.epochs,
        batch_size=args.batch_size,
        latent_dim=args.latent_dim,
        noise_factor=args.noise_factor,
        learning_rate=args.learning_rate,
        use_gpu=use_gpu,
    )
    train_sparse(
        epochs=args.epochs,
        batch_size=args.batch_size,
        latent_dim=args.latent_dim,
        lambda_sparsity=args.lambda_sparsity,
        learning_rate=args.learning_rate,
        use_gpu=use_gpu,
    )
    train_conv(
        epochs=args.epochs,
        batch_size=args.batch_size,
        learning_rate=args.learning_rate,
        use_gpu=use_gpu,
    )
