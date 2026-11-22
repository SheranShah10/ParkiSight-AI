'use client';

import { useState } from 'react';
import { Calendar, Activity, ScanLine, Brain, ChevronRight, ShieldCheck, HeartPulse } from 'lucide-react';

type VisitData = {
  visitId: string;
  month: string;
  intervalMonths: number;
  medication: 'ON' | 'OFF';
  spectAvailable: boolean;
  updrs1: number;
  updrs2: number;
  moca: number;
  adl: number;
  predictedStage: string;
  predictedMotor: number;
  clinicalNote: string;
};

const SAMPLE_JOURNEY: VisitData[] = [
  {
    visitId: 'BL',
    month: 'Baseline (Month 0)',
    intervalMonths: 0,
    medication: 'OFF',
    spectAvailable: true,
    updrs1: 8,
    updrs2: 11,
    moca: 28,
    adl: 95,
    predictedStage: 'Stage 1 · Unilateral',
    predictedMotor: 19,
    clinicalNote: 'Initial assessment. Subtle unilateral resting tremor in right upper extremity. SBR asymmetry on SPECT confirms right putamen deficit.',
  },
  {
    visitId: 'M06',
    month: 'Month 06',
    intervalMonths: 6,
    medication: 'ON',
    spectAvailable: false,
    updrs1: 9,
    updrs2: 12,
    moca: 28,
    adl: 90,
    predictedStage: 'Stage 1 · Unilateral',
    predictedMotor: 21,
    clinicalNote: 'Follow-up visit. Good response to initial dopamine agonist therapy. SPECT unavailable (Prior Token M route engaged).',
  },
  {
    visitId: 'M12',
    month: 'Month 12 (Year 1)',
    intervalMonths: 12,
    medication: 'ON',
    spectAvailable: true,
    updrs1: 12,
    updrs2: 16,
    moca: 27,
    adl: 85,
    predictedStage: 'Stage 2 · Bilateral',
    predictedMotor: 28,
    clinicalNote: '1-year research checkup. Bilateral axial rigidity emerged. Second SPECT confirms contralateral putaminal uptake reduction.',
  },
  {
    visitId: 'M24',
    month: 'Month 24 (Year 2)',
    intervalMonths: 24,
    medication: 'ON',
    spectAvailable: false,
    updrs1: 15,
    updrs2: 20,
    moca: 26,
    adl: 80,
    predictedStage: 'Stage 2 · Bilateral',
    predictedMotor: 35,
    clinicalNote: '2-year review. Slight wearing-off fluctuations noted. Balance intact on pull-test. SPECT unavailable.',
  },
  {
    visitId: 'M36',
    month: 'Month 36 (Year 3)',
    intervalMonths: 36,
    medication: 'ON',
    spectAvailable: false,
    updrs1: 18,
    updrs2: 24,
    moca: 25,
    adl: 75,
    predictedStage: 'Stage 2 / 3 Boundary',
    predictedMotor: 42,
    clinicalNote: '3-year milestone. Noticeable retropulsion on exam. Postural reflex requires close clinician monitoring.',
  },
];

export default function PatientTimeline() {
  const [selectedIdx, setSelectedIdx] = useState(2); // Default to M12
  const activeVisit = SAMPLE_JOURNEY[selectedIdx];

  return (
    <div className="patient-journey-container">
      <div className="journey-topline">
        <div>
          <span className="scientific-tag">LONGITUDINAL PATIENT ARCHIVE · CASE STUDY</span>
          <h3 className="journey-title">Trajectory Over 36 Months of Disease Progression</h3>
        </div>
        <div className="de-id-badge">
          <ShieldCheck size={14} /> DE-IDENTIFIED RESEARCH COHORT (PATNO-3401 · Tariq M., 62y)
        </div>
      </div>

      <p className="journey-copy">
        Parkinson&apos;s evolves slowly over years. Notice how 3D imaging is present only at Baseline and Month 12,
        yet ParkiSight-AI maintains seamless continuous tracking through intermediate visits.
      </p>

      {/* Timeline Stepper */}
      <div className="timeline-stepper" role="tablist" aria-label="Select patient follow-up visit">
        {SAMPLE_JOURNEY.map((v, i) => (
          <button
            key={v.visitId}
            type="button"
            role="tab"
            aria-selected={selectedIdx === i}
            onClick={() => setSelectedIdx(i)}
            className={`timeline-step-btn ${selectedIdx === i ? 'active' : ''}`}
          >
            <div className="step-point">
              <span className={`point-spect ${v.spectAvailable ? 'has-spect' : 'no-spect'}`} />
            </div>
            <strong className="step-id">{v.visitId}</strong>
            <span className="step-time">{v.intervalMonths} mo</span>
            <small className="step-imaging">{v.spectAvailable ? 'SPECT' : 'Clinical Only'}</small>
          </button>
        ))}
      </div>

      {/* Selected Visit Inspection Card */}
      <div className="visit-inspect-card">
        <div className="inspect-head">
          <div>
            <span className="inspect-interval">{activeVisit.month}</span>
            <h4 className="inspect-stage">{activeVisit.predictedStage}</h4>
          </div>
          <div className="inspect-badges">
            <span className={`badge-pill ${activeVisit.spectAvailable ? 'spect-on' : 'spect-off'}`}>
              <ScanLine size={13} /> {activeVisit.spectAvailable ? '3D SPECT Available' : 'SPECT Missing (Prior M)'}
            </span>
            <span className="badge-pill med-pill">
              Medication: {activeVisit.medication}
            </span>
          </div>
        </div>

        <div className="inspect-metrics-grid">
          <div className="metric-chip">
            <span className="chip-label">MDS-UPDRS PART I</span>
            <b className="chip-val">{activeVisit.updrs1} <small>/ 52</small></b>
            <span className="chip-sub">Non-motor symptoms</span>
          </div>
          <div className="metric-chip">
            <span className="chip-label">MDS-UPDRS PART II</span>
            <b className="chip-val">{activeVisit.updrs2} <small>/ 52</small></b>
            <span className="chip-sub">Daily living motor score</span>
          </div>
          <div className="metric-chip">
            <span className="chip-label">MoCA COGNITIVE</span>
            <b className="chip-val">{activeVisit.moca} <small>/ 30</small></b>
            <span className="chip-sub">Normal range ≥26</span>
          </div>
          <div className="metric-chip">
            <span className="chip-label">SCHWAB & ENGLAND ADL</span>
            <b className="chip-val">{activeVisit.adl}%</b>
            <span className="chip-sub">Functional independence</span>
          </div>
          <div className="metric-chip highlight-chip">
            <span className="chip-label">ESTIMATED MOTOR SEVERITY</span>
            <b className="chip-val">{activeVisit.predictedMotor} <small>/ 132</small></b>
            <span className="chip-sub">NP3TOT continuous score</span>
          </div>
        </div>

        <div className="inspect-note">
          <strong>Clinician Encounter Note:</strong>
          <p>{activeVisit.clinicalNote}</p>
        </div>
      </div>
    </div>
  );
}
