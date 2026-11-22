'use client';

import { useState } from 'react';
import { ScanLine, Activity, ArrowRight, Check, Zap, Cpu, Sparkles } from 'lucide-react';

type Props = {
  spectOn?: boolean;
  onToggleSpect?: (on: boolean) => void;
};

export default function AMGUControl({ spectOn: externalSpect, onToggleSpect }: Props) {
  const [internalSpect, setInternalSpect] = useState(true);
  const isSpectOn = externalSpect !== undefined ? externalSpect : internalSpect;

  const toggle = () => {
    const next = !isSpectOn;
    if (onToggleSpect) {
      onToggleSpect(next);
    } else {
      setInternalSpect(next);
    }
  };

  const gateWeight = isSpectOn ? 0.482 : 0.935;
  const latency = isSpectOn ? 16.0 : 3.6;

  return (
    <div className="amgu-fusion-container">
      {/* Top Controller Toggle */}
      <div className="amgu-switch-bar">
        <div className="switch-info">
          <span className="scientific-tag">ADAPTIVE MODALITY GATING UNIT (AMGU)</span>
          <h4>NeuroCross-VelocityNet Dynamic Routing</h4>
        </div>

        <button
          type="button"
          onClick={toggle}
          className={`amgu-toggle-btn ${isSpectOn ? 'spect-active' : 'prior-active'}`}
          aria-pressed={isSpectOn}
        >
          <ScanLine size={16} />
          <span>SPECT INPUT: <strong>{isSpectOn ? 'AVAILABLE' : 'ABSENT'}</strong></span>
          <span className="toggle-switch"><i /></span>
        </button>
      </div>

      {/* Architectural Diagram with Data-Flow */}
      <div className="architecture-canvas">
        {/* Stream 1: Tabular Clinical Stream (Always Active) */}
        <div className="arch-stream clinical-stream active">
          <div className="stream-badge">
            <Activity size={14} /> CLINICAL HISTORY (328 FEATURES)
          </div>
          <div className="stream-box">
            <span className="box-title">GLU-Enhanced Tabular ResNet</span>
            <ul className="stream-features">
              <li>142 Clinimetric (MDS-UPDRS I & II, MoCA, ADL)</li>
              <li>28 Biofluid (CSF α-Syn SAA, Serum NfL)</li>
              <li>18 SBR Striatal Marker Features</li>
              <li>Genetic Variants (LRRK2, GBA, APOE ε4)</li>
            </ul>
          </div>
          <div className="stream-wire active-wire" />
        </div>

        {/* Stream 2: Imaging Stream OR Prior Token Stream */}
        <div className={`arch-stream imaging-stream ${isSpectOn ? 'active' : 'dimmed'}`}>
          <div className="stream-badge">
            <ScanLine size={14} /> {isSpectOn ? '3D DaTSCAN SPECT' : 'PRIOR TOKEN ROUTE'}
          </div>

          {isSpectOn ? (
            <div className="stream-box imaging-box">
              <span className="box-title">3D CNN + Striatal Self-Attention</span>
              <ul className="stream-features">
                <li>128 × 128 × 120 Voxel Volume</li>
                <li>8 × 8 × 7 Spatial Lattice</li>
                <li>448 Visual Tokens</li>
                <li>Presynaptic DAT Binding Density</li>
              </ul>
            </div>
          ) : (
            <div className="stream-box prior-box">
              <div className="prior-token-icon">M</div>
              <span className="box-title">Learnable Missing Prior Token M</span>
              <p className="prior-expl">
                Stabilizes cross-attention latent manifold without fabricating fake imagery.
              </p>
            </div>
          )}
          <div className={`stream-wire ${isSpectOn ? 'active-wire' : 'prior-wire'}`} />
        </div>

        {/* The Center: AMGU Gate */}
        <div className="arch-center-gate">
          <div className="gate-core-ring">
            <div className="gate-number">
              <b>{gateWeight.toFixed(3)}</b>
              <small>GATE WEIGHT (g)</small>
            </div>
          </div>
          <div className="gate-status-tag">
            {isSpectOn ? 'BALANCED ROUTING' : 'CLINICAL-LED PRIOR M'}
          </div>
          <div className="latency-indicator">
            <Zap size={12} /> Inference: <strong>{latency} ms</strong>
          </div>
        </div>

        {/* Output Multi-Task Heads */}
        <div className="arch-output-heads">
          <div className="head-box">
            <span className="head-tag">HEAD 1</span>
            <strong>4-Class Staging</strong>
            <small>Hoehn & Yahr (71.11% Bal. Acc.)</small>
          </div>
          <div className="head-box">
            <span className="head-tag">HEAD 2</span>
            <strong>Motor Severity</strong>
            <small>Continuous NP3TOT (R² = 0.7256)</small>
          </div>
          <div className="head-box">
            <span className="head-tag">HEAD 3</span>
            <strong>Progression Rate</strong>
            <small>36-Month Horizon (ΔR² = +0.0216)</small>
          </div>
        </div>
      </div>

      {/* Explanatory Footnote */}
      <div className="amgu-formula-note">
        <p>
          <strong>Mathematical Interpretation:</strong> The scalar gate weight <em>g</em> ∈ [0, 1] parameterizes the
          convex combination <em>Z</em> = (1 − <em>g</em>) · <em>Z</em><sub>clinical</sub> + <em>g</em> · <em>Z</em><sub>visual</sub>. Under missing imaging,
          <em>Z</em><sub>visual</sub> is replaced by learned prior embedding <em>M</em> ∈ ℝ<sup>256</sup> and <em>g</em> shifts to 0.935,
          preventing numerical divergence.
        </p>
      </div>
    </div>
  );
}
