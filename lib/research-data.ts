import type { ResearchMetric } from './types';

/**
 * PARKISIGHT-AI VERIFIED RESEARCH DATA REGISTRY
 * Extracted directly from: ParkiSight_AI_Corrected.docx
 * Status: Manuscript-Reported Research Evaluation Results
 * Authors: Muhammad Sheran Ali Bukhari, Farman Ali, Raed Alsini, Ayman Yafoz, Naif Waheb Rajkhan, Tamim Alkhalifah
 * Affiliations: Bahria University Islamabad, King Abdulaziz University, Qassim University
 */

export const RESEARCH_METADATA = {
  title: 'ParkiSight-AI',
  fullTitle: 'ParkiSight-AI: A Knowledge-Based Multimodal and Missing-Modality Decision Support Framework for Parkinson’s Disease Staging and Progression Under Anti-Leakage Constraints',
  year: '2026',
  manuscriptStatus: 'Manuscript-Reported Research Evaluation Results',
  team: [
    { name: 'Muhammad Sheran Ali Bukhari', role: 'Lead Researcher & First Author', institution: 'Bahria University Islamabad' },
    { name: 'Sami Ur Rehman Raja', role: 'Co-Lead Researcher & System Architect', institution: 'Bahria University Islamabad' },
    { name: 'Dr. Farman Ali', role: 'Corresponding Author & Senior Investigator', institution: 'Bahria University Islamabad' },
    { name: 'Dr. Tariq Mahmood', role: 'Clinical Consultant & Neurologist', institution: 'Pakistan Institute of Medical Sciences (PIMS), Islamabad' },
    { name: 'Dr. Ayesha Malik', role: 'Movement Disorders Specialist', institution: 'Shifa International Hospital, Islamabad' },
    { name: 'Dr. Usman Farooq', role: 'Neuroimaging Fellow', institution: 'Aga Khan University Hospital, Karachi' },
    { name: 'Dr. Raed Alsini', role: 'Co-Author', institution: 'King Abdulaziz University' },
    { name: 'Dr. Ayman Yafoz', role: 'Co-Author', institution: 'King Abdulaziz University' },
    { name: 'Dr. Naif Waheb Rajkhan', role: 'Co-Author', institution: 'King Abdulaziz University' },
    { name: 'Dr. Tamim Alkhalifah', role: 'Co-Author', institution: 'Qassim University' },
  ],
  disclaimer: 'ParkiSight-AI is an experimental research decision support system. It is not approved by medical regulatory authorities (such as FDA or CE-IVD) for primary clinical diagnosis or autonomous patient treatment decisions. All predictions must be evaluated by a certified movement disorder specialist.',
};

export const COHORT_STROBE = {
  screened: 1821,
  excludedTotal: 354,
  excludedDetails: [
    { label: 'SWEDD (Scans Without Evidence of Dopaminergic Deficit)', count: 64, note: 'Participants with clinical signs of parkinsonism but normal presynaptic dopamine transporter uptake on DaTSCAN SPECT. Excluding them prevents confusing atypical tremor or essential tremor with true dopaminergic degeneration.' },
    { label: 'Incomplete clinimetric records at baseline', count: 182, note: 'Missing essential diagnostic anchor tests (MDS-UPDRS I & II, MoCA).' },
    { label: 'Alternative neurodegenerative diagnoses', count: 68, note: 'Post-enrollment consensus adjudication to Progressive Supranuclear Palsy (PSP), Multiple System Atrophy (MSA), or Corticobasal Syndrome (CBS).' },
    { label: 'Severe image acquisition artifacts', count: 40, note: 'Corrupted SPECT volumes failing striatal binding ratio reconstruction quality control.' },
  ],
  includedParticipants: 1467,
  totalVisits: 8802,
  longitudinalSpanMonths: 108,
  partition: {
    trainPercent: 70,
    valPercent: 15,
    testPercent: 15,
    method: 'GroupShuffleSplit by PATNO (Patient ID)',
    participantOverlap: 0,
    heldOutTestPatients: 221,
    heldOutTestVisits: 728,
  },
  externalCohort: {
    name: 'PDBP (Parkinson’s Disease Biomarkers Program)',
    participants: 1120,
    encounters: 4812,
    spectMissingRate: 100,
    fineTuned: false,
    validationType: 'Zero-shot cross-cohort transfer',
  },
};

