/**
 * Local presentation adapter for the dashboard. Replace this function with the
 * ParkiSight model/API adapter when the inference service is ready. These values
 * are illustrative and must never be presented as a clinical prediction.
 */
export type InferenceInputs = {
  updrs1: number;
  updrs2: number;
  moca: number;
  adl: number;
  epworth: number;
  scopa: number;
  spectAvailable: boolean;
};

export type DemoInferenceResult = {
  stageProbabilities: [number, number, number, number];
  motorScore: number;
  gateWeight: number;
  latencyMs: number;
};

export async function runDemoInference(inputs: InferenceInputs): Promise<DemoInferenceResult> {
  await new Promise((resolve) => window.setTimeout(resolve, 420));
  const clinicalLoad = inputs.updrs1 * 0.18 + inputs.updrs2 * 0.34 + inputs.scopa * 0.16 + inputs.epworth * 0.08;
  const motorScore = Math.max(0, Math.min(132, Math.round((inputs.updrs1 * 0.35 + inputs.updrs2 * 0.65) * 0.84)));
  const stage = clinicalLoad > 39 ? 3 : clinicalLoad > 27 ? 2 : clinicalLoad > 14 ? 1 : 0;
  const confidence = Math.min(78, 58 + Math.round(Math.abs(clinicalLoad - 25) * 0.32));
  const probabilities: [number, number, number, number] = [0, 0, 0, 0];
  probabilities[stage] = confidence;
  const remaining = 100 - confidence;
  const otherStages = probabilities.map((_, index) => index).filter((index) => index !== stage);
  otherStages.forEach((index, position) => { probabilities[index] = Math.floor(remaining / 3) + (position < remaining % 3 ? 1 : 0); });
  return {
    stageProbabilities: probabilities,
    motorScore,
    gateWeight: inputs.spectAvailable ? 0.482 : 0.935,
    latencyMs: inputs.spectAvailable ? 16 : 3.6,
  };
}
