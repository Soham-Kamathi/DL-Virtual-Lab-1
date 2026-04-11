from typing import Literal

from pydantic import BaseModel, Field


class RunExperimentRequest(BaseModel):
    """Input payload for experiment simulation endpoint."""

    model_type: Literal["denoising_autoencoder"]
    noise_factor: float = Field(default=0.3, ge=0.0, le=1.0)
    latent_dim: int = Field(default=64, ge=2, le=512)
