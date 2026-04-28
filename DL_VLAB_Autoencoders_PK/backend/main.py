import sys
import os
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware

# Ensure the current directory is in path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    import data_loader
    import model
except ImportError:
    from . import data_loader
    from . import model

import uvicorn

app = FastAPI(title="MLP MNIST Virtual Lab API")

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000, http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class MLPParams(BaseModel):
    hidden_layers: List[int] = [128]
    activation: str = "relu"
    solver: str = "adam"
    alpha: float = 0.0001
    batch_size: int = 32
    epochs: int = 10
    learning_rate: float = 0.001
    dataset: str = "mnist_784"


@app.get("/")
def read_root():
    return {"message": "Welcome to the MLP MNIST Virtual Lab API"}


@app.get("/api/dataset/preview")
def preview_dataset(name: str = "mnist_784", n: int = 16):
    try:
        samples = data_loader.get_preview_samples(name, n_samples=n)
        return {"samples": samples}
    except Exception as e:
        print(f"Error in preview: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/mlp/run-stream")
def run_simulation_stream(params: MLPParams):
    """SSE endpoint that streams epoch-by-epoch training progress."""
    try:
        X_train, X_test, y_train, y_test = data_loader.get_dataset(params.dataset)

        def event_generator():
            yield from model.train_mlp_streaming(
                X_train, y_train, X_test, y_test, params.dict()
            )

        return StreamingResponse(
            event_generator(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            },
        )
    except Exception as e:
        print(f"Error in streaming training: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
