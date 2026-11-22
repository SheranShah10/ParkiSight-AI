/**
 * PARKISIGHT-AI DEMONSTRATION ADAPTER
 * 
 * IMPORTANT: This module is a client-side presentation adapter designed for
 * interaction design evaluation. It produces illustrative demo outputs based on
 * parameterized clinimetric weighting and must NEVER be presented as real
 * clinical predictions or trained model inference.
 *
 * For deploying real model predictions, replace this implementation with the
 * authenticated ParkiSight TensorRT/PyTorch inference service endpoint.
 */

import type { InferenceInputs, DemoInferenceResult } from '@/lib/types';

export const IS_DEMO_ADAPTER = true;
export const MODEL_CONNECTION_STATUS = 'client_side_demonstration_mode' as const;
export const DEMO_ADVISORY = 'Illustrative demonstration output. Not trained model inference.';

export async function runDemoInference(inputs: InferenceInputs): Promise<DemoInferenceResult> {
  // Simulate network roundtrip latency for realistic UI state feedback
  await new Promise((resolve) => window.setTimeout(resolve, 380));

  // Parameterized clinimetric weighting for consistent interaction behavior
  const clinicalLoad =
    inputs.updrs1 * 0.18 +
    inputs.updrs2 * 0.34 +
    inputs.scopa * 0.16 +
    inputs.epworth * 0.08 +
    (inputs.saa === 'Positive' ? 4.5 : 0) +
    (inputs.nfL > 20 ? 3.0 : 0);

  // Motor exam regression estimate (0 to 132 scale)
  const motorScore = Math.max(
    0,
    Math.min(132, Math.round((inputs.updrs1 * 0.35 + inputs.updrs2 * 0.65) * 0.84))
  );

  // Categorical stage assignment (Hoehn & Yahr Stages 0, 1, 2, 3)
  const stage = clinicalLoad > 40 ? 3 : clinicalLoad > 28 ? 2 : clinicalLoad > 14 ? 1 : 0;
  const confidence = Math.min(82, 58 + Math.round(Math.abs(clinicalLoad - 26) * 0.35));

  const probabilities: [number, number, number, number] = [0, 0, 0, 0];
  probabilities[stage] = confidence;
  const remaining = 100 - confidence;
  const otherStages = probabilities.map((_, index) => index).filter((index) => index !== stage);

  otherStages.forEach((index, position) => {
    probabilities[index] =
      Math.floor(remaining / 3) + (position < remaining % 3 ? 1 : 0);
  });

  return {
    stageProbabilities: probabilities,
    motorScore,
    gateWeight: inputs.spectAvailable ? 0.482 : 0.935,
    latencyMs: inputs.spectAvailable ? 16.0 : 3.6,
    activeRoute: inputs.spectAvailable ? 'multimodal' : 'prior-token',
  };
}

export type { InferenceInputs, DemoInferenceResult };
