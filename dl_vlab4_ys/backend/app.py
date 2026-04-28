from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse
import json
from train import run_simulation, get_datasets, CLASSES

app = FastAPI(title="Virtual Overfitting Lab Backend")

# Allow frontend running on localhost:3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Trigger download/subsetting on startup so it doesn't block the first request
@app.on_event("startup")
def startup_event():
    print("Loading CIFAR-10 data on startup...")
    get_datasets()
    print("Data loaded!")

@app.get("/preview")
def preview_dataset(dataset: str = "cifar-10", count: int = 16):
    """
    Returns a sample of the dataset for the frontend canvas view.
    """
    trainset, _ = get_datasets()
    samples = []
    
    # Grab first 'count' samples
    for i in range(min(count, len(trainset))):
        img, label = trainset[i]
        # img is a tensor of shape [3, 32, 32]
        # flatten it to pass to the frontend
        flat_img = img.numpy().flatten().tolist()
        samples.append({
            "image": flat_img,
            "label": CLASSES[label]
        })
        
    return {"samples": samples}

@app.get("/api/dataset/preview")
def preview_dataset_alias(name: str = "cifar-10", n: int = 16):
    """Alias for /preview to support legacy frontend routes"""
    return preview_dataset(dataset=name, count=n)

@app.post("/simulate")
async def simulate(request: Request):
    """
    Accepts hyperparameters and starts streaming the simulation.
    """
    config = await request.json()
    
    # We use EventSourceResponse from sse_starlette to handle Server-Sent Events easily.
    # The generator run_simulation yields correctly formatted 'data: ... \n\n' blocks.
    return EventSourceResponse(run_simulation(config))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
