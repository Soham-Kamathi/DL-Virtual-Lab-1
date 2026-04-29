from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from ml_model import run_lstm_simulation

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SimulationRequest(BaseModel):
    window_size: int
    layers: int
    dataset: str

@app.post("/api/simulate")
def simulate(req: SimulationRequest):
    try:
        data = run_lstm_simulation(
            dataset_name=req.dataset,
            window_size=req.window_size,
            num_layers=req.layers
        )
        return data
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
