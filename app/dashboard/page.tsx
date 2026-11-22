'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import {
  Activity, ArrowRight, ArrowUpRight, Bell, Brain, CalendarDays,
  Check, ChevronDown, CircleAlert, ClipboardCheck, Download, FileJson2,
  HeartPulse, LayoutDashboard, Menu, ScanLine, Search, Settings, ShieldCheck,
  Stethoscope, Users, X, Zap, ChartNoAxesCombined, Info, Sparkles
} from 'lucide-react';
import { runDemoInference, type DemoInferenceResult, type InferenceInputs } from './demo-inference';
import { VERIFIED_BENCHMARKS, COMPARATOR_MODELS, COHORT_STROBE, ANTI_LEAKAGE_GUARDRAILS, XAI_DATA } from '@/lib/research-data';

const roles = ['Clinician / Neurologist', 'Patient / Caregiver', 'Researcher / Trial Lead'] as const;
type Role = (typeof roles)[number];
type InputState = InferenceInputs & {
  nfL: number;
  saa: 'Positive' | 'Negative' | 'Not tested';
  lrrk2: boolean;
  gba: boolean;
  apoe: boolean;
};

type Patient = {
  id: string;
  name: string;
  age: number;
  visit: string;
  medication: 'ON' | 'OFF';
  spect: boolean;
  note: string;
  probabilities: [number, number, number, number];
  motor: number;
};

const patients: Patient[] = [
  { id: 'PATNO-3401', name: 'Jordan M.', age: 62, visit: 'M24', medication: 'ON', spect: true, note: 'Follow-up visit · Tremor dominant · Normal cognition', probabilities: [7, 11, 78, 4], motor: 39 },
  { id: 'PATNO-4112', name: 'Case 4112', age: 58, visit: 'M12', medication: 'OFF', spect: false, note: 'Follow-up · SPECT unavailable · Prior Token M active', probabilities: [10, 58, 27, 5], motor: 24 },
  { id: 'PATNO-5089', name: 'Case 5089', age: 71, visit: 'M36', medication: 'ON', spect: true, note: 'Postural instability review · Fall risk advisory', probabilities: [3, 9, 61, 27], motor: 55 },
];

const initialInputs: InputState = {
  updrs1: 16,
  updrs2: 22,
  moca: 26,
  adl: 80,
  epworth: 8,
  scopa: 18,
  spectAvailable: true,
  nfL: 14.2,
  saa: 'Positive',
  lrrk2: false,
  gba: false,
  apoe: false,
};

const stageNames = ['Stage 0', 'Stage 1', 'Stage 2', 'Stage 3'];
const stageDescriptions = [
  'Prodromal / Control',
  'Unilateral involvement',
  'Bilateral involvement',
  'Postural instability / Fall risk',
];

const patientNav = ['Overview', 'My timeline', 'Visit preparation'];
const researchNav = ['Overview', 'Benchmarks', 'Cohort audit'];
const clinicianNav = ['Overview', 'Patients', 'Benchmarks'];

function SliderField({
  label,
  value,
  max,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  max: number;
  unit: string;
  onChange: (n: number) => void;
}) {
  return (
    <label className="dash-slider-field">
      <div className="slider-label-row">
        <span>{label}</span>
        <strong>{value}{unit}</strong>
      </div>
      <input
        type="range"
        min="0"
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="ws-slider"
      />
      <small>Range 0–{max}{unit}</small>
    </label>
  );
}

