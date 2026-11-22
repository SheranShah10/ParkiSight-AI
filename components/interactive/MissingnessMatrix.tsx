'use client';

import { useMemo, useState } from 'react';
import { ScanLine, AlertCircle, ShieldCheck } from 'lucide-react';
import { MASKING_CURVE_DATA } from '@/lib/research-data';

export default function MissingnessMatrix() {
  const [maskRate, setMaskRate] = useState(80); // Default to empirical ~80.9% PPMI sparsity

  // Total matrix representation: 140 sample longitudinal visit encounters
  const totalCells = 140;

  // Calculate cells missing imaging based on maskRate
  const matrixCells = useMemo(() => {
    return Array.from({ length: totalCells }, (_, i) => {
      // Deterministic hash to distribute missingness uniformly across visits
      const pseudoRandom = ((i * 37 + 13) % 100);
      const isMissing = pseudoRandom < maskRate;
      return { id: i, isMissing };
    });
  }, [maskRate]);

  // Find nearest verified benchmark point from research data
  const verifiedPoint = useMemo(() => {
    const rounded = Math.round(maskRate / 20) * 20;
    return MASKING_CURVE_DATA.find((pt) => pt.maskRate === rounded) || MASKING_CURVE_DATA[4];
  }, [maskRate]);

  return (
    <div className="missingness-matrix-container">
      <div className="matrix-topline">
        <div>
          <span className="scientific-tag">PPMI LONGITUDINAL VISITS · 8,802 TOTAL ENCOUNTERS</span>
          <h3 className="matrix-title">80.9% of Follow-up Visits Lack DaTSCAN Imaging</h3>
        </div>
        <div className="sparsity-badge">
          <b>{maskRate}%</b>
          <span>SPECT Sparsity Rate</span>
        </div>
      </div>

      <p className="matrix-description">
        Patients return every 6–12 months for clinical motor testing, but radioactive SPECT scans cannot be
        repeated at every encounter. The matrix below shows how imaging disappears across follow-up visits.
      </p>

      {/* Visual Dot Matrix of Visits */}
      <div className="matrix-grid-display" role="img" aria-label={`Matrix of 140 longitudinal visits with ${maskRate}% missing imaging`}>
        {matrixCells.map((cell) => (
          <div
            key={cell.id}
            className={`matrix-dot ${cell.isMissing ? 'missing' : 'available'}`}
            title={cell.isMissing ? 'Visit with Clinical Data Only (SPECT Missing)' : 'Full Multimodal Visit (SPECT Available)'}
          />
        ))}
      </div>

      <div className="matrix-legend">
        <span className="legend-item">
          <i className="dot-available" /> 3D SPECT Available (Full Multimodal)
        </span>
        <span className="legend-item">
          <i className="dot-missing" /> SPECT Unavailable (Prior Token M Route)
        </span>
      </div>

      {/* Interactive Stress Slider */}
      <div className="stress-slider-box">
        <div className="slider-header">
          <label htmlFor="mask-slider" className="slider-label">
            SIMULATE SPECT MASKING RATE (0% — 100%)
          </label>
          <span className="slider-value">
            <b>{maskRate}%</b> Missing Imaging
          </span>
        </div>
        <input
          id="mask-slider"
          type="range"
          min="0"
          max="100"
          step="5"
          value={maskRate}
          onChange={(e) => setMaskRate(Number(e.target.value))}
          className="scientific-range"
        />
        <div className="slider-endpoints">
          <span>0% (All Visits Imaged)</span>
          <span>80.9% (Real PPMI Reality)</span>
          <span>100% (Complete Imaging Absence)</span>
        </div>
      </div>

      {/* Model Resilience vs Competitors Comparison */}
      <div className="retention-comparison-card">
        <div className="retention-header">
          <span>VERIFIED PERFORMANCE AT {verifiedPoint.maskRate}% MASKING</span>
          <small>Source: Research Article Section 4.4, Figure 5</small>
        </div>

        <div className="retention-bars">
          <div className="retention-row highlight">
            <span className="model-name">ParkiSight-AI (Prior Token M)</span>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${verifiedPoint.parkisight}%` }} />
            </div>
            <strong className="bar-val">{verifiedPoint.parkisight.toFixed(2)}%</strong>
          </div>

          <div className="retention-row">
            <span className="model-name">Modality Dropout</span>
            <div className="bar-track">
              <div className="bar-fill comp" style={{ width: `${verifiedPoint.modalityDropout}%` }} />
            </div>
            <strong className="bar-val">{verifiedPoint.modalityDropout.toFixed(2)}%</strong>
          </div>

          <div className="retention-row">
            <span className="model-name">Static Concatenation</span>
            <div className="bar-track">
              <div className="bar-fill comp" style={{ width: `${verifiedPoint.staticConcat}%` }} />
            </div>
            <strong className="bar-val">{verifiedPoint.staticConcat.toFixed(2)}%</strong>
          </div>

          <div className="retention-row">
            <span className="model-name">Zero-Fill Imputation</span>
            <div className="bar-track">
              <div className="bar-fill comp danger" style={{ width: `${verifiedPoint.zeroFill}%` }} />
            </div>
            <strong className="bar-val">{verifiedPoint.zeroFill.toFixed(2)}%</strong>
          </div>
        </div>

        <div className="retention-note">
          <ShieldCheck size={14} />
          <span>
            Even at <strong>100% missing SPECT</strong>, ParkiSight retains <strong>69.80% balanced accuracy</strong> (only −3.05 pp decline), while naive zero-fill drops by −11.61 pp.
          </span>
        </div>
      </div>
    </div>
  );
}