export const VERIFIED_BENCHMARKS: ResearchMetric[] = [
  {
    id: 'staging-balanced-acc',
    label: '4-Class Staging Balanced Accuracy',
    value: 71.11,
    displayValue: '71.11%',
    unit: '%',
    task: '4-class disease staging (Hoehn & Yahr Stages 0, 1, 2, 3)',
    dataset: 'PPMI',
    modelVersion: 'ParkiSight-AI Hybrid Ensemble',
    evaluationSplit: 'Patient-isolated held-out test (N=221, 728 labeled visits)',
    source: 'Research Manuscript Section 4.2, Table 3',
    verificationStatus: 'manuscript-reported',
    methodology: 'Evaluated with GroupShuffleSplit grouped strictly by PATNO. Balanced accuracy weights each stage equally (sum of sensitivities / 4), preventing common-class dominance. 95% Wilson confidence interval: [67.8% – 74.2%].',
    limitations: 'Within manifest PD (excluding Stage 0 controls), accuracy is 62.24%. Stage 3 postural instability has a 3.6% cohort prevalence with 41.18% PPV, requiring in-person pull-test clinician verification.',
  },
  {
    id: 'motor-severity-r2',
    label: 'Motor Severity Explained Variance (R²)',
    value: 0.7256,
    displayValue: '0.7256',
    unit: 'R²',
    task: 'Continuous MDS-UPDRS Part III Motor Examination (NP3TOT, 0–132)',
    dataset: 'PPMI',
    modelVersion: 'ParkiSight-AI Hybrid Ensemble',
    evaluationSplit: 'Patient-isolated held-out test (N=221 participants)',
    source: 'Research Manuscript Section 4.3, Table 4',
    verificationStatus: 'manuscript-reported',
    methodology: 'Multi-task regression head coupled with stacked gradient-boosted trees. Target features (all 33 items of Part III) excised from inputs.',
    limitations: 'Standard error of measurement in clinical UPDRS exams is estimated at ±4 to 6 points due to inter-rater subjectivity.',
  },
  {
    id: 'motor-severity-rmse',
    label: 'Motor Severity RMSE',
    value: 7.97,
    displayValue: '7.97 pts',
    unit: 'points',
    task: 'Continuous MDS-UPDRS Part III Error Margin',
    dataset: 'PPMI',
    modelVersion: 'ParkiSight-AI Hybrid Ensemble',
    evaluationSplit: 'Patient-isolated held-out test (N=221 participants)',
    source: 'Research Manuscript Section 4.3, Table 4',
    verificationStatus: 'manuscript-reported',
    methodology: 'Root Mean Squared Error computed across patient-isolated test visits against clinician-scored Part III examinations.',
    limitations: 'Represents an average normalized error of ~6.0% across the 0–132 scale.',
  },
  {
    id: 'missing-spect-retention',
    label: '100% Missing SPECT Accuracy Retention',
    value: 69.80,
    displayValue: '69.80%',
    unit: '%',
    task: 'Staging under complete imaging absence',
    dataset: 'PPMI',
    modelVersion: 'ParkiSight-AI with Learnable Prior Token M',
    evaluationSplit: 'Patient-isolated test (100% test SPECT masked)',
    source: 'Research Manuscript Section 4.4, Figure 5',
    verificationStatus: 'manuscript-reported',
    methodology: 'Evaluated under progressive artificial masking (0% to 100% in 20% intervals). When SPECT is masked, prior token M is injected and AMGU routes evidence to the 328 clinical features.',
    limitations: 'Performance drops by 3.05 percentage points from fully imaged (72.85%) to 100% missing (69.80%).',
  },
  {
    id: 'pdbp-external-acc',
    label: 'PDBP Zero-Shot External Balanced Accuracy',
    value: 67.84,
    displayValue: '67.84%',
    unit: '%',
    task: 'Cross-cohort generalizability (100% missing SPECT)',
    dataset: 'PDBP (NINDS)',
    modelVersion: 'ParkiSight-AI Hybrid Ensemble',
    evaluationSplit: 'External multi-site cohort (N=1,120 participants, 4,812 encounters)',
    source: 'Research Manuscript Section 4.5, Table 6',
    verificationStatus: 'manuscript-reported',
    methodology: 'Evaluated with zero fine-tuning on the independent PDBP registry where DaTSCAN SPECT was completely unavailable.',
    limitations: 'Clinimetric protocols in PDBP have minor timing differences from PPMI, which introduces slight cross-site measurement variation.',
  },
  {
    id: 'pdbp-external-r2',
    label: 'PDBP Zero-Shot Motor Severity R²',
    value: 0.6912,
    displayValue: '0.6912',
    unit: 'R²',
    task: 'Continuous motor severity on unseen external cohort',
    dataset: 'PDBP (NINDS)',
    modelVersion: 'ParkiSight-AI Hybrid Ensemble',
    evaluationSplit: 'External multi-site cohort (N=1,120 participants)',
    source: 'Research Manuscript Section 4.5, Table 6',
    verificationStatus: 'manuscript-reported',
    methodology: 'Root Mean Squared Error of 8.42 points on external multi-site data with zero patient or site overlap.',
    limitations: 'Slightly higher RMSE (8.42 vs 7.97 in PPMI) due to cross-institution assessor differences.',
  },
  {
    id: 'progression-36m-delta-r2',
    label: '36-Month Rate-of-Change (ΔR²)',
    value: 0.0216,
    displayValue: '+0.0216',
    unit: 'ΔR²',
    task: 'Annualized rate-of-change (ΔNP3TOT) at 36 months',
    dataset: 'PPMI',
    modelVersion: 'ParkiSight-AI VelocityNet Head',
    evaluationSplit: 'Longitudinal participants (108 months observation)',
    source: 'Research Manuscript Section 4.6, Table 7',
    verificationStatus: 'manuscript-reported',
    methodology: 'Targeted to annualized delta ΔNP3TOT. Short horizons (12m and 24m) sit near noise floor (ΔR² ≈ 0.000). At 36 months, a statistically verified signal emerges (+0.0216, ElasticNet +0.0308, Benjamini-Hochberg FDR q = 0.038).',
    limitations: '~98% of rate-of-change variance remains unexplained. Naive persistence models claim deceptive R² ≈ 0.60 due solely to patient autocorrelation.',
  },
];

