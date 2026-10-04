from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import sys

# Import advanced router
from routes.advanced import router as advanced_router

# Import strictly built prediction module
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'ml')))
from predict import predict_sequence

app = FastAPI(title="AminoAI Prediction API (Phase 1 Compliant)", version="1.0")

app.include_router(advanced_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ProteinRequest(BaseModel):
    sequence: str

@app.get("/")
def read_root():
    return {"message": "Welcome to AminoAI Backend API"}

@app.post("/api/predict")
def predict_protein(req: ProteinRequest):
    try:
        result = predict_sequence(req.sequence)
        
        # Format the response to match the frontend expectations securely
        return {
            "sequence": result["sequence"],
            "predicted_class": result["predicted_class"],
            "confidence": result["confidence"],
            "probabilities": result["probabilities"],
            "protein_statistics": result["feature_summary"],
            "warnings": result["warnings"]
        }
    except ValueError as ve:
        raise HTTPException(status_code=500, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
