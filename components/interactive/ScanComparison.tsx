'use client';

import { useState } from 'react';
import { ScanLine, Info, ShieldCheck, ArrowRight } from 'lucide-react';

export default function ScanComparison() {
  const [sliderPos, setSliderPos] = useState(50);
  const [activeTab, setActiveTab] = useState<'comparison' | 'spectDetails'>('comparison');

  return (
    <div className="scan-comparison-card">
      <div className="comparison-header">
        <div>
          <span className="scientific-tag">EDUCATIONAL WORKSTATION · COMPARATIVE VIEW</span>
          <h3 className="comparison-title">DaTSCAN SPECT vs. Anatomical Striatum</h3>
        </div>
        <div className="tab-pills" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'comparison'}
            className={activeTab === 'comparison' ? 'active' : ''}
            onClick={() => setActiveTab('comparison')}
          >
            Dual Comparison
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'spectDetails'}
            className={activeTab === 'spectDetails' ? 'active' : ''}
            onClick={() => setActiveTab('spectDetails')}
          >
            Tracer Mechanics
          </button>
        </div>
      </div>

      {activeTab === 'comparison' ? (
        <div className="interactive-split-viewer">
          <div className="split-viewport">
            {/* Left side: Normal Physiological Uptake */}
            <div className="viewport-half left-half" style={{ width: `${sliderPos}%` }}>
              <div className="tracer-canvas normal-tracer">
                <div className="tracer-glow crescent-left" />
                <div className="tracer-glow crescent-right" />
                <div className="tracer-core" />
              </div>
              <div className="viewport-overlay-tag left-tag">
                <span className="dot healthy" /> NORMAL PHYSIOLOGY
                <small>Bilateral comma-shaped crescent uptake in caudate + putamen</small>
              </div>
            </div>

            {/* Right side: Parkinson's Striatal Dopaminergic Deficit */}
            <div className="viewport-half right-half">
              <div className="tracer-canvas deficit-tracer">
                <div className="tracer-glow dot-left" />
                <div className="tracer-glow faint-right" />
                <div className="tracer-core loss" />
              </div>
              <div className="viewport-overlay-tag right-tag">
                <span className="dot deficit" /> PARKINSONIAN DEFICIT
                <small>Asymmetric putaminal loss; reduced to rounded, dot-like caudate signals</small>
              </div>
            </div>

            {/* Split Slider Handle */}
            <div className="split-handle" style={{ left: `${sliderPos}%` }}>
              <div className="handle-line" />
              <div className="handle-grip" aria-hidden="true">
                <span />
                <span />
              </div>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={sliderPos}
              onChange={(e) => setSliderPos(Number(e.target.value))}
              className="split-range-input"
              aria-label="Drag to compare normal versus parkinsonian DaTSCAN uptake"
            />
          </div>

          <div className="comparison-meta-strip">
            <div className="meta-col">
              <span className="meta-key">TRACER LIGAND</span>
              <b className="meta-val">¹²³I-Ioflupane (DaTquant™)</b>
            </div>
            <div className="meta-col">
              <span className="meta-key">BIOLOGICAL TARGET</span>
              <b className="meta-val">Presynaptic Dopamine Transporter (DAT)</b>
            </div>
            <div className="meta-col">
              <span className="meta-key">RECONSTRUCTION</span>
              <b className="meta-val">128 × 128 × 120 Voxel Matrix</b>
            </div>
          </div>
        </div>
      ) : (
        <div className="spect-mechanics-panel">
          <div className="mechanics-grid">
            <article className="mechanic-card">
              <div className="mechanic-num">01</div>
              <h4>Radioligand Binding</h4>
              <p>
                ¹²³I-ioflupane binds selectively to presynaptic dopamine transporters located on axonal terminals
                projecting from the substantia nigra pars compacta to the striatum.
              </p>
            </article>
            <article className="mechanic-card">
              <div className="mechanic-num">02</div>
              <h4>Asymmetric Degradation</h4>
              <p>
                In idiopathic Parkinson&apos;s disease, neurodegeneration follows an asymmetric pattern, typically
                depleting the contralateral posterior putamen first, progressing anteriorly toward the caudate.
              </p>
            </article>
            <article className="mechanic-card">
              <div className="mechanic-num">03</div>
              <h4>Why Not Standalone?</h4>
              <p>
                DaTSCAN alone cannot distinguish idiopathic Parkinson&apos;s from atypical parkinsonisms (MSA, PSP).
                Furthermore, dopaminergic binding reaches an uptake floor in mid-to-late stages, requiring clinical context.
              </p>
            </article>
          </div>
        </div>
      )}

      <div className="comparison-disclaimer">
        <Info size={14} />
        <span>
          <strong>Scientific Note:</strong> DaTSCAN imaging visualizes dopamine transporter density in parts of the striatum. Reduced uptake provides objective evidence of dopaminergic loss but is not an autonomous diagnosis.
        </span>
      </div>
    </div>
  );
}