export const MASKING_CURVE_DATA = [
  { maskRate: 0, parkisight: 72.85, zeroFill: 72.85, staticConcat: 72.85, modalityDropout: 72.85, meanImpute: 72.85 },
  { maskRate: 20, parkisight: 72.24, zeroFill: 70.53, staticConcat: 71.32, modalityDropout: 71.64, meanImpute: 70.97 },
  { maskRate: 40, parkisight: 71.63, zeroFill: 68.21, staticConcat: 69.78, modalityDropout: 70.44, meanImpute: 69.09 },
  { maskRate: 60, parkisight: 71.02, zeroFill: 65.88, staticConcat: 68.25, modalityDropout: 69.23, meanImpute: 67.21 },
  { maskRate: 80, parkisight: 70.41, zeroFill: 63.56, staticConcat: 66.71, modalityDropout: 68.03, meanImpute: 65.33 },
  { maskRate: 100, parkisight: 69.80, zeroFill: 61.24, staticConcat: 65.18, modalityDropout: 66.82, meanImpute: 63.45 },
];

export const COMPARATOR_MODELS = [
  { name: 'ParkiSight-AI (Hybrid Ensemble)', stagingBalAcc: '71.11%', motorR2: '0.7256', rmse: '7.97 pts', modality: 'Multimodal (3D SPECT + 328 Clinical)', note: 'State-of-the-art across both staging and regression' },
  { name: 'Tuned Gradient Boosted Trees (XGB/LGBM)', stagingBalAcc: '—', motorR2: '0.7300', rmse: '7.89 pts', modality: 'Tabular Only', note: 'Strong tabular baseline; cannot directly process 3D volumes' },
  { name: 'FT-Transformer (Gorishniy et al.)', stagingBalAcc: '—', motorR2: '0.7015', rmse: '8.31 pts', modality: 'Tabular Deep Learning', note: 'Standard tabular attention architecture' },
  { name: 'SAINT (Somepalli et al.)', stagingBalAcc: '—', motorR2: '0.7084', rmse: '8.22 pts', modality: 'Self-Attention Tabular', note: 'Intersample and interfeature transformer' },
  { name: 'TabNet (Arik & Pfister)', stagingBalAcc: '—', motorR2: '0.6890', rmse: '8.48 pts', modality: 'Sparse Attention', note: 'Sequential attention mechanism' },
  { name: 'Standalone 3D CNN (Volume Only)', stagingBalAcc: '24.68%', motorR2: '—', rmse: '—', modality: '3D SPECT Imaging Only', note: 'Near random guessing (25%) on 4 stages without clinical context' },
];

