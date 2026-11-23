# ParkiSight-AI Inference Backend

Production-grade Python FastAPI backend serving the trained **NeuroCross-VelocityNet** multimodal neural network for Parkinson's Disease (PD) motor severity estimation, 4-class Hoehn & Yahr staging, and longitudinal progression velocity forecasting.

## Architecture Highlights
- **Model Checkpoint**: `backend/models/best_neurocross_model.pth` (Epoch 8, Val F1 = 0.6309, Val Balanced Accuracy = 0.6600, Motor Severity $R^2 = 0.5617$).
- **Tabular Preprocessor**: `backend/models/neurocross_tabular_scaler.joblib` (328 PPMI clinical, biofluid, and demographic features with median imputation and standard scaling).
- **Adaptive Modality Gating Unit (AMGU)**: Dynamically modulates multimodal attention between clinical tabular features and 3D DaTSCAN SPECT volumes ($128 \times 128 \times 120$).
- **Anti-Leakage Missing Modality Handling**: Missing scans route automatically to the learnable prior token ($M$), preventing numerical instability or prediction degradation.

---

## Quickstart

### 1. Environment Setup
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Run Server
```bash
python run.py
```
Server starts on `http://127.0.0.1:8000`. Interactive OpenAPI documentation is accessible at `http://127.0.0.1:8000/docs`.

---

## API Endpoints

### `GET /health`
Verifies backend status, device (CUDA/CPU), model version, and loaded validation metrics.

### `POST /api/predict`
Executes real-time inference on structured clinical inputs.
```json
{
  "updrs1": 12.0,
  "updrs2": 16.0,
  "moca": 24.0,
  "adl": 80.0,
  "epworth": 10.0,
  "scopa": 14.0,
  "spectAvailable": false,
  "nfL": 18.2,
  "saa": "Positive",
  "lrrk2": true,
  "gba": false,
  "apoe": false
}
```

### `POST /api/predict/multimodal`
Accepts multipart form-data with clinical attributes and an uploaded 3D DaTSCAN SPECT volume (`.nii` or `.nii.gz`).

---

## Deployment (Cloud Hosting)
This backend is Docker-ready:
```bash
docker build -t parkisight-backend .
docker run -p 8000:8000 parkisight-backend
```
Can be deployed with 1 click to Render, Railway, Fly.io, or Hugging Face Spaces (Docker Space).
