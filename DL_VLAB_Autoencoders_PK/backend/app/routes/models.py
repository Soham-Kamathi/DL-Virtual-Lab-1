from fastapi import APIRouter

from app.services.model_catalog import get_available_models

router = APIRouter(prefix="/models", tags=["Models"])


@router.get("")
def list_models() -> list[str]:
    """Return the list of currently supported autoencoder models."""
    return get_available_models()
