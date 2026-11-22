'use client';

import { useState } from 'react';
import { ScanLine, Info, ShieldCheck, ArrowRight, Clock, Activity, Sparkles } from 'lucide-react';

export default function ScanComparison() {
  const [sliderPos, setSliderPos] = useState(50);
  const [progressionYear, setProgressionYear] = useState(3);
  const [activeTab, setActiveTab] = useState<'comparison' | 'progression' | 'spectDetails'>('comparison');

  // Interpolated metrics across the 10-year timeline
  const sbrUptake = Math.max(0.65, Number((2.88 - (progressionYear * 0.224)).toFixed(2)));
  const putamenIntegrity = Math.max(12, Math.round(100 - (progressionYear * 8.8)));
  const motorUpdrs = Math.min(58, Math.round(18 + (progressionYear * 4.0)));
  const stageName =
    progressionYear <= 1
      ? 'Stage 0 · Prodromal / Control'
      : progressionYear <= 3
      ? 'Stage 1 · Unilateral Putamen Loss'
      : progressionYear <= 6
      ? 'Stage 2 · Bilateral Comma-to-Dot'
      : 'Stage 3 · Striatal Extinction';

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
            aria-selected={activeTab === 'progression'}
            className={activeTab === 'progression' ? 'active' : ''}
            onClick={() => setActiveTab('progression')}
          >
            <Clock size={12} /> 10-Year Progression Scrubber
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
      ) : activeTab === 'progression' ? (
        <div className="progression-scrubber-view">
          <div className="scrubber-topline">
            <div className="scrubber-year-badge">
              <Clock size={14} />
              <span>DISEASE DURATION: <strong>YEAR {progressionYear}</strong> OF PROGRESSION</span>
            </div>
            <div className="scrubber-quick-jump">
              {[0, 2, 5, 8, 10].map((yr) => (
                <button
                  key={yr}
                  type="button"
                  className={`scrub-step-btn ${progressionYear === yr ? 'active' : ''}`}
                  onClick={() => setProgressionYear(yr)}
                >
                  Yr {yr}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic DaTSCAN Morphing Viewport */}
          <div className="progression-viewport">
            <div className="spect-dynamic-canvas">
              {/* Left Striatum (Caudate + Putamen) */}
              <div
                className="spect-morph-left"
                style={{
                  opacity: Math.max(0.18, 1 - progressionYear * 0.08),
                  filter: `blur(${Math.max(1, progressionYear * 0.8)}px)`,
                  transform: `scale(${Math.max(0.55, 1 - progressionYear * 0.04)})`,
                }}
              />
              {/* Right Striatum (First to degenerate in early PD - comma tail vanishes) */}
              <div
                className="spect-morph-right"
                style={{
                  opacity: Math.max(0.08, 1 - progressionYear * 0.11),
                  filter: `blur(${Math.max(1, progressionYear * 1.2)}px)`,
                  transform: `scale(${Math.max(0.4, 1 - progressionYear * 0.065)})`,
                  borderRadius: progressionYear > 1 ? '50%' : '50% 50% 50% 10%', // morph comma to dot
                }}
              />
              <div className="spect-central-landmark" />
            </div>

            <div className="progression-stage-overlay">
              <span className="progression-stage-title">{stageName}</span>
              <p className="progression-stage-desc">
                {progressionYear <= 1 && 'Symmetric, full striatal binding. Both caudate nuclei and putamina present normal physiological comma shapes.'}
                {progressionYear > 1 && progressionYear <= 3 && 'Contralateral posterior putaminal tail extinguished. Classic unilateral transition from comma to round dot.'}
                {progressionYear > 3 && progressionYear <= 6 && 'Bilateral putaminal loss established. Striatal binding reduced to bilateral isolated caudate dots.'}
                {progressionYear > 6 && 'Extensive striatal extinction. Low signal-to-noise ratio approaching background non-specific cerebral scatter.'}
              </p>
            </div>
          </div>

          {/* Interactive Range Slider */}
          <div className="scrubber-slider-container">
            <div className="slider-ticks-row">
              <span>Year 0 (Prodromal)</span>
              <span>Year 2 (Early)</span>
              <span>Year 5 (Moderate)</span>
              <span>Year 8 (Advanced)</span>
              <span>Year 10 (End-Stage)</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={progressionYear}
              onChange={(e) => setProgressionYear(Number(e.target.value))}
              className="progression-range-input"
              aria-label="Scrub longitudinal disease year from 0 to 10"
            />
          </div>

          {/* Dynamic Scientific Gauges */}
          <div className="scrubber-gauges-grid">
            <div className="gauge-card">
              <span className="gauge-label">STRIATAL BINDING RATIO (SBR)</span>
              <strong className="gauge-val highlight-cyan">{sbrUptake}</strong>
              <small>Physiological baseline: ~2.88</small>
            </div>
            <div className="gauge-card">
              <span className="gauge-label">PUTAMEN INTEGRITY</span>
              <strong className="gauge-val highlight-amber">{putamenIntegrity}%</strong>
              <small>Volumetric dopaminergic density</small>
            </div>
            <div className="gauge-card">
              <span className="gauge-label">PROJECTED MDS-UPDRS MOTOR</span>
              <strong className="gauge-val highlight-orange">{motorUpdrs}</strong>
              <small>Severity score (Range: 0–132)</small>
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
