from typing import List


def get_available_models() -> List[str]:
    """Return model keys supported by the lab backend.

    Keeping this in a service module makes it easy to swap static values
    for a database/config source later without changing route code.
    """
    return ["denoising_autoencoder", "conv_autoencoder"]
