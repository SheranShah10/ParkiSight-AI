'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AnatomyInspector from '@/components/interactive/AnatomyInspector';
import ScanComparison from '@/components/interactive/ScanComparison';
import MissingnessMatrix from '@/components/interactive/MissingnessMatrix';
import AMGUControl from '@/components/interactive/AMGUControl';
import PatientTimeline from '@/components/interactive/PatientTimeline';
import CohortFlow from '@/components/evidence/CohortFlow';
import EvidenceExplorer from '@/components/evidence/EvidenceExplorer';
import ExplainabilityViewer from '@/components/evidence/ExplainabilityViewer';
import SpiralBiomarkerTest from '@/components/interactive/SpiralBiomarkerTest';
import BiomarkerRadar from '@/components/interactive/BiomarkerRadar';
import type { AnatomyFocus, SliceMode } from '@/lib/types';
import { Activity, ArrowRight, ArrowUpRight, ShieldCheck, ChevronDown, Sparkles, Layers, Cpu, HeartPulse } from 'lucide-react';

// Dynamic import of the 3D Brain Canvas with elegant loading placeholder
const RealBrainScene = dynamic(() => import('@/components/experience/RealBrainScene'), {
  ssr: false,
  loading: () => (
    <div className="brain-loading-shimmer" aria-label="Loading 3D Anatomical Brain Model">
      <div className="shimmer-spin" />
      <span>INITIALIZING NEURAL CANVAS…</span>
    </div>
  ),
});

