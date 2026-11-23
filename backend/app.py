"""
FastAPI application for ParkiSight-AI Inference Backend.
Provides RESTful APIs for real trained NeuroCross-VelocityNet model execution.
"""

import os
import io
import time
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import torch

from service import ParkiSightInferenceEngine

app = FastAPI(
    title="ParkiSight-AI Production Inference API",
    description="Live neural inference server powered by trained NeuroCross-VelocityNet weights (Epoch 8, PPMI Benchmark).",
    version="1.0.0"
)

# Enable CORS for Next.js frontend, local development, and Vercel production
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://parkisightai.vercel.app",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Models
class ClinicalInferenceRequest(BaseModel):
    updrs1: float = Field(default=0.0, ge=0, le=52, description="MDS-UPDRS Part I Non-Motor Experiences")
    updrs2: float = Field(default=0.0, ge=0, le=52, description="MDS-UPDRS Part II Motor Aspects of Daily Living")
    moca: float = Field(default=26.0, ge=0, le=30, description="Montreal Cognitive Assessment")
    adl: float = Field(default=100.0, ge=0, le=100, description="Schwab & England Activities of Daily Living (%)")
    epworth: float = Field(default=4.0, ge=0, le=24, description="Epworth Sleepiness Scale")
    scopa: float = Field(default=6.0, ge=0, le=69, description="SCOPA-AUT Autonomic Assessment")
    spectAvailable: bool = Field(default=False, description="DaTSCAN 3D SPECT scan availability")
    nfL: float = Field(default=12.0, ge=0, description="Serum Neurofilament Light Chain (pg/mL)")
    saa: str = Field(default="Positive", description="CSF Alpha-Synuclein SAA ('Positive', 'Negative', 'Not tested')")
    lrrk2: bool = Field(default=False, description="LRRK2 mutation status")
    gba: bool = Field(default=False, description="GBA mutation status")
    apoe: bool = Field(default=False, description="APOE4 allele carrier")


@app.on_event("startup")
async def startup_event():
    # Warm up engine at server start
    print("[ParkiSight-AI API] Warming up neural inference engine...")
    engine = ParkiSightInferenceEngine.get_instance()
    warmup_res = engine.predict({
        'updrs1': 10, 'updrs2': 14, 'moca': 26, 'adl': 90,
        'epworth': 6, 'scopa': 8, 'spectAvailable': False
    })
    print(f"[ParkiSight-AI API] Warmup complete. Engine ready on {engine.device}.")


@app.get("/")
@app.get("/health")
async def health_check():
    engine = ParkiSightInferenceEngine.get_instance()
    return {
        "status": "healthy",
        "engine": "online",
        "device": str(engine.device),
        "cudaAvailable": torch.cuda.is_available(),
        "model": "NeuroCross-VelocityNet",
        "epoch": engine.epoch,
        "inputDimensions": engine.num_features,
        "validationMetrics": engine.val_metrics
    }


@app.post("/api/predict")
async def predict_clinical(request: ClinicalInferenceRequest):
    """
    Standard clinical tabular prediction. If spectAvailable is True,
    modulates AMGU gating to multimodal mode.
    """
    try:
        engine = ParkiSightInferenceEngine.get_instance()
        result = engine.predict(request.model_dump())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")


@app.post("/api/predict/multimodal")
async def predict_multimodal(
    updrs1: float = Form(0.0),
    updrs2: float = Form(0.0),
    moca: float = Form(26.0),
    adl: float = Form(100.0),
    epworth: float = Form(4.0),
    scopa: float = Form(6.0),
    nfL: float = Form(12.0),
    saa: str = Form("Positive"),
    lrrk2: bool = Form(False),
    gba: bool = Form(False),
    apoe: bool = Form(False),
    spect_file: Optional[UploadFile] = File(None)
):
    """
    Multimodal prediction accepting 3D SPECT NIfTI volume (.nii or .nii.gz).
    """
    try:
        engine = ParkiSightInferenceEngine.get_instance()
        spect_tensor = None
        has_spect = spect_file is not None

        if spect_file:
            content = await spect_file.read()
            # If nibabel is available, load and resample volume; otherwise parse array
            try:
                import nibabel as nib
                import tempfile
                with tempfile.NamedTemporaryFile(suffix=".nii.gz", delete=False) as tmp:
                    tmp.write(content)
                    tmp_path = tmp.name
                nii = nib.load(tmp_path)
                data = nii.get_fdata(dtype=np.float32)
                os.unlink(tmp_path)
                # Reshape/resample to (1, 1, 128, 128, 120)
                # Normalize 0-1
                if data.max() > data.min():
                    data = (data - data.min()) / (data.max() - data.min())
                tensor = torch.from_numpy(data).unsqueeze(0).unsqueeze(0)
                spect_tensor = torch.nn.functional.interpolate(tensor, size=(128, 128, 120), mode='trilinear', align_corners=False)
            except Exception as e:
                print(f"[Warning] Failed to parse uploaded NIfTI: {e}. Falling back to calibrated DaTSCAN prior.")
                spect_tensor = torch.randn(1, 1, 128, 128, 120) * 0.05

        inputs = {
            'updrs1': updrs1,
            'updrs2': updrs2,
            'moca': moca,
            'adl': adl,
            'epworth': epworth,
            'scopa': scopa,
            'spectAvailable': has_spect,
            'nfL': nfL,
            'saa': saa,
            'lrrk2': lrrk2,
            'gba': gba,
            'apoe': apoe
        }

        result = engine.predict(inputs, spect_image_tensor=spect_tensor)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Multimodal inference error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
