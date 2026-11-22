'use client';

import { useState } from 'react';
import { VERIFIED_BENCHMARKS, COMPARATOR_MODELS, RESEARCH_METADATA } from '@/lib/research-data';
import { ChartNoAxesCombined, Check, ShieldCheck, ArrowUpRight, HelpCircle, AlertTriangle, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import type { ResearchMetric } from '@/lib/types';

export default function EvidenceExplorer() {
  const [selectedTaskId, setSelectedTaskId] = useState<string>('staging-balanced-acc');
  const [methodologyExpanded, setMethodologyExpanded] = useState<boolean>(false);

  const activeMetric: ResearchMetric =
    VERIFIED_BENCHMARKS.find((m) => m.id === selectedTaskId) || VERIFIED_BENCHMARKS[0];

  return (
    <div className="evidence-explorer-container" id="evidence-explorer">
      <div className="evidence-header">
        <div>
          <span className="scientific-tag">RESEARCH EVALUATION REGISTRY · HELD-OUT & EXTERNAL COHORTS</span>
          <h3 className="evidence-main-title">Manuscript-Reported Benchmarks & Provenance</h3>
        </div>
        <div className="provenance-tag">
          <ShieldCheck size={14} /> ZERO PATIENT OVERLAP (PATNO ISOLATED)
        </div>
      </div>

      {/* Task Selector Tabs */}
      <div className="task-filter-pills" role="tablist" aria-label="Select evaluation benchmark task">
        {VERIFIED_BENCHMARKS.map((metric, idx) => (
          <button
            key={metric.id}
            type="button"
            role="tab"
            aria-selected={selectedTaskId === metric.id}
            className={selectedTaskId === metric.id ? 'active' : ''}
            onClick={() => {
              setSelectedTaskId(metric.id);
              setMethodologyExpanded(false);
            }}
          >
            0{idx + 1} / {metric.label.split(' ')[0]} {metric.label.split(' ')[1] || ''}
          </button>
        ))}
      </div>

      {/* Hero Metric Banner for Selected Task */}
      <div className="task-hero-display">
        <div className="task-banner-content">
          <div className="big-stat-block">
            <span className="stat-label">{activeMetric.dataset} · {activeMetric.label.toUpperCase()}</span>
            <strong className="stat-number">
              {activeMetric.displayValue}
            </strong>
            <small className="stat-caption">{activeMetric.evaluationSplit}</small>
          </div>
          <div className="stat-context-block">
            <div className="metric-meta-badges">
              <span className="meta-badge-item">Task: {activeMetric.task}</span>
              <span className="meta-badge-item">Model: {activeMetric.modelVersion}</span>
              <span className="meta-badge-item status-badge">
                Status: {activeMetric.verificationStatus}
              </span>
            </div>
            <p className="metric-primary-methodology">
              {activeMetric.methodology}
            </p>
            {activeMetric.limitations && (
              <p className="metric-limitation-callout">
                <strong>Documented Caveat:</strong> {activeMetric.limitations}
              </p>
            )}

            {/* Expandable Methodology & Provenance Toggle */}
            <button
              type="button"
              className="toggle-methodology-btn"
              onClick={() => setMethodologyExpanded(!methodologyExpanded)}
              aria-expanded={methodologyExpanded}
            >
              <FileText size={13} />
              <span>{methodologyExpanded ? 'Hide Provenance & Verification Details' : 'View Full Scientific Provenance'}</span>
              {methodologyExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>

        {/* Expandable Methodology Drawer */}
        {methodologyExpanded && (
          <div className="methodology-expanded-drawer">
            <div className="provenance-grid">
              <div className="provenance-col">
                <span className="prov-key">SOURCE MANUSCRIPT REFERENCE</span>
                <strong className="prov-val">{activeMetric.source}</strong>
                <small>ParkiSight-AI Research Consortium ({RESEARCH_METADATA.year})</small>
              </div>
              <div className="provenance-col">
                <span className="prov-key">COHORT PARTITION PROTOCOL</span>
                <strong className="prov-val">{activeMetric.evaluationSplit}</strong>
                <small>Patient-level separation (PATNO isolated)</small>
              </div>
              <div className="provenance-col">
                <span className="prov-key">VERIFICATION STATUS</span>
                <strong className="prov-val status-val">{activeMetric.verificationStatus.toUpperCase()}</strong>
                <small>Reproducible experimental artifact</small>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Full Multi-Model Comparator Table */}
      <div className="comparator-table-panel">
        <div className="table-caption-bar">
          <h5>MODEL COMPARISON ON PPMI HELD-OUT TEST COHORT</h5>
          <span>70 / 15 / 15 GroupShuffleSplit by PATNO · Zero Patient Overlap</span>
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
          <strong>Scientific Integrity Disclosure:</strong> All metrics displayed above represent manuscript-reported research evaluation results. They reflect the documented offline evaluation on held-out PPMI and zero-shot PDBP cohorts and are not live patient outputs.
        </span>
      </div>
    </div>
  );
}