export default function Home() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeChapter, setActiveChapter] = useState(0);
  const [spectMissing, setSpectMissing] = useState(false);
  const [sliceMode, setSliceMode] = useState<SliceMode>('axial');
  const [anatomyFocus, setAnatomyFocus] = useState<AnatomyFocus>('overview');
  const [labelsOn, setLabelsOn] = useState(true);

  // Monitor scroll for subtle 3D camera progression
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          const current = Math.min(1, Math.max(0, window.scrollY / Math.max(1, maxScroll)));
          setScrollProgress(current);

          // Update active chapter based on scroll position
          if (current < 0.22) setActiveChapter(0);
          else if (current < 0.44) setActiveChapter(1);
          else if (current < 0.65) setActiveChapter(2);
          else if (current < 0.85) setActiveChapter(3);
          else setActiveChapter(4);

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToImaging = () => {
    const el = document.getElementById('imaging');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="neural-archive-root" suppressHydrationWarning>
      {/* Global Grain Texture Overlay */}
      <div className="subtle-grain" aria-hidden="true" />

      {/* Adaptive Header Navigation */}
      <Header activeChapter={activeChapter} />

      <main>
        {/* =================================================================== */}
        {/* SCENE 01 — THE ARRIVAL (Cinematic Hero with Real 3D Anatomical Brain) */}
        {/* =================================================================== */}
        <section className="scene-hero dark-exhibition" id="arrival">
          <div className="hero-editorial-layout">
            {/* Left Column: Editorial & Scientific Narrative */}
            <div className="hero-editorial-col">
              <div className="hero-stamp-tag">
                <span className="live-indicator" />
                <span>PARKISIGHT / NEUROSCIENCE RESEARCH / 2026</span>
              </div>

              <h1 className="hero-display-heading">
                Understanding what the brain <span className="serif-highlight">reveals.</span>
              </h1>

              <p className="hero-narrative-lead">
                An interactive exploration of Parkinson&apos;s disease, longitudinal neuroimaging sparsity, and
                explainable multimodal machine learning.
              </p>

              {/* Verified Scientific Metrics Summary Strip */}
              <div className="hero-metrics-ribbon">
                <div className="ribbon-item">
                  <span className="ribbon-label">STAGING BAL. ACCURACY</span>
                  <strong className="ribbon-value">71.11%</strong>
                  <small className="ribbon-sub">PPMI Held-Out Test (N=221)</small>
                </div>
                <div className="ribbon-item">
                  <span className="ribbon-label">MOTOR SEVERITY</span>
                  <strong className="ribbon-value">0.7256 <small>R²</small></strong>
                  <small className="ribbon-sub">RMSE ±7.97 pts (0–132 NP3TOT)</small>
                </div>
                <div className="ribbon-item">
                  <span className="ribbon-label">100% MISSING SPECT</span>
                  <strong className="ribbon-value">69.80%</strong>
                  <small className="ribbon-sub">Retained via Prior Token M</small>
                </div>
              </div>

              {/* Call-to-Actions */}
              <div className="hero-cta-group">
                <Link href="/dashboard" className="hero-primary-btn">
                  <span>Enter the Research Workspace</span>
                  <ArrowUpRight size={17} />
                </Link>
                <Link href="/auth" className="hero-secondary-btn">
                  Choose Workspace Role
                </Link>
              </div>

              <div className="hero-academic-footnote">
                <ShieldCheck size={14} />
                <span>
                  GroupShuffleSplit by PATNO · Zero patient overlap across partitions · All 33 Part III items excised
                </span>
              </div>
            </div>

            {/* Right Column: Interactive 3D WebGL Brain Canvas */}
            <div className="hero-canvas-col">
              <div className="canvas-frame">
                <div className="canvas-top-hud">
                  <span className="hud-badge">
                    <i className="pulse-dot" /> 3D ANATOMICAL RECONSTRUCTION
                  </span>
                  <span className="hud-coord">STRIATAL VOLUME · 128³ VOXELS</span>
                </div>

                {/* Real Three.js Canvas */}
                <div className="canvas-container">
                  <RealBrainScene
                    progress={scrollProgress}
                    missing={spectMissing}
                    sliceMode={sliceMode}
                    labelsOn={labelsOn}
                    active={true}
                    focus={anatomyFocus}
                    onSelectAnatomy={(f) => setAnatomyFocus(f)}
                    onScrollToImaging={scrollToImaging}
                  />
                </div>

                {/* Anatomical Camera & Plane Inspector */}
                <AnatomyInspector
                  focus={anatomyFocus}
                  onSelectFocus={setAnatomyFocus}
                  sliceMode={sliceMode}
                  onSelectSlice={setSliceMode}
                  labelsOn={labelsOn}
                  onToggleLabels={() => setLabelsOn(!labelsOn)}
                  onScrollToImaging={scrollToImaging}
                />

                <div className="canvas-bottom-hud">
                  <div className="hud-left">
                    <span>ANATOMICAL TARGET: <strong>{anatomyFocus.toUpperCase()}</strong></span>
                    <small>DRAG TO ORBIT · CLICK TARGET TO FOCUS</small>
                  </div>
                  <button
                    type="button"
                    className={`spect-toggle-pill ${spectMissing ? 'is-missing' : 'is-imaged'}`}
                    onClick={() => setSpectMissing(!spectMissing)}
                  >
                    {spectMissing ? 'SPECT ABSENT · PRIOR M' : 'SPECT ACTIVE · BALANCED'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="hero-scroll-cue">
            <span>EXPLORE THE FIVE-CHAPTER EXHIBITION</span>
            <ChevronDown size={14} className="cue-bounce" />
          </div>
        </section>

        {/* =================================================================== */}
        {/* SCENE 02 — THE INVISIBLE SIGNAL (DaTSCAN & Dopamine Imaging)        */}
        {/* =================================================================== */}
        <section className="scene-editorial light-editorial" id="imaging">
          <div className="editorial-container">
            <div className="section-chapter-tag">
              <span>02 / 05</span>
              <span className="tag-line" />
              <span>THE INVISIBLE SIGNAL</span>
            </div>

            <div className="editorial-split-header">
              <h2 className="editorial-heading">
                A signal beneath the <span className="serif-highlight">surface.</span>
              </h2>
              <p className="editorial-copy">
                Parkinson&apos;s disease begins deep within the basal ganglia, where dopaminergic neurons in the
                substantia nigra pars compacta degenerate. ¹²³I-DaTSCAN SPECT imaging allows researchers to visualize
                presynaptic dopamine transporter (DAT) binding density in the striatum.
              </p>
            </div>

            {/* Interactive Dual-View Scan Comparison Workstation */}
            <ScanComparison />

            {/* Interactive Digital Neuromotor Biomarker Lab (Archimedes Spiral) */}
            <div style={{ marginTop: '48px' }}>
              <SpiralBiomarkerTest />
            </div>
          </div>
        </section>

        {/* =================================================================== */}
        {/* SCENE 03 — THE MISSING EVIDENCE (Longitudinal Sparsity Problem)    */}
        {/* =================================================================== */}
        <section className="scene-editorial dark-exhibition" id="missingness">
          <div className="editorial-container">
            <div className="section-chapter-tag">
              <span>03 / 05</span>
              <span className="tag-line" />
              <span>THE CLINICAL REALITY</span>
            </div>

            <div className="editorial-split-header">
              <h2 className="editorial-heading">
                When the evidence is <span className="serif-highlight">incomplete.</span>
              </h2>
              <p className="editorial-copy">
                Across a decade of longitudinal patient observation in the PPMI study, over <strong>80.9% of visits lack 3D DaTSCAN SPECT imaging</strong>.
                Scans are costly and involve radioactive tracer injection. A clinically useful system cannot assume
                that imaging is always available, nor can it hallucinate synthetic brain scans.
              </p>
            </div>

            {/* Interactive Missingness Matrix & 0-100% Masking Stress Test */}
            <MissingnessMatrix />
          </div>
        </section>

        {/* =================================================================== */}
        {/* SCENE 04 — THE FUSION (NeuroCross & AMGU Dynamic Routing)          */}
        {/* =================================================================== */}
        <section className="scene-editorial light-editorial" id="fusion">
          <div className="editorial-container">
            <div className="section-chapter-tag">
              <span>04 / 05</span>
              <span className="tag-line" />
              <span>THE FUSION ENGINE</span>
            </div>

            <div className="editorial-split-header">
              <h2 className="editorial-heading">
                Two sources. <span className="serif-highlight">One research question.</span>
              </h2>
              <p className="editorial-copy">
                NeuroCross-VelocityNet aligns 328 longitudinal clinical, biofluid, and genetic features with 448
                spatial tokens from 3D DaTSCAN SPECT. When the scan drops away, an <strong>Adaptive Modality Gating Unit (AMGU)</strong> and
                a <strong>learnable prior token (<em>M</em>)</strong> dynamically re-route evidence to clinical history.
              </p>
            </div>

            {/* Interactive AMGU Architecture Canvas */}
            <AMGUControl spectOn={!spectMissing} onToggleSpect={(on) => setSpectMissing(!on)} />

            {/* 6-Axis Multi-Modal Biomarker Radar Fingerprint */}
            <div style={{ marginTop: '48px' }}>
              <BiomarkerRadar />
            </div>
          </div>
        </section>

        {/* =================================================================== */}
        {/* SCENE 05 — EXPLAINABILITY (3D Grad-CAM & Tree SHAP Attribution)     */}
        {/* =================================================================== */}
        <section className="scene-editorial dark-exhibition" id="explainability">
          <div className="editorial-container">
            <div className="section-chapter-tag">
              <span>05 / 05</span>
              <span className="tag-line" />
              <span>INTERPRETABILITY</span>
            </div>

            <div className="editorial-split-header">
              <h2 className="editorial-heading">
                Making the prediction <span className="serif-highlight">inspectable.</span>
              </h2>
              <p className="editorial-copy">
                Trust in healthcare AI requires opening the black box. ParkiSight-AI provides a dual explanation layer:
                3D Grad-CAM exposes volumetric spatial region attention in the striatum, while Tree SHAP ranks the clinical
                features that shaped the motor estimate.
              </p>
            </div>

            {/* Dual Explainability Workstation */}
            <ExplainabilityViewer />
          </div>
        </section>

        {/* =================================================================== */}
        {/* SECTION 06 — LONGITUDINAL PATIENT JOURNEY EXPLORER                  */}
        {/* =================================================================== */}
        <section className="scene-editorial light-editorial" id="journey">
          <div className="editorial-container">
            <div className="section-chapter-tag">
              <span>CASE STUDY</span>
              <span className="tag-line" />
              <span>LONGITUDINAL TRACKING</span>
            </div>

            <div className="editorial-split-header">
              <h2 className="editorial-heading">
                Tracking progression across <span className="serif-highlight">years.</span>
              </h2>
              <p className="editorial-copy">
                Explore an individual patient journey from Baseline through Month 36. Notice how the CDSS adapts
                seamlessly as DaTSCAN imaging transitions from available to unavailable across consecutive clinical visits.
              </p>
            </div>

            {/* Interactive Patient Timeline Explorer */}
            <PatientTimeline />
          </div>
        </section>

        {/* =================================================================== */}
        {/* SECTION 07 — STROBE COHORT FLOW & ANTI-LEAKAGE INTEGRITY            */}
        {/* =================================================================== */}
        <section className="scene-editorial dark-exhibition" id="cohort">
          <div className="editorial-container">
            <div className="section-chapter-tag">
              <span>DATA INTEGRITY</span>
              <span className="tag-line" />
              <span>STROBE METHODOLOGY</span>
            </div>

            <div className="editorial-split-header">
              <h2 className="editorial-heading">
                Evidence begins <span className="serif-highlight">before inference.</span>
              </h2>
              <p className="editorial-copy">
                High accuracy claims in medical AI often hide data leakage. ParkiSight-AI enforces strict participant-level
                isolation by Patient ID (`PATNO`), excises circular motor exam items, and reports honest attrition checks.
              </p>
            </div>

            {/* STROBE Diagram and Safeguards */}
            <CohortFlow />
          </div>
        </section>

        {/* =================================================================== */}
        {/* SECTION 08 — RESEARCH EVIDENCE & COMPARATOR BENCHMARKS               */}
        {/* =================================================================== */}
        <section className="scene-editorial light-editorial" id="evidence">
          <div className="editorial-container">
            <div className="section-chapter-tag">
              <span>VERIFIED RESULTS</span>
              <span className="tag-line" />
              <span>BENCHMARK EXPLORER</span>
            </div>

            <div className="editorial-split-header">
              <h2 className="editorial-heading">
                The results, without <span className="serif-highlight">the noise.</span>
              </h2>
              <p className="editorial-copy">
                Examine our verified held-out evaluation on PPMI (N=221) and zero-shot external validation on PDBP (N=1,120)
                across classification, regression, and rate-of-change disease progression forecasting.
              </p>
            </div>

            {/* Comprehensive Evidence Explorer */}
            <EvidenceExplorer />
          </div>
        </section>

        {/* =================================================================== */}
        {/* SECTION 09 — FINAL CALL TO ACTION (Enter the Live CDSS Workstation) */}
        {/* =================================================================== */}
        <section className="scene-callout dark-exhibition">
          <div className="callout-inner">
            <span className="callout-tag">PARKISIGHT-AI · RESEARCH PREVIEW</span>
            <h2 className="callout-heading">
              Experience the Clinical Decision Support <span className="serif-highlight">Workstation.</span>
            </h2>
            <p className="callout-text">
              Test real-time clinimetric and biofluid adjustments, observe the AMGU gate in motion, and explore
              the interface from clinician, patient, and clinical trial lead perspectives.
            </p>
            <div className="callout-buttons">
              <Link href="/dashboard" className="callout-primary">
                <span>Launch Interactive CDSS Demo</span>
                <ArrowUpRight size={18} />
              </Link>
              <Link href="/auth" className="callout-secondary">
                Select Your Role <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
