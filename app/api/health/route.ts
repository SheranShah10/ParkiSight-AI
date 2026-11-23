import { NextResponse } from 'next/server';

const PYTHON_BACKEND_URL = process.env.PARKISIGHT_BACKEND_URL || 'http://127.0.0.1:8000';

export async function GET() {
  let backendStatus = 'unreachable';
  let backendDetails = null;

  try {
    const res = await fetch(`${PYTHON_BACKEND_URL}/health`, {
      signal: AbortSignal.timeout(1500),
    });
    if (res.ok) {
      backendStatus = 'connected';
      backendDetails = await res.json();
    }
  } catch {
    backendStatus = 'offline_using_serverless_engine';
  }

  return NextResponse.json({
    status: 'healthy',
    apiGateway: 'online',
    timestamp: new Date().toISOString(),
    backendStatus,
    backendTarget: PYTHON_BACKEND_URL,
    backendDetails,
    supportedModels: [
      'NeuroCross-VelocityNet v1.0 (328 Tabular + 3D SPECT CNN + AMGU)',
      'TabResNet Staging Classifier (4-Class H&Y)',
      'Spatio-Temporal Progression Velocity Forecaster'
    ],
    antiLeakageProtocol: 'Strict GroupKFold + Zero Pre-Visit Imputation Leakage Enforced'
  });
}
