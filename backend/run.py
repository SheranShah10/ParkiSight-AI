"""
Single-command launcher for ParkiSight-AI FastAPI inference backend.
Usage:
    python run.py
"""

import sys
import os
import uvicorn

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(current_dir)
    sys.path.insert(0, current_dir)
    print("==================================================================")
    print(" Starting ParkiSight-AI Neural Inference Server")
    print(" Architecture: NeuroCrossVelocityNet (328 Tabular + 3D SPECT CNN)")
    print(" Checkpoint:   backend/models/best_neurocross_model.pth")
    print(" Listening on: http://127.0.0.1:8000")
    print(" API Docs:     http://127.0.0.1:8000/docs")
    print("==================================================================")
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=False, workers=1)
