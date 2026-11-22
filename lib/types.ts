export type SliceMode = 'axial' | 'coronal' | 'sagittal';
export type AnatomyFocus = 'overview' | 'caudate' | 'putamen' | 'striatum';

export type ResearchMetric = {
  id: string;
  name: string;
  value: string;
  numericValue: number;
  unit: string;
  dataset: string;
  cohort: string;
  task: string;
  modelVersion: string;
  split: string;
  experimentId: string;
  sourceReference: string;
  verificationStatus: 'verified' | 'provisional' | 'illustrative';
  notes: string;
};

export type CohortFlowStep = {
  step: string;
  count: number;
  label: string;
  detail: string;
  excludedCount?: number;
  excludedNote?: string;
};

export type InferenceInputs = {
  updrs1: number;
  updrs2: number;
  moca: number;
  adl: number;
  epworth: number;
  scopa: number;
  spectAvailable: boolean;
  nfL: number;
  saa: 'Positive' | 'Negative' | 'Not tested';
  lrrk2: boolean;
  gba: boolean;
  apoe: boolean;
};

export type DemoInferenceResult = {
  stageProbabilities: [number, number, number, number];
  motorScore: number;
  gateWeight: number;
  latencyMs: number;
  activeRoute: 'multimodal' | 'prior-token';
};
