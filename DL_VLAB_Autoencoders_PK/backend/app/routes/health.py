from fastapi import APIRouter

router = APIRouter(tags=["Health"])


@router.get("/")
def health_check() -> dict[str, str]:
    """Simple health route for uptime checks and quick smoke tests."""
    return {"status": "ok", "message": "Medical Imaging Noise Reduction API is running."}
