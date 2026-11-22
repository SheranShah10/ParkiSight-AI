'use client';

import { useState } from 'react';
import { COHORT_STROBE, ANTI_LEAKAGE_GUARDRAILS } from '@/lib/research-data';
import { ShieldCheck, Info, CheckCircle2, ChevronRight, HelpCircle, X } from 'lucide-react';

export default function CohortFlow() {
  const [sweddModalOpen, setSweddModalOpen] = useState(false);
  const [selectedExclusion, setSelectedExclusion] = useState<string | null>(null);

  return (
    <div className="strobe-cohort-container">
      <div className="cohort-header">
        <div>
          <span className="scientific-tag">STROBE COHORT METHODOLOGY · PPMI STUDY</span>
          <h3 className="cohort-main-title">Participant Selection & Strict Isolation Protocol</h3>
        </div>
        <button
          type="button"
          onClick={() => setSweddModalOpen(true)}
          className="swedd-info-btn"
        >
          <HelpCircle size={14} /> What is SWEDD (N=64)?
        </button>
      </div>

      <p className="cohort-sub-intro">
        To prevent confounding and distribution leakage, clinical cohorts must be audited before any model training begins.
      </p>

      {/* STROBE Flow Diagram */}
      <div className="strobe-diagram">
        {/* Step 1: Screened */}
        <div className="strobe-node node-screened">
          <span className="node-step">01 / SCREENED</span>
          <strong className="node-count">{COHORT_STROBE.screened.toLocaleString()}</strong>
          <span className="node-label">PPMI Potential Enrollees</span>
          <small className="node-sub">Screened for parkinsonian presentation</small>
        </div>

        <div className="strobe-connector">
          <span className="connector-line" />
          <div className="exclusion-branch">
            <span className="branch-line" />
            <div className="exclusion-box">
              <span className="excl-count">−{COHORT_STROBE.excludedTotal} EXCLUDED</span>
              <ul className="excl-list">
                {COHORT_STROBE.excludedDetails.map((ex) => (
                  <li key={ex.label}>
                    <strong>{ex.count}</strong> {ex.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Step 2: Final Analytic Cohort */}
        <div className="strobe-node node-final">
          <span className="node-step">02 / INCLUDED COHORT</span>
          <strong className="node-count">{COHORT_STROBE.includedParticipants.toLocaleString()}</strong>
          <span className="node-label">Confirmed Participants</span>
          <small className="node-sub">
            {COHORT_STROBE.totalVisits.toLocaleString()} visits · {COHORT_STROBE.longitudinalSpanMonths} months observation
          </small>
        </div>

        <div className="strobe-connector">
          <span className="connector-line" />
        </div>

        {/* Step 3: Partitions */}
        <div className="strobe-node node-partitions">
          <span className="node-step">03 / PATIENT-ISOLATED PARTITION</span>
          <div className="partition-split-bar">
            <div className="part-segment train" style={{ width: '70%' }}>
              <span>TRAIN 70%</span>
            </div>
            <div className="part-segment val" style={{ width: '15%' }}>
              <span>VAL 15%</span>
            </div>
            <div className="part-segment test" style={{ width: '15%' }}>
              <span>TEST 15%</span>
            </div>
          </div>
          <div className="part-meta">
            <b>GroupShuffleSplit by PATNO</b>
            <span>Zero patient overlap across folds · 221 patients (728 visits) in held-out test</span>
          </div>
        </div>
      </div>

      {/* Verified Research Safeguards */}
      <div className="safeguards-section">
        <h4 className="safeguards-title">
          <ShieldCheck size={18} /> Verified Research Integrity Safeguards
        </h4>
        <div className="safeguards-grid">
          {ANTI_LEAKAGE_GUARDRAILS.map((guard) => (
            <div key={guard.id} className="safeguard-card">
              <div className="safeguard-head">
                <CheckCircle2 size={15} />
                <h5>{guard.name}</h5>
              </div>
              <span className="safeguard-principle">{guard.principle}</span>
              <p className="safeguard-impl">{guard.implementation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* SWEDD Modal Explanation */}
      {sweddModalOpen && (
        <div className="swedd-modal-backdrop" onClick={() => setSweddModalOpen(false)}>
          <div className="swedd-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <h4>Understanding SWEDD in Parkinson&apos;s Research</h4>
              <button type="button" onClick={() => setSweddModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p>
                <strong>SWEDD</strong> stands for <em>Scans Without Evidence of Dopaminergic Deficit</em>.
              </p>
              <p>
                In PPMI, <strong>64 participants</strong> presented with genuine clinical signs of parkinsonism
                (such as resting tremor or asymmetric bradykinesia), but their ¹²³I-DaTSCAN SPECT scans showed
                completely normal presynaptic dopamine transporter density in the striatum.
              </p>
              <p>
                <strong>Why exclude them?</strong> Most SWEDD cases are later adjudicated as dystonic tremor,
                essential tremor, drug-induced parkinsonism, or functional neurological disorders. Including them in
                a dopaminergic neurodegeneration model creates ground-truth label noise.
              </p>
              <div className="modal-caveat">
                <Info size={14} />
                <span>
                  <strong>Clinical Caveat:</strong> Excluding SWEDD does not prove that a participant is permanently
                  free of all disease, but ensures the training cohort strictly reflects true dopaminergic degeneration.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
