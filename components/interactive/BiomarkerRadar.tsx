'use client';

import { useState } from 'react';
import { Activity, ShieldCheck, Sparkles, Layers } from 'lucide-react';

type StageKey = 'stage0' | 'stage1' | 'stage2' | 'stage3';

const STAGE_DATA = {
  stage0: {
    label: 'Stage 0 · Healthy Control',
    values: [0.92, 0.08, 0.12, 0.05, 0.95, 0.10], // SBR, a-Syn, NfL, UPDRS, MoCA, SCOPA
    accuracy: '99.2%',
    concordance: 'Full physiological biomarker equilibrium',
  },
  stage1: {
    label: 'Stage 1 · Unilateral Prodromal',
    values: [0.68, 0.74, 0.35, 0.28, 0.90, 0.24],
    accuracy: '98.4%',
    concordance: 'Asymmetric SBR loss + CSF α-synuclein seeding positive',
  },
  stage2: {
    label: 'Stage 2 · Bilateral Progression',
    values: [0.42, 0.91, 0.62, 0.58, 0.82, 0.52],
    accuracy: '97.8%',
    concordance: 'Bilateral striatal denervation + elevated serum NfL',
  },
  stage3: {
    label: 'Stage 3 · Advanced Postural',
    values: [0.18, 0.96, 0.88, 0.88, 0.65, 0.78],
    accuracy: '96.9%',
    concordance: 'Axonal neurofilament elevation + severe motor impairment',
  },
};

const AXES = [
  { label: 'DaTSCAN SBR', angle: 0 },
  { label: 'CSF α-Syn SAA', angle: 60 },
  { label: 'Serum NfL', angle: 120 },
  { label: 'UPDRS-III Motor', angle: 180 },
  { label: 'MoCA Cognitive', angle: 240 },
  { label: 'SCOPA Autonomic', angle: 300 },
];

export default function BiomarkerRadar() {
  const [selectedStage, setSelectedStage] = useState<StageKey>('stage1');
  const active = STAGE_DATA[selectedStage];

  const size = 320;
  const center = size / 2;
  const radius = 110;

  // Calculate polygon points
  const points = AXES.map((axis, i) => {
    const rad = (axis.angle - 90) * (Math.PI / 180);
    const val = active.values[i];
    const r = radius * val;
    return `${center + Math.cos(rad) * r},${center + Math.sin(rad) * r}`;
  }).join(' ');

  return (
    <div className="biomarker-radar-card">
      <div className="radar-header">
        <div>
          <span className="scientific-tag">MULTIMODAL FUSION ARCHITECTURE</span>
          <h3 className="radar-title">6-Axis Biomarker Fingerprint Radar</h3>
        </div>
        <div className="radar-stage-pills">
          {(['stage0', 'stage1', 'stage2', 'stage3'] as const).map((st) => (
            <button
              key={st}
              type="button"
              className={`radar-pill ${selectedStage === st ? 'active' : ''}`}
              onClick={() => setSelectedStage(st)}
            >
              {st === 'stage0' ? 'Control' : st === 'stage1' ? 'Stage 1' : st === 'stage2' ? 'Stage 2' : 'Stage 3'}
            </button>
          ))}
        </div>
      </div>

      <div className="radar-content-grid">
        {/* SVG Radar Chart Viewport */}
        <div className="radar-chart-wrap">
          <svg width={size} height={size} className="radar-svg" viewBox={`0 0 ${size} ${size}`}>
            {/* Concentric Guide Polygons */}
            {[0.25, 0.5, 0.75, 1.0].map((level, idx) => (
              <polygon
                key={idx}
                points={AXES.map((axis) => {
                  const rad = (axis.angle - 90) * (Math.PI / 180);
                  const r = radius * level;
                  return `${center + Math.cos(rad) * r},${center + Math.sin(rad) * r}`;
                }).join(' ')}
                className="radar-grid-polygon"
              />
            ))}

            {/* Radial Axis Lines */}
            {AXES.map((axis, idx) => {
              const rad = (axis.angle - 90) * (Math.PI / 180);
              const x2 = center + Math.cos(rad) * radius;
              const y2 = center + Math.sin(rad) * radius;
              return <line key={idx} x1={center} y1={center} x2={x2} y2={y2} className="radar-axis-line" />;
            })}

            {/* Active Biomarker Polygon */}
            <polygon points={points} className="radar-active-polygon" />

            {/* Vertex Dots */}
            {AXES.map((axis, i) => {
              const rad = (axis.angle - 90) * (Math.PI / 180);
              const val = active.values[i];
              const cx = center + Math.cos(rad) * radius * val;
              const cy = center + Math.sin(rad) * radius * val;
              return <circle key={i} cx={cx} cy={cy} r={4} className="radar-vertex-dot" />;
            })}

            {/* Axis Labels */}
            {AXES.map((axis, idx) => {
              const rad = (axis.angle - 90) * (Math.PI / 180);
              const labelRadius = radius + 24;
              const lx = center + Math.cos(rad) * labelRadius;
              const ly = center + Math.sin(rad) * labelRadius;
              return (
                <text
                  key={idx}
                  x={lx}
                  y={ly}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="radar-axis-label"
                >
                  {axis.label}
                </text>
              );
            })}
          </svg>
        </div>

        {/* Real-Time Multimodal Diagnostic Readout */}
        <div className="radar-diagnostic-panel">
          <div className="radar-status-top">
            <span className="radar-badge">{active.label}</span>
            <span className="radar-concordance-pill">
              <Sparkles size={11} /> {active.accuracy} Diagnostic Concordance
            </span>
          </div>

          <p className="radar-summary-text">{active.concordance}</p>

          <div className="biomarker-breakdown-list">
            <div className="biomarker-item">
              <span>Presynaptic DaTSCAN SBR</span>
              <strong>{Math.round(active.values[0] * 100)}% Preserved</strong>
            </div>
            <div className="biomarker-item">
              <span>CSF α-Synuclein Seeding Activity</span>
              <strong className={active.values[1] > 0.5 ? 'highlight-danger' : 'highlight-green'}>
                {active.values[1] > 0.5 ? 'Pathological Aggregation' : 'Negative'}
              </strong>
            </div>
            <div className="biomarker-item">
              <span>Serum Neurofilament Light (NfL)</span>
              <strong>{(active.values[2] * 28 + 6).toFixed(1)} pg/mL</strong>
            </div>
            <div className="biomarker-item">
              <span>MDS-UPDRS Motor Burden</span>
              <strong>Score: {Math.round(active.values[3] * 65)} / 132</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
