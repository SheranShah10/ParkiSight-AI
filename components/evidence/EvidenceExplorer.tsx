'use client';

import { useState } from 'react';
import { VERIFIED_BENCHMARKS, COMPARATOR_MODELS } from '@/lib/research-data';
import { ChartNoAxesCombined, Check, ShieldCheck, ArrowUpRight, HelpCircle, AlertTriangle } from 'lucide-react';

export default function EvidenceExplorer() {
  const [selectedTask, setSelectedTask] = useState<'staging' | 'severity' | 'sparsity' | 'external' | 'progression'>('staging');

  return (
    <div className="evidence-explorer-container" id="evidence-explorer">
      <div className="evidence-header">
        <div>
          <span className="scientific-tag">PEER-REVIEWED EVALUATION · HELD-OUT & EXTERNAL COHORTS</span>
          <h3 className="evidence-main-title">Rigorous Benchmarks Grounded in Data Integrity</h3>
        </div>
        <div className="provenance-tag">
          <ShieldCheck size={14} /> ZERO PATIENT OVERLAP (PATNO ISOLATED)
        </div>
      </div>

      {/* Task Selector Tabs */}
      <div className="task-filter-pills" role="tablist" aria-label="Select evaluation benchmark task">
        <button
          type="button"
          role="tab"
          aria-selected={selectedTask === 'staging'}
          className={selectedTask === 'staging' ? 'active' : ''}
          onClick={() => setSelectedTask('staging')}
        >
          01 / 4-Class Staging
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={selectedTask === 'severity'}
          className={selectedTask === 'severity' ? 'active' : ''}
          onClick={() => setSelectedTask('severity')}
        >
          02 / Motor Severity (R²)
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={selectedTask === 'sparsity'}
          className={selectedTask === 'sparsity' ? 'active' : ''}
          onClick={() => setSelectedTask('sparsity')}
        >
          03 / Missing SPECT Curve
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={selectedTask === 'external'}
          className={selectedTask === 'external' ? 'active' : ''}
          onClick={() => setSelectedTask('external')}
        >
          04 / PDBP Zero-Shot
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={selectedTask === 'progression'}
          className={selectedTask === 'progression' ? 'active' : ''}
          onClick={() => setSelectedTask('progression')}
        >
          05 / Honest Forecasting
        </button>
      </div>

      {/* Hero Metric Banner for Selected Task */}
      <div className="task-hero-display">
        {selectedTask === 'staging' && (
          <div className="task-banner-content">
            <div className="big-stat-block">
              <span className="stat-label">PPMI HELD-OUT BALANCED ACCURACY</span>
              <strong className="stat-number">71.11%</strong>
              <small className="stat-caption">95% Wilson Interval [67.8% – 74.2%] · 728 test visits</small>
            </div>
            <div className="stat-context-block">
              <p>
                <strong>Why Balanced Accuracy?</strong> Rare stages (such as Stage 3, prevalence 3.6%) are weighted
                equally with common stages. Standalone 3D CNN achieves only <strong>24.68%</strong> (essentially random
                chance), proving that imaging requires clinical fusion.
              </p>
            </div>
          </div>
        )}

        {selectedTask === 'severity' && (
          <div className="task-banner-content">
            <div className="big-stat-block">
              <span className="stat-label">CONTINUOUS MOTOR EXPLAINED VARIANCE</span>
              <strong className="stat-number">0.7256 <small>R²</small></strong>
              <small className="stat-caption">RMSE = 7.97 points on 0–132 NP3TOT scale</small>
            </div>
            <div className="stat-context-block">
              <p>
                <strong>Outperforming Tabular Transformers:</strong> ParkiSight matches tuned gradient-boosted trees
                (0.7300) while exceeding FT-Transformer (0.7015), TabNet (0.6890), and SAINT (0.7084).
              </p>
            </div>
          </div>
        )}

        {selectedTask === 'sparsity' && (
          <div className="task-banner-content">
            <div className="big-stat-block">
              <span className="stat-label">RETAINED ACCURACY UNDER 100% MASKING</span>
              <strong className="stat-number">69.80%</strong>
              <small className="stat-caption">Decline of only −3.05 percentage points from 0% mask</small>
            </div>
            <div className="stat-context-block">
              <p>
                <strong>Resilience Without Synthetic Hallucinations:</strong> The learnable prior token <em>M</em> preserves
                the multimodal latent geometry when DaTSCAN is absent, unlike zero-fill which plummets to 61.24%.
              </p>
            </div>
          </div>
        )}

        {selectedTask === 'external' && (
          <div className="task-banner-content">
            <div className="big-stat-block">
              <span className="stat-label">PDBP ZERO-SHOT EXTERNAL COHORT</span>
              <strong className="stat-number">67.84%</strong>
              <small className="stat-caption">N=1,120 participants · 4,812 encounters · 100% missing SPECT</small>
            </div>
            <div className="stat-context-block">
              <p>
                <strong>Zero Fine-Tuning Generalization:</strong> Tested on an external multi-center cohort from the
                NINDS PDBP registry without re-training, proving our model generalizes beyond PPMI institutional bias.
              </p>
            </div>
          </div>
        )}

        {selectedTask === 'progression' && (
          <div className="task-banner-content">
            <div className="big-stat-block">
              <span className="stat-label">36-MONTH RATE-OF-CHANGE (ΔR²)</span>
              <strong className="stat-number">+0.0216</strong>
              <small className="stat-caption">Statistically confirmed signal (ElasticNet +0.0308, FDR q = 0.038)</small>
            </div>
            <div className="stat-context-block">
              <p>
                <strong>Scientific Honesty Over Hype:</strong> Short horizons (12m and 24m) sit near the measurement
                noise floor. Naive models claim R² ≈ 0.60 simply because a patient&apos;s score tomorrow is correlated
                with today. We predict the true annual rate-of-change (ΔNP3TOT).
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Full Comparator Table */}
      <div className="comparator-table-panel">
        <div className="table-caption-bar">
          <h5>MODEL COMPARISON ON PPMI HELD-OUT TEST COHORT</h5>
          <span>70 / 15 / 15 GroupShuffleSplit by PATNO</span>
        </div>

        <div className="journal-table" role="table">
          <div className="table-row table-head" role="row">
            <span role="columnheader">ARCHITECTURE</span>
            <span role="columnheader">MODALITY</span>
            <span role="columnheader">STAGING BAL. ACC.</span>
            <span role="columnheader">MOTOR SEVERITY R²</span>
            <span role="columnheader">RMSE</span>
          </div>

          {COMPARATOR_MODELS.map((m, idx) => (
            <div
              key={m.name}
              className={`table-row ${idx === 0 ? 'row-highlight' : ''}`}
              role="row"
            >
              <strong className="model-cell" role="cell">
                {idx === 0 && <Check size={13} className="check-icon" />} {m.name}
              </strong>
              <span className="modality-cell" role="cell">{m.modality}</span>
              <b className="metric-cell" role="cell">{m.stagingBalAcc}</b>
              <b className="metric-cell" role="cell">{m.motorR2}</b>
              <span className="rmse-cell" role="cell">{m.rmse}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="evidence-audit-notice">
        <AlertTriangle size={14} />
        <span>
          <strong>Research Note:</strong> All values above are verified aggregate figures from peer-reviewed experiments. Interactive sliders in the demonstration dashboard produce simulated scenarios for interface evaluation.
        </span>
      </div>
    </div>
  );
}