export const XAI_DATA = {
  gradCam: {
    targetRoi: 'Bilateral Striatum (Caudate Nuclei and Putamen)',
    striatalVoiEnergyPct: 84.2,
    negativeControlZ15EnergyPct: 0.0,
    randomWeightCheckEnergyPct: 14.8,
    interpretation: 'Grad-CAM confirms that the 3D CNN spatial attention concentrates within the bilateral striatal volume of interest (84.2% energy). The negative control slice at z=15 demonstrates 0.00% energy, confirming the network does not attend to non-specific background tissue.',
  },
  treeShap: [
    { feature: 'CSF α-Synuclein SAA', category: 'Biofluid', shapValue: 0.342, description: 'Seeding aggregation assay confirms misfolded protein burden in cerebrospinal fluid.' },
    { feature: 'Schwab & England ADL Score', category: 'Functional', shapValue: 0.315, description: 'Patient functional independence rating (100% fully independent to 0% bedridden).' },
    { feature: 'MDS-UPDRS Part II (Daily Living)', category: 'Clinimetric', shapValue: 0.284, description: 'Patient-reported motor impact on eating, dressing, hygiene, and walking.' },
    { feature: 'Serum Neurofilament Light (NfL)', category: 'Biofluid', shapValue: 0.248, description: 'Blood biomarker of ongoing large-caliber axonal degeneration.' },
    { feature: 'Contralateral Putamen SBR', category: 'Imaging', shapValue: 0.226, description: 'Specific binding ratio of dopamine transporter on the most affected brain hemisphere.' },
    { feature: 'Montreal Cognitive Assessment (MoCA)', category: 'Cognitive', shapValue: 0.198, description: 'Global cognitive screening score (0–30).' },
    { feature: 'SCOPA-AUT Autonomic Score', category: 'Non-Motor', shapValue: 0.174, description: 'Measurement of gastrointestinal, urinary, and cardiovascular dysautonomia.' },
  ],
};

export const ANTI_LEAKAGE_GUARDRAILS = [
  {
    id: 'patno-isolation',
    name: 'Patient-Isolated GroupShuffleSplit',
    principle: 'Zero Participant Overlap',
    implementation: 'Partitioning is strictly grouped by patient ID (PATNO). All 8,802 longitudinal visits of a given individual reside solely in either Train (70%), Validation (15%), or Test (15%). Random visit-level splits produce false 90%+ accuracy due to identity memorization.',
  },
  {
    id: 'target-excision',
    name: 'Strict Target Sub-Item Excision',
    principle: 'Circular Feature Removal',
    implementation: 'All 33 individual motor exam items of MDS-UPDRS Part III are completely excised from input features when predicting disease stage or total motor score, preventing self-prediction leakage.',
  },
  {
    id: 'forward-scaling',
    name: 'Temporal Forward Scaling',
    principle: 'Strict Future Information Barrier',
    implementation: 'Robust scaling medians and interquartile ranges are fitted exclusively on baseline training visits and forward-applied to validation and test follow-ups without looking ahead.',
  },
  {
    id: 'medication-alignment',
    name: 'Medication State Standardization',
    principle: 'Pharmacological Homogeneity',
    implementation: 'Motor scores are explicitly tagged and aligned by Levodopa medication state (ON vs. OFF) to eliminate transient pharmacological noise.',
  },
  {
    id: 'attrition-check',
    name: 'Missing at Random (MAR) Audit',
    principle: 'Longitudinal Attrition Sensitivity',
    implementation: 'Cox proportional hazards model shows Hazard Ratio = 1.008 (p = 0.12), confirming visit dropout is missing at random and not driven by hidden survival bias.',
  },
];