export default function Dashboard() {
  const [role, setRole] = useState<Role>(roles[0]);
  const [patientId, setPatientId] = useState(patients[0].id);
  const [tab, setTab] = useState('Overview');
  const [inputs, setInputs] = useState<InputState>(initialInputs);
  const [medication, setMedication] = useState<'ON' | 'OFF'>('ON');
  const [visit, setVisit] = useState('M24');
  const [inference, setInference] = useState<DemoInferenceResult | null>(null);
  const [inferState, setInferState] = useState<'ready' | 'running' | 'complete'>('ready');
  const [toast, setToast] = useState('');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [activeBenchmark, setActiveBenchmark] = useState('PPMI held-out');
  const [checkin, setCheckin] = useState({ movement: 6, sleep: 5, mood: 7, energy: 6, medication: true });
  const [checkinSaved, setCheckinSaved] = useState(false);
  const [enrichment, setEnrichment] = useState(38.4);
  const [slice, setSlice] = useState<'Axial z=60' | 'Coronal y=64' | 'Sagittal x=64' | 'Negative control z=15'>('Axial z=60');

  const patient = patients.find((item) => item.id === patientId) ?? patients[0];
  const patientView = role.startsWith('Patient');
  const researcherView = role.startsWith('Researcher');
  const navItems = patientView ? patientNav : researcherView ? researchNav : clinicianNav;
  const probabilities = inference?.stageProbabilities ?? patient.probabilities;
  const selectedStage = probabilities.indexOf(Math.max(...probabilities));
  const motorScore = inference?.motorScore ?? patient.motor;
  const gateWeight = inference?.gateWeight ?? (inputs.spectAvailable ? 0.482 : 0.935);
  const latency = inference?.latencyMs ?? (inputs.spectAvailable ? 16 : 3.6);
  const showAdvisory = selectedStage === 3 || Math.max(...probabilities) < 60;
  const matchingPatients = useMemo(
    () => patients.filter((item) => `${item.id} ${item.name}`.toLowerCase().includes(searchQuery.toLowerCase())),
    [searchQuery]
  );

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get('role');
    const match = roles.find((item) => item === value);
    if (match) setRole(match);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const selectPatient = useCallback((item: Patient) => {
    setPatientId(item.id);
    setVisit(item.visit);
    setMedication(item.medication);
    setInputs((current) => ({ ...current, spectAvailable: item.spect }));
    setInference(null);
    setInferState('ready');
    setTab('Overview');
    setSearchOpen(false);
  }, []);

  const updateInput = <K extends keyof InputState>(key: K, value: InputState[K]) =>
    setInputs((current) => ({ ...current, [key]: value }));

  async function handleInference() {
    if (inferState === 'running') return;
    setInferState('running');
    setInference(null);
    try {
      const result = await runDemoInference(inputs);
      setInference(result);
      setInferState('complete');
      setToast('Inference simulated · outputs refreshed for active inputs');
    } catch {
      setInferState('ready');
      setToast('Could not complete local demonstration scenario');
    }
  }

  const note = useMemo(
    () =>
      `PARKISIGHT-AI · CLINICAL DECISION SUPPORT ENCOUNTER SUMMARY\n\n` +
      `Encounter Record: ${patient.id}\n` +
      `Study Visit: ${visit}\n` +
      `Medication State: ${medication}\n` +
      `DaTSCAN SPECT Status: ${inputs.spectAvailable ? 'Available (3D Volume Processed)' : 'Unavailable (Prior Token M Route)'}\n\n` +
      `Predicted Hoehn & Yahr Stage: ${stageNames[selectedStage]} (${stageDescriptions[selectedStage]})\n` +
      `Stage Probability Distribution: ${stageNames.map((s, i) => `${s}: ${probabilities[i]}%`).join(' · ')}\n` +
      `Estimated Motor Exam Severity (NP3TOT): ${motorScore} / 132 points (RMSE reference: ±7.97 pts)\n` +
      `AMGU Route Weighting (g): ${gateWeight.toFixed(3)}\n` +
      `Inference Latency: ${latency} ms\n\n` +
      `Clinical Advisory: ${
        selectedStage === 3
          ? 'Stage 3 indicates postural instability and high fall risk. Perform an in-person pull-test.'
          : 'Patient-isolated model estimate for clinical decision support. Not a standalone diagnosis.'
      }\n\n` +
      `Attending Clinician Review: ____________________ Date: ${new Date().toLocaleDateString('en-US')}`,
    [patient.id, visit, medication, inputs.spectAvailable, selectedStage, probabilities, motorScore, gateWeight, latency]
  );

  function exportJson() {
    const data = {
      resourceType: 'ClinicalImpression',
      id: `parkisight-${patient.id}-${visit.toLowerCase()}`,
      status: 'preliminary',
      description: 'ParkiSight-AI Multimodal Parkinson Decision Support Impression',
      subject: { reference: `Patient/${patient.id}`, display: patient.name },
      encounter: { display: visit },
      date: new Date().toISOString(),
      summary: 'Multimodal staging and motor severity estimate evaluated under patient-isolated constraints.',
      extension: [
        { url: 'http://parkisight.ai/fhir/spect-available', valueBoolean: inputs.spectAvailable },
        { url: 'http://parkisight.ai/fhir/predicted-stage', valueString: stageNames[selectedStage] },
        { url: 'http://parkisight.ai/fhir/stage-probability-pct', valueInteger: Math.max(...probabilities) },
        { url: 'http://parkisight.ai/fhir/motor-severity-np3tot', valueInteger: motorScore },
        { url: 'http://parkisight.ai/fhir/amgu-gate-weight', valueDecimal: Number(gateWeight.toFixed(3)) },
        { url: 'http://parkisight.ai/fhir/research-preview-only', valueBoolean: true },
      ],
      investigation: [
        {
          code: { text: 'Diagnostic Input Battery' },
          item: [
            { display: `MDS-UPDRS Part I: ${inputs.updrs1}` },
            { display: `MDS-UPDRS Part II: ${inputs.updrs2}` },
            { display: `MoCA Cognitive: ${inputs.moca}/30` },
            { display: `Schwab & England ADL: ${inputs.adl}%` },
            { display: `CSF α-Syn SAA: ${inputs.saa}` },
            { display: `Serum NfL: ${inputs.nfL} pg/mL` },
          ],
        },
      ],
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/fhir+json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${patient.id}-${visit}-FHIR-ClinicalImpression.json`;
    link.click();
    URL.revokeObjectURL(url);
    setToast('HL7 FHIR v4.0.1 JSON exported');
  }

  function exportAudit() {
    const report = {
      reportType: 'ParkiSight-AI Cohort and Methodology Audit',
      evaluationStudy: 'PPMI',
      screenedParticipants: COHORT_STROBE.screened,
      excludedTotal: COHORT_STROBE.excludedTotal,
      excludedDetails: COHORT_STROBE.excludedDetails,
      includedAnalyticCohort: COHORT_STROBE.includedParticipants,
      totalVisits: COHORT_STROBE.totalVisits,
      partitionStrategy: COHORT_STROBE.partition,
      externalCohortValidation: COHORT_STROBE.externalCohort,
      antiLeakageGuardrails: ANTI_LEAKAGE_GUARDRAILS,
      verifiedBenchmarks: VERIFIED_BENCHMARKS,
      exportTimestamp: new Date().toISOString(),
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'parkisight-cohort-audit-protocol.json';
    link.click();
    URL.revokeObjectURL(url);
    setToast('Comprehensive research audit protocol exported');
  }

  function exportNote() {
    const url = URL.createObjectURL(new Blob([note], { type: 'text/plain' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${patient.id}-${visit}-clinical-summary.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setToast('Encounter summary note downloaded');
  }

  function saveCheckin() {
    setCheckinSaved(true);
    setToast('Daily wellness record recorded for this session');
  }

  function changeRole(nextRole: Role) {
    setRole(nextRole);
    setTab('Overview');
    setMobileMenu(false);
  }

  return (
    <main className="ws-dashboard-root">
      {/* Sidebar Navigation */}
      <aside className={`ws-sidebar ${mobileMenu ? 'is-open' : ''}`}>
        <div className="sidebar-brand-box">
          <Link href="/" className="sidebar-brand">
            <span className="brand-mark"><Activity size={16} /></span>
            <strong>ParkiSight</strong>
            <small>AI</small>
          </Link>
          <span className="ws-env-badge">RESEARCH CDSS</span>
        </div>

        <div className="sidebar-role-indicator">
          <span>ACTIVE PERSPECTIVE</span>
          <strong>{role.split(' / ')[0]}</strong>
        </div>

        <nav className="sidebar-nav-menu" aria-label="Workspace navigation">
          {navItems.map((item) => {
            const Icon =
              item.includes('Patient') || item === 'My timeline'
                ? Users
                : item.includes('Benchmark')
                ? ChartNoAxesCombined
                : item.includes('audit') || item.includes('Audit')
                ? ShieldCheck
                : item.includes('preparation')
                ? ClipboardCheck
                : LayoutDashboard;
            return (
              <button
                type="button"
                key={item}
                onClick={() => {
                  setTab(item);
                  setMobileMenu(false);
                }}
                className={`sidebar-nav-btn ${tab === item ? 'is-active' : ''}`}
                aria-current={tab === item ? 'page' : undefined}
              >
                <Icon size={16} />
                <span>{item}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-trust-box">
          <ShieldCheck size={16} />
          <div>
            <strong>PATNO-Isolated</strong>
            <small>PPMI & PDBP Evaluation</small>
          </div>
        </div>

        <div className="sidebar-user-footer">
          <div className="user-avatar-badge">
            {patientView ? 'JM' : researcherView ? 'RS' : 'AM'}
          </div>
          <div className="user-text">
            <b>{patientView ? 'Jordan M.' : researcherView ? 'Lead Investigator' : 'Dr. Alex Morgan'}</b>
            <small>{patientView ? 'Patient #3401' : researcherView ? 'Trial Lead' : 'Neurologist'}</small>
          </div>
        </div>
      </aside>

      {mobileMenu && <div className="ws-scrim" onClick={() => setMobileMenu(false)} />}

      {/* Main Workstation Section */}
      <section className="ws-main-area">
        {/* Top Header Bar */}
        <header className="ws-topbar">
          <button
            type="button"
            className="mobile-hamburger-btn"
            onClick={() => setMobileMenu(!mobileMenu)}
            aria-label="Open navigation menu"
          >
            <Menu size={18} />
          </button>

          <div className="topbar-breadcrumb">
            <span>Workstation</span>
            <span className="crumb-sep">/</span>
            <strong>{tab}</strong>
          </div>

          <div className="topbar-actions">
            {searchOpen && (
              <div className="search-popover">
                <Search size={14} />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Find patient by PATNO…"
                />
                <div className="search-results">
                  {matchingPatients.map((item) => (
                    <button key={item.id} type="button" onClick={() => selectPatient(item)}>
                      <b>{item.id}</b>
                      <span>{item.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <span className="research-status-pill">
              <i className="status-dot-active" /> SIMULATION ENVIRONMENT
            </span>

            <button
              type="button"
              className="icon-action-btn"
              onClick={() => setSearchOpen(!searchOpen)}
              title="Search patient profiles"
            >
              <Search size={16} />
            </button>

            <div className="notifications-wrap">
              <button
                type="button"
                className="icon-action-btn"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                title="Notifications"
              >
                <Bell size={16} />
                <span className="notif-badge" />
              </button>
              {notificationsOpen && (
                <div className="notif-dropdown">
                  <h6>Operational Notifications</h6>
                  <p><span className="dot" /> PPMI held-out benchmark: 71.11% accuracy</p>
                  <p><span className="dot muted" /> Simulation mode: illustrative inference</p>
                </div>
              )}
            </div>

            <select
              value={role}
              onChange={(e) => changeRole(e.target.value as Role)}
              className="role-selector-dropdown"
              aria-label="Switch operational perspective"
            >
              {roles.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </header>

        {/* Content Body */}
        <div className="ws-content-viewport">
          {/* Viewport Header */}
          <div className="viewport-heading-row">
            <div>
              <span className="scientific-tag">
                {patientView ? 'PATIENT COMPANION' : researcherView ? 'RESEARCH TRIAL SUITE' : 'CLINICAL COPILOT'}
              </span>
              <h2 className="viewport-title">
                {patientView
                  ? 'Personal Health & Stability Journal'
                  : researcherView
                  ? 'Cohort Audit & Benchmark Suite'
                  : 'Neurological Decision Support System'}
              </h2>
              <p className="viewport-subtitle">
                {patientView
                  ? 'Track your daily wellness patterns and prepare questions for your care team.'
                  : researcherView
                  ? 'Explore held-out performance, cohort integrity, and sample-size trial enrichment.'
                  : 'Multimodal staging and motor severity estimation under strict anti-leakage constraints.'}
              </p>
            </div>

            <div className="heading-actions">
              {patientView ? (
                <span className="role-chip patient-chip">
                  <HeartPulse size={14} /> Personal Companion
                </span>
              ) : researcherView ? (
                <button type="button" className="ws-action-btn" onClick={exportAudit}>
                  <Download size={14} /> Export Cohort Protocol
                </button>
              ) : (
                <div className="clinician-export-btns">
                  <button type="button" className="ws-action-btn outline-btn" onClick={exportJson}>
                    <FileJson2 size={14} /> FHIR JSON
                  </button>
                  <button type="button" className="ws-action-btn" onClick={() => setNoteOpen(true)}>
                    <Download size={14} /> Encounter Note
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Active Patient Bar (Only for Clinician View) */}
          {!patientView && !researcherView && (
            <div className="patient-active-strip">
              <div className="active-patient-select">
                <span className="strip-label">ACTIVE PATIENT PROFILE</span>
                <select
                  value={patientId}
                  onChange={(e) =>
                    selectPatient(patients.find((item) => item.id === e.target.value) ?? patients[0])
                  }
                  className="patient-picker"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.id} · {p.name} ({p.age} y/o)
                    </option>
                  ))}
                </select>
              </div>

              <div className="patient-strip-meta">
                <div className="meta-pill">
                  <CalendarDays size={13} />
                  <select value={visit} onChange={(e) => setVisit(e.target.value)}>
                    <option value="Baseline">Baseline</option>
                    <option value="M12">Month 12</option>
                    <option value="M24">Month 24</option>
                    <option value="M36">Month 36</option>
                  </select>
                </div>

                <button
                  type="button"
                  className={`med-state-btn ${medication === 'ON' ? 'med-on' : 'med-off'}`}
                  onClick={() => setMedication(medication === 'ON' ? 'OFF' : 'ON')}
                >
                  ● MEDICATION {medication}
                </button>

                <span className={`spect-status-pill ${inputs.spectAvailable ? 'has-spect' : 'no-spect'}`}>
                  {inputs.spectAvailable ? '◉ 3D SPECT PRESENT' : '◉ PRIOR TOKEN M ROUTE'}
                </span>

                <span className="latency-badge">
                  <Zap size={13} /> {latency} ms
                </span>
              </div>
            </div>
          )}

          {/* Secondary Views Routing */}
          {tab === 'Patients' && !patientView && !researcherView ? (
            <PatientsView onSelect={selectPatient} />
          ) : tab === 'Benchmarks' ? (
            <BenchmarksView active={activeBenchmark} setActive={setActiveBenchmark} />
          ) : tab === 'Cohort audit' ? (
            <CohortAuditView enrichment={enrichment} setEnrichment={setEnrichment} />
          ) : patientView ? (
            tab === 'My timeline' ? (
              <PatientTimelineView />
            ) : tab === 'Visit preparation' ? (
              <VisitPreparationView onExport={exportNote} />
            ) : (
              <PatientOverviewView
                checkin={checkin}
                setCheckin={(val) => {
                  setCheckin(val);
                  setCheckinSaved(false);
                }}
                onSave={saveCheckin}
                onPrep={() => setTab('Visit preparation')}
                saved={checkinSaved}
              />
            )
          ) : researcherView ? (
            <ResearchOverviewView
              onBenchmarks={() => setTab('Benchmarks')}
              onAudit={() => setTab('Cohort audit')}
            />
          ) : (
            /* Clinician Primary Overview Grid */
            <div className="clinician-grid-layout">
              {/* PANEL 1: Model Inputs */}
              <section className="ws-panel inputs-panel">
                <div className="panel-header">
                  <div>
                    <span className="panel-tag">CLINICAL BATTERY INPUTS</span>
                    <h3 className="panel-title">Patient Signal Battery</h3>
                  </div>
                  <span className="panel-chip">Interactive</span>
                </div>

                <div className="input-domain-heading">CLINIMETRIC SCORES ({visit.toUpperCase()})</div>
                <div className="sliders-dual-grid">
                  <SliderField
                    label="MDS-UPDRS Part I"
                    value={inputs.updrs1}
                    max={52}
                    unit=""
                    onChange={(v) => updateInput('updrs1', v)}
                  />
                  <SliderField
                    label="MDS-UPDRS Part II"
                    value={inputs.updrs2}
                    max={52}
                    unit=""
                    onChange={(v) => updateInput('updrs2', v)}
                  />
                  <SliderField
                    label="MoCA Cognitive Assessment"
                    value={inputs.moca}
                    max={30}
                    unit=" / 30"
                    onChange={(v) => updateInput('moca', v)}
                  />
                  <SliderField
                    label="Schwab & England ADL"
                    value={inputs.adl}
                    max={100}
                    unit="%"
                    onChange={(v) => updateInput('adl', v)}
                  />
                  <SliderField
                    label="Epworth Sleepiness Scale"
                    value={inputs.epworth}
                    max={24}
                    unit=" / 24"
                    onChange={(v) => updateInput('epworth', v)}
                  />
                  <SliderField
                    label="SCOPA-AUT Autonomic Score"
                    value={inputs.scopa}
                    max={69}
                    unit=""
                    onChange={(v) => updateInput('scopa', v)}
                  />
                </div>

                <div className="input-domain-heading">BIOFLUIDS & GENETICS</div>
                <div className="biomarker-row">
                  <label className="bio-field">
                    <span>CSF α-Synuclein SAA</span>
                    <select
                      value={inputs.saa}
                      onChange={(e) => updateInput('saa', e.target.value as InputState['saa'])}
                    >
                      <option value="Positive">Positive (Seeding Present)</option>
                      <option value="Negative">Negative</option>
                      <option value="Not tested">Not tested</option>
                    </select>
                  </label>
                  <label className="bio-field">
                    <span>Serum NfL (Axonal Rate)</span>
                    <div className="input-unit-wrap">
                      <input
                        type="number"
                        min="0"
                        max="250"
                        step="0.1"
                        value={inputs.nfL}
                        onChange={(e) => updateInput('nfL', Number(e.target.value))}
                      />
                      <small>pg/mL</small>
                    </div>
                  </label>
                </div>

                <div className="genes-row">
                  <label className="gene-checkbox">
                    <input
                      type="checkbox"
                      checked={inputs.lrrk2}
                      onChange={(e) => updateInput('lrrk2', e.target.checked)}
                    />
                    <span>LRRK2 G2019S</span>
                  </label>
                  <label className="gene-checkbox">
                    <input
                      type="checkbox"
                      checked={inputs.gba}
                      onChange={(e) => updateInput('gba', e.target.checked)}
                    />
                    <span>GBA Variant</span>
                  </label>
                  <label className="gene-checkbox">
                    <input
                      type="checkbox"
                      checked={inputs.apoe}
                      onChange={(e) => updateInput('apoe', e.target.checked)}
                    />
                    <span>APOE ε4</span>
                  </label>
                </div>

                {/* SPECT Switch */}
                <div className="spect-switch-card">
                  <div className="switch-icon">
                    <ScanLine size={18} />
                  </div>
                  <div className="switch-text">
                    <strong>¹²³I-DaTSCAN SPECT Volume (128³)</strong>
                    <small>
                      {inputs.spectAvailable
                        ? '3D imaging input connected · Balanced AMGU routing'
                        : 'Unavailable · Prior Token M route automatically engaged'}
                    </small>
                  </div>
                  <input
                    type="checkbox"
                    checked={inputs.spectAvailable}
                    onChange={(e) => {
                      updateInput('spectAvailable', e.target.checked);
                      setInference(null);
                    }}
                    className="spect-toggle-input"
                    aria-label="Toggle SPECT imaging availability"
                  />
                </div>

                <div className="run-inference-action">
                  <button
                    type="button"
                    className="run-btn"
                    onClick={handleInference}
                    disabled={inferState === 'running'}
                  >
                    {inferState === 'running' ? (
                      'Simulating NeuroCross Inference…'
                    ) : (
                      <>
                        <span>Execute Model Inference</span>
                        <ArrowUpRight size={15} />
                      </>
                    )}
                  </button>
                  <span className="run-status-text">
                    {inferState === 'complete' ? 'Simulation refreshed' : 'Local evaluation mode'}
                  </span>
                </div>
              </section>

              {/* PANEL 2: 4-Class Staging */}
              <section className="ws-panel stage-panel">
                <div className="panel-header">
                  <div>
                    <span className="panel-tag">MULTI-TASK HEAD 1</span>
                    <h3 className="panel-title">Hoehn & Yahr Staging</h3>
                  </div>
                  <span className="panel-chip">71.11% Bal. Acc.</span>
                </div>

                <div className="stage-hero-metric">
                  <div>
                    <span className="stage-classification-label">PREDICTED STAGE</span>
                    <strong className="stage-name">{stageNames[selectedStage]}</strong>
                    <small className="stage-desc">{stageDescriptions[selectedStage]}</small>
                  </div>
                  <div className="stage-probability-ring">
                    <strong className="prob-big">{Math.max(...probabilities)}%</strong>
                    <small>CONFIDENCE</small>
                  </div>
                </div>

                {/* Probability Distribution */}
                <div className="stage-prob-bars">
                  {probabilities.map((val, idx) => (
                    <div key={stageNames[idx]} className="prob-bar-row">
                      <div className="prob-label-row">
                        <span>{stageNames[idx]} · {stageDescriptions[idx]}</span>
                        <b>{val}%</b>
                      </div>
                      <div className="prob-track">
                        <div
                          className="prob-fill"
                          style={{
                            width: `${val}%`,
                            background: idx === selectedStage ? '#D85C42' : '#647E76',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Safety Advisory on Stage 3 or Low Confidence */}
                {showAdvisory && (
                  <div className="clinical-alert-box">
                    <CircleAlert size={16} />
                    <div>
                      <strong>Clinical Safeguard Notice:</strong>
                      <p>
                        Stage 3 has a cohort prevalence of 3.6% in PPMI with 41.18% PPV. Always verify postural reflex
                        with an in-person pull-test before making therapeutic adjustments.
                      </p>
                    </div>
                  </div>
                )}
              </section>

              {/* PANEL 3: Continuous Motor Severity */}
              <section className="ws-panel severity-panel">
                <div className="panel-header">
                  <div>
                    <span className="panel-tag">MULTI-TASK HEAD 2</span>
                    <h3 className="panel-title">Motor Exam Score (NP3TOT)</h3>
                  </div>
                  <span className="panel-chip">R² = 0.7256</span>
                </div>

                <div className="severity-display-center">
                  <div className="severity-gauge-circle">
                    <strong>{motorScore}</strong>
                    <small>/ 132 PTS</small>
                  </div>
                  <div className="severity-details">
                    <b>MDS-UPDRS Part III Estimate</b>
                    <p>Continuous motor exam severity reference. Validated RMSE: ±7.97 points.</p>
                  </div>
                </div>

                <div className="severity-bar-track">
                  <div className="track-line">
                    <div className="track-progress" style={{ width: `${(motorScore / 132) * 100}%` }} />
                  </div>
                  <div className="track-labels">
                    <span>0 (Asymptomatic)</span>
                    <span>66 (Moderate)</span>
                    <span>132 (Severe)</span>
                  </div>
                </div>
              </section>

              {/* PANEL 4: AMGU Dynamic Signal Routing */}
              <section className="ws-panel amgu-panel">
                <div className="panel-header">
                  <div>
                    <span className="panel-tag">ADAPTIVE MODALITY GATE</span>
                    <h3 className="panel-title">AMGU Weighting (g)</h3>
                  </div>
                  <span className="panel-chip">Dynamic Routing</span>
                </div>

                <div className="amgu-gauge-split">
                  <div className="amgu-dial-widget">
                    <strong>{gateWeight.toFixed(3)}</strong>
                    <small>GATE SCALAR g</small>
                  </div>
                  <div className="amgu-streams-breakdown">
                    <div className="stream-stat">
                      <span>CLINICAL WEIGHT</span>
                      <b>{((1 - gateWeight) * 100).toFixed(1)}%</b>
                    </div>
                    <div className="stream-stat">
                      <span>IMAGING / PRIOR M</span>
                      <b>{(gateWeight * 100).toFixed(1)}%</b>
                    </div>
                    <small className="amgu-route-mode">
                      {inputs.spectAvailable
                        ? 'Balanced multimodal fusion (both streams active)'
                        : 'Prior token M route engaged (clinical stream dominant)'}
                    </small>
                  </div>
                </div>
              </section>

              {/* PANEL 5: Explainability Suite */}
              <section className="ws-panel xai-panel full-width">
                <div className="panel-header">
                  <div>
                    <span className="panel-tag">DUAL EXPLAINABILITY</span>
                    <h3 className="panel-title">3D Grad-CAM Attention & Tree SHAP Attribution</h3>
                  </div>
                  <span className="panel-chip">84.2% Striatal VOI Energy</span>
                </div>

                <div className="xai-dual-columns">
                  {/* Grad-CAM Slice Viewer */}
                  <div className="xai-slice-col">
                    <div className="slice-nav-strip">
                      {(['Axial z=60', 'Coronal y=64', 'Sagittal x=64', 'Negative control z=15'] as const).map(
                        (item) => (
                          <button
                            key={item}
                            type="button"
                            className={slice === item ? 'active' : ''}
                            onClick={() => setSlice(item)}
                          >
                            {item}
                          </button>
                        )
                      )}
                    </div>
                    <div className={`dashboard-slice-box ${slice.startsWith('Negative') ? 'is-negative' : ''}`}>
                      <div className="crosshair-h" />
                      <div className="crosshair-v" />
                      <span className="slice-hud-tag">{slice.toUpperCase()}</span>
                    </div>
                    <small className="slice-explanation">
                      {slice.startsWith('Negative')
                        ? 'Negative control validation: slice z=15 demonstrates 0.00% VOI energy.'
                        : '3D Grad-CAM confirms 84.2% of gradient attention concentrates in bilateral putamen.'}
                    </small>
                  </div>

                  {/* Tree SHAP Feature Bars */}
                  <div className="xai-shap-col">
                    <span className="shap-col-title">TOP CLINICAL DRIVERS (TREE SHAP)</span>
                    <div className="shap-mini-list">
                      {XAI_DATA.treeShap.slice(0, 5).map((s) => (
                        <div key={s.feature} className="shap-mini-item">
                          <div className="shap-mini-labels">
                            <span>{s.feature}</span>
                            <b>+{s.shapValue.toFixed(3)}</b>
                          </div>
                          <div className="shap-mini-track">
                            <div className="shap-mini-bar" style={{ width: `${(s.shapValue / 0.4) * 100}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* PANEL 6: Progression Outlook */}
              <section className="ws-panel trajectory-panel full-width">
                <div className="panel-header">
                  <div>
                    <span className="panel-tag">RATE-OF-CHANGE FORECAST</span>
                    <h3 className="panel-title">Honest Progression Horizon (ΔNP3TOT)</h3>
                  </div>
                  <span className="panel-chip">36-Month ΔR² = +0.0216</span>
                </div>

                <div className="trajectory-horizons-strip">
                  <div className="horizon-box">
                    <strong>12 Months</strong>
                    <span>ΔR² ≈ 0.000</span>
                    <small>Measurement noise floor</small>
                  </div>
                  <div className="horizon-box">
                    <strong>24 Months</strong>
                    <span>ΔR² ≈ 0.000</span>
                    <small>Biological fluctuation</small>
                  </div>
                  <div className="horizon-box highlight-horizon">
                    <strong>36 Months</strong>
                    <span className="positive">+0.0216 ΔR²</span>
                    <small>Emerging signal (FDR q=0.038)</small>
                  </div>
                </div>
                <div className="trajectory-disclaimer">
                  <Info size={13} />
                  <span>
                    ~98% of rate-of-change variance remains unexplained. We explicitly report ΔNP3TOT rather than
                    autocorrelated persistence scores (R² ≈ 0.60) to provide clinically honest expectations.
                  </span>
                </div>
              </section>
            </div>
          )}
        </div>
      </section>

      {/* Global Toast */}
      {toast && (
        <div className="ws-toast" role="status">
          <Check size={15} />
          <span>{toast}</span>
          <button type="button" onClick={() => setToast('')} aria-label="Dismiss toast">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Clinical Note Modal */}
      {noteOpen && (
        <div className="note-modal-backdrop" onClick={() => setNoteOpen(false)}>
          <div className="note-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="note-modal-head">
              <div>
                <span className="scientific-tag">STRUCTURED ENCOUNTER RECORD</span>
                <h4>Clinical Decision Support Note</h4>
              </div>
              <button type="button" onClick={() => setNoteOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <pre className="note-text-body">{note}</pre>
            <div className="note-modal-actions">
              <button type="button" className="ws-action-btn" onClick={exportNote}>
                <Download size={14} /> Download Clinical Note (.txt)
              </button>
              <button type="button" className="ws-action-btn outline-btn" onClick={exportJson}>
                <FileJson2 size={14} /> Export HL7 FHIR JSON
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Sub-Views: PatientsView, BenchmarksView, CohortAuditView, PatientOverview  */
/* -------------------------------------------------------------------------- */
function PatientsView({ onSelect }: { onSelect: (patient: Patient) => void }) {
  return (
    <div className="ws-subview">
      <div className="subview-header">
        <div>
          <span className="scientific-tag">DE-IDENTIFIED RESEARCH COHORT</span>
          <h3>Sample Patient Registry</h3>
          <p>Select a representative case profile to load into the clinical workstation.</p>
        </div>
      </div>

      <div className="patient-cards-grid">
        {patients.map((p) => (
          <div key={p.id} className="patient-registry-card">
            <div className="card-top">
              <span className="patient-avatar">{p.name.slice(0, 2).toUpperCase()}</span>
              <span className="de-id-tag">PATNO ISOLATED</span>
            </div>
            <h4>{p.id} · {p.name}</h4>
            <p className="patient-meta-text">{p.age} years old · Visit {p.visit} · Med {p.medication}</p>
            <div className="patient-status-pills">
              <span className={p.spect ? 'pill-spect-on' : 'pill-spect-off'}>
                {p.spect ? '3D SPECT Available' : 'SPECT Unavailable (Prior M)'}
              </span>
            </div>
            <p className="patient-clinical-note">{p.note}</p>
            <button type="button" className="ws-action-btn" onClick={() => onSelect(p)}>
              Open Patient Workstation <ArrowUpRight size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function BenchmarksView({ active, setActive }: { active: string; setActive: (v: string) => void }) {
  const groups: Record<string, { title: string; metric: string; val: string; rows: [string, string, string, string][]; note: string }> = {
    'PPMI held-out': {
      title: 'PPMI Held-Out Test (N=221 participants, 728 labeled visits)',
      metric: 'Balanced Accuracy',
      val: '71.11%',
      rows: [
        ['ParkiSight-AI (Hybrid Ensemble)', '71.11%', '0.7256', 'Multimodal state-of-the-art'],
        ['Tuned Gradient Boosted Trees', '—', '0.7300', 'Strong tabular baseline'],
        ['FT-Transformer', '—', '0.7015', 'Tabular Deep Learning'],
        ['SAINT', '—', '0.7084', 'Tabular Transformer'],
        ['TabNet', '—', '0.6890', 'Sparse Attention'],
        ['Standalone 3D CNN', '24.68%', '—', 'Near random guessing (25%) without clinical fusion'],
      ],
      note: 'Partitioned strictly via GroupShuffleSplit on Patient ID (PATNO). Zero patient overlap.',
    },
    'PDBP zero-shot': {
      title: 'PDBP External Zero-Shot Validation (N=1,120 participants, 4,812 encounters)',
      metric: 'Zero-Shot Accuracy',
      val: '67.84%',
      rows: [
        ['Balanced Staging Accuracy', '67.84%', '—', 'Zero-shot cross-cohort transfer'],
        ['Motor Severity R²', '—', '0.6912', '100% missing SPECT (no scans in PDBP)'],
        ['Motor Severity RMSE', '—', '8.42 pts', 'Across multi-center clinical sites'],
      ],
      note: 'Evaluated with zero fine-tuning on external PDBP registry where DaTSCAN SPECT was absent.',
    },
    'Missing SPECT': {
      title: 'Missing-Modality Masking Stress Test (0% — 100% SPECT Masking)',
      metric: 'Accuracy Retained',
      val: '69.80%',
      rows: [
        ['ParkiSight-AI (Prior Token M)', '69.80%', '−3.05 pp decline', 'Robust latent preservation'],
        ['Modality Dropout', '66.82%', '−6.03 pp decline', 'Comparator method'],
        ['Static Concatenation', '65.18%', '−7.67 pp decline', 'Comparator method'],
        ['Mean Imputation', '63.45%', '−9.40 pp decline', 'Comparator method'],
        ['Zero-Fill Imputation', '61.24%', '−11.61 pp decline', 'Severe degradation'],
      ],
      note: 'Tested across 100% artificial masking on the PPMI held-out test cohort.',
    },
    'Progression': {
      title: 'Honest Progression Forecasting (Rate-of-Change ΔR²)',
      metric: '36-Month Signal',
      val: '+0.0216',
      rows: [
        ['12-Month Horizon', '≈ 0.000', 'Noise floor', 'Biomarker measurement noise'],
        ['24-Month Horizon', '≈ 0.000', 'Noise floor', 'Individual symptom fluctuation'],
        ['36-Month Horizon', '+0.0216', 'ΔR²', 'Emerging signal (FDR q=0.038)'],
        ['ElasticNet Baseline (36m)', '+0.0308', 'ΔR²', 'Linear regularized benchmark'],
      ],
      note: 'Predicts annualized rate-of-change (ΔNP3TOT) rather than misleading persistence R² = 0.6019.',
    },
  };

  const current = groups[active] || groups['PPMI held-out'];

  return (
    <div className="ws-subview">
      <div className="subview-header">
        <div>
          <span className="scientific-tag">PEER-REVIEWED RESEARCH ARTIFACTS</span>
          <h3>Benchmark Explorer</h3>
          <p>Verified experimental results across validation cohorts.</p>
        </div>
      </div>

      <div className="benchmark-tabs-row" role="tablist">
        {Object.keys(groups).map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={active === key}
            className={`bm-tab-btn ${active === key ? 'active' : ''}`}
            onClick={() => setActive(key)}
          >
            {key}
          </button>
        ))}
      </div>

      <div className="bm-highlight-card">
        <div>
          <span className="bm-metric-label">{current.metric.toUpperCase()}</span>
          <strong className="bm-big-val">{current.val}</strong>
          <p className="bm-title-text">{current.title}</p>
        </div>
      </div>

      <div className="journal-table">
        <div className="table-row table-head">
          <span>MODEL / EXPERIMENT</span>
          <span>STAGING ACC.</span>
          <span>MOTOR R²</span>
          <span>METHODOLOGICAL CONTEXT</span>
        </div>
        {current.rows.map(([name, acc, r2, ctx], i) => (
          <div key={name} className={`table-row ${i === 0 ? 'row-highlight' : ''}`}>
            <strong>{name}</strong>
            <b>{acc}</b>
            <b>{r2}</b>
            <small>{ctx}</small>
          </div>
        ))}
      </div>

      <div className="bm-footer-note">
        <ShieldCheck size={14} />
        <span>{current.note}</span>
      </div>
    </div>
  );
}

function CohortAuditView({
  enrichment,
  setEnrichment,
}: {
  enrichment: number;
  setEnrichment: (v: number) => void;
}) {
  const enrichedArm = Math.round(216 * (1 - enrichment / 100));

  return (
    <div className="ws-subview">
      <div className="subview-header">
        <div>
          <span className="scientific-tag">METHODOLOGY AUDIT</span>
          <h3>Cohort Flow & Trial Enrichment Protocol</h3>
          <p>STROBE participant flow, anti-leakage audit, and sample size calculator for clinical trials.</p>
        </div>
      </div>

      <div className="audit-flow-card">
        <div className="audit-numbers-flow">
          <div className="flow-step">
            <strong>{COHORT_STROBE.screened.toLocaleString()}</strong>
            <span>Screened</span>
          </div>
          <div className="flow-arrow">→</div>
          <div className="flow-step excluded">
            <strong>−{COHORT_STROBE.excludedTotal}</strong>
            <span>Excluded (64 SWEDD)</span>
          </div>
          <div className="flow-arrow">→</div>
          <div className="flow-step final">
            <strong>{COHORT_STROBE.includedParticipants.toLocaleString()}</strong>
            <span>PPMI Cohort</span>
          </div>
          <div className="flow-arrow">→</div>
          <div className="flow-step">
            <strong>{COHORT_STROBE.totalVisits.toLocaleString()}</strong>
            <span>Visits (108 Mo)</span>
          </div>
        </div>
      </div>

      {/* Trial Enrichment Sample Size Calculator */}
      <div className="enrichment-calculator-card">
        <div className="enrichment-header">
          <span className="scientific-tag">CLINICAL TRIAL ENRICHMENT SIMULATOR</span>
          <h4>Sample Size Reduction via Progression Stratification</h4>
          <p>
            Simulate how stratifying patients with ParkiSight-AI prior to trial recruitment reduces the required
            sample size per arm by filtering non-progressors.
          </p>
        </div>

        <div className="calc-slider-box">
          <label>
            <span>Assumed Trial Enrichment Efficiency: <strong>{enrichment.toFixed(1)}%</strong></span>
            <input
              type="range"
              min="0"
              max="60"
              step="0.5"
              value={enrichment}
              onChange={(e) => setEnrichment(Number(e.target.value))}
              className="scientific-range"
            />
          </label>
          <div className="calc-arms-comparison">
            <div className="arm-box">
              <span>STANDARD UNSTRATIFIED TRIAL</span>
              <strong>216</strong>
              <small>Participants per arm</small>
            </div>
            <div className="arm-arrow">→</div>
            <div className="arm-box enriched">
              <span>PARKISIGHT ENRICHED TRIAL</span>
              <strong>{enrichedArm}</strong>
              <small>Participants per arm ({enrichment.toFixed(1)}% reduction)</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResearchOverviewView({ onBenchmarks, onAudit }: { onBenchmarks: () => void; onAudit: () => void }) {
  return (
    <div className="ws-subview">
      <div className="research-summary-tiles">
        <div className="summary-tile">
          <span className="tile-label">PPMI HELD-OUT</span>
          <strong className="tile-val">71.11%</strong>
          <small>4-Class Balanced Accuracy</small>
        </div>
        <div className="summary-tile">
          <span className="tile-label">PDBP ZERO-SHOT</span>
          <strong className="tile-val">67.84%</strong>
          <small>N=1,120 · 100% Missing SPECT</small>
        </div>
        <div className="summary-tile">
          <span className="tile-label">ANTI-LEAKAGE</span>
          <strong className="tile-val">0 OVERLAP</strong>
          <small>PATNO Isolated GroupShuffleSplit</small>
        </div>
        <div className="summary-tile">
          <span className="tile-label">36-MO SIGNAL</span>
          <strong className="tile-val">+0.0216</strong>
          <small>Annualized Rate-of-Change ΔR²</small>
        </div>
      </div>

      <div className="research-actions-dual">
        <div className="action-card" onClick={onBenchmarks}>
          <h4>Inspect Peer-Reviewed Benchmarks</h4>
          <p>Compare performance against TabNet, FT-Transformer, SAINT, and standalone 3D CNN.</p>
          <button type="button" className="ws-action-btn">
            Open Benchmark Explorer <ArrowUpRight size={14} />
          </button>
        </div>
        <div className="action-card" onClick={onAudit}>
          <h4>Cohort Integrity & Trial Protocol</h4>
          <p>Review the STROBE flow, SWEDD rationale, and trial enrichment sample size simulator.</p>
          <button type="button" className="ws-action-btn">
            Open Cohort Audit <ArrowUpRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function PatientOverviewView({
  checkin,
  setCheckin,
  onSave,
  onPrep,
  saved,
}: {
  checkin: { movement: number; sleep: number; mood: number; energy: number; medication: boolean };
  setCheckin: (v: { movement: number; sleep: number; mood: number; energy: number; medication: boolean }) => void;
  onSave: () => void;
  onPrep: () => void;
  saved: boolean;
}) {
  const fields: [keyof typeof checkin, string][] = [
    ['movement', 'Movement & Balance Stability'],
    ['sleep', 'Sleep Quality & Restfulness'],
    ['mood', 'Mood & Mental Clarity'],
    ['energy', 'Daily Physical Energy'],
  ];

  return (
    <div className="ws-subview patient-subview">
      <div className="patient-hero-banner">
        <div>
          <span className="patient-welcome-tag">DAILY REFLECTION</span>
          <h3>How are you feeling today, Jordan?</h3>
          <p>
            Logging your daily patterns helps you and your neurologist see how medications and activities support
            your well-being over time.
          </p>
        </div>
      </div>

      <div className="daily-sliders-box">
        {fields.map(([key, label]) => (
          <label key={key} className="patient-slider-row">
            <div className="slider-text-row">
              <span>{label}</span>
              <strong>{checkin[key]}/10</strong>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={checkin[key] as number}
              onChange={(e) => setCheckin({ ...checkin, [key]: Number(e.target.value) })}
              className="ws-slider"
            />
            <div className="patient-endpoints">
              <span>0 (Challenging day)</span>
              <span>10 (Feeling great)</span>
            </div>
          </label>
        ))}

        <label className="checkbox-row med-timing-row">
          <input
            type="checkbox"
            checked={checkin.medication}
            onChange={(e) => setCheckin({ ...checkin, medication: e.target.checked })}
          />
          <span>Include my medication timing in my doctor visit notes</span>
        </label>

        <div className="patient-save-bar">
          <button type="button" className="ws-action-btn" onClick={onSave}>
            {saved ? 'Daily Record Saved' : 'Save Today’s Check-in'} {saved ? <Check size={14} /> : <ArrowUpRight size={14} />}
          </button>
          <button type="button" className="text-prep-btn" onClick={onPrep}>
            Prepare for My Next Doctor Visit →
          </button>
        </div>
      </div>
    </div>
  );
}

function PatientTimelineView() {
  return (
    <div className="ws-subview">
      <div className="subview-header">
        <div>
          <span className="scientific-tag">PERSONAL TIMELINE</span>
          <h3>Your Longitudinal Stability Chart</h3>
          <p>Illustrative stability tracking across clinical study milestones.</p>
        </div>
      </div>

      <div className="patient-chart-card">
        <div className="chart-svg-wrap">
          <svg viewBox="0 0 620 160" preserveAspectRatio="none" role="img" aria-label="Stability timeline">
            <path
              d="M0 110 C60 100 80 122 130 93 S205 112 255 79 S325 95 375 67 S450 82 495 54 S560 65 620 36"
              fill="none"
              stroke="#D85C42"
              strokeWidth="3"
            />
          </svg>
        </div>
        <div className="chart-timeline-labels">
          <span>Baseline</span>
          <span>Month 06</span>
          <span>Month 12</span>
          <span>Month 24</span>
          <span>Month 36</span>
        </div>
      </div>
    </div>
  );
}

function VisitPreparationView({ onExport }: { onExport: () => void }) {
  return (
    <div className="ws-subview">
      <div className="subview-header">
        <div>
          <span className="scientific-tag">APPOINTMENT PREPARATION</span>
          <h3>Questions to Share With Your Doctor</h3>
          <p>A simple checklist to organize your thoughts before your next neurological consultation.</p>
        </div>
      </div>

      <div className="prep-checklist-card">
        <ul className="prep-list">
          <li>Note any times when tremors or stiffness felt more pronounced during the day.</li>
          <li>Bring an up-to-date schedule of your Levodopa and other medication dosing times.</li>
          <li>Write down any sleep disruptions or daytime fatigue you noticed this month.</li>
          <li>Ask your doctor if any changes in your walking or balance require therapy adjustments.</li>
        </ul>
        <button type="button" className="ws-action-btn" onClick={onExport}>
          <Download size={14} /> Download Visit Summary Guide (.txt)
        </button>
      </div>
    </div>
  );
}
