'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Activity, ArrowLeft, ArrowRight, Check, ShieldCheck, HeartPulse, UserCheck, Stethoscope, Users } from 'lucide-react';

const ROLES = [
  {
    id: 'Clinician / Neurologist',
    title: 'Clinician / Neurologist',
    description: 'Access the complete CDSS copilot: patient inputs, 4-stage predictions, 3D Grad-CAM slices, and FHIR export.',
    badge: 'DIAGNOSTIC COPILOT',
    icon: Stethoscope,
  },
  {
    id: 'Patient / Caregiver',
    title: 'Patient / Caregiver',
    description: 'A calm, supportive wellness journal: daily symptom check-ins, personal stability timelines, and appointment preparation.',
    badge: 'PATIENT COMPANION',
    icon: HeartPulse,
  },
  {
    id: 'Researcher / Trial Lead',
    title: 'Researcher / Trial Lead',
    description: 'Audit cohort partitions, explore benchmark comparisons, and simulate clinical trial sample-size enrichment.',
    badge: 'RESEARCH SUITE',
    icon: Users,
  },
];

export default function AuthPage() {
  const [selectedRole, setSelectedRole] = useState(ROLES[0].id);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const [fullName, setFullName] = useState('Dr. Alex Morgan');
  const [institution, setInstitution] = useState('Movement Disorder Center');

  return (
    <main className="neural-auth-page" suppressHydrationWarning>
      {/* Left Column: Restrained Editorial Scientific Artwork */}
      <div className="auth-editorial-col">
        <div className="auth-brand-strip">
          <Link href="/" className="auth-brand" aria-label="Back to Homepage">
            <span className="brand-icon">
              <Activity size={17} />
            </span>
            <strong>ParkiSight</strong>
            <small>AI</small>
          </Link>
          <Link href="/" className="back-home-link">
            <ArrowLeft size={14} /> Back to Overview
          </Link>
        </div>

        <div className="auth-editorial-center">
          <div className="scientific-sigil">
            <div className="sigil-ring-outer" />
            <div className="sigil-ring-inner" />
            <div className="sigil-center-orb">
              <Activity size={38} />
            </div>
            <span className="sigil-tag">NEURAL ARCHIVE · 2026</span>
          </div>

          <h2 className="auth-editorial-headline">
            Insight grounded in evidence, shaped to the <span className="serif-highlight">person.</span>
          </h2>
          <p className="auth-editorial-sub">
            ParkiSight-AI translates multimodal neuroscience into actionable perspectives: diagnostic clarity for neurologists, calm clarity for patients, and methodological transparency for researchers.
          </p>
        </div>

        <div className="auth-editorial-foot">
          <div className="foot-shield">
            <ShieldCheck size={16} />
            <div>
              <strong>De-Identified Demonstration Environment</strong>
              <small>No protected health information (PHI) is collected, stored, or processed.</small>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Refined Authentication & Role Selector */}
      <div className="auth-form-col">
        <div className="auth-card-wrap">
          {/* Mode Tabs */}
          <div className="auth-mode-switch" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={authMode === 'signup'}
              className={authMode === 'signup' ? 'active' : ''}
              onClick={() => setAuthMode('signup')}
            >
              Select Workspace
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={authMode === 'signin'}
              className={authMode === 'signin' ? 'active' : ''}
              onClick={() => setAuthMode('signin')}
            >
              Sign In
            </button>
          </div>

          <div className="auth-card-heading">
            <span className="scientific-tag">WORKSPACE SELECTOR</span>
            <h3>{authMode === 'signup' ? 'Choose Your Perspective' : 'Welcome Back'}</h3>
            <p>Select your operational persona to enter the tailored ParkiSight interface.</p>
          </div>

          {/* Role Cards Selector */}
          <div className="role-cards-list" role="radiogroup" aria-label="Choose your role">
            {ROLES.map((role, idx) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;
              return (
                <button
                  key={role.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setSelectedRole(role.id)}
                  className={`role-choice-card ${isSelected ? 'is-selected' : ''}`}
                >
                  <div className="role-choice-top">
                    <span className="role-num">0{idx + 1}</span>
                    <span className="role-badge">{role.badge}</span>
                    {isSelected && <span className="role-check"><Check size={14} /></span>}
                  </div>
                  <div className="role-choice-body">
                    <strong className="role-title">
                      <Icon size={15} /> {role.title}
                    </strong>
                    <p className="role-desc">{role.description}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Form Fields Tailored to Role */}
          <div className="role-fields-container">
            <label className="field-row">
              <span>Full Name or Identifier</span>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Dr. Alex Morgan"
              />
            </label>

            {selectedRole.startsWith('Clinician') && (
              <>
                <label className="field-row">
                  <span>Movement Disorder Center / Hospital</span>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="e.g. Movement Disorders Clinic"
                  />
                </label>
                <div className="field-row select-row">
                  <span>Clinical Integration Protocol</span>
                  <select defaultValue="fhir">
                    <option value="fhir">HL7 FHIR v4.0.1 (ClinicalImpression Export)</option>
                    <option value="manual">Manual Workstation Entry</option>
                  </select>
                </div>
              </>
            )}

            {selectedRole.startsWith('Patient') && (
              <>
                <div className="field-row select-row">
                  <span>Primary Symptom Focus</span>
                  <select defaultValue="movement">
                    <option value="movement">Movement & Balance Stability</option>
                    <option value="sleep">Sleep Quality & Fatigue</option>
                    <option value="daily">Daily Activities & Motor Independence</option>
                  </select>
                </div>
                <label className="checkbox-row">
                  <input type="checkbox" defaultChecked />
                  <span>Track medication ON/OFF timing during daily check-ins</span>
                </label>
              </>
            )}

            {selectedRole.startsWith('Researcher') && (
              <>
                <label className="field-row">
                  <span>Research Institution / University</span>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="e.g. Academic Medical Center"
                  />
                </label>
                <div className="field-row select-row">
                  <span>Primary Evaluation Cohort</span>
                  <select defaultValue="ppmi">
                    <option value="ppmi">PPMI Held-Out Test (N=221, 728 Visits)</option>
                    <option value="pdbp">PDBP Zero-Shot External (N=1,120 Visits)</option>
                  </select>
                </div>
              </>
            )}
          </div>

          {/* Enter Button */}
          <Link
            href={`/dashboard?role=${encodeURIComponent(selectedRole)}`}
            className="auth-enter-btn"
          >
            <span>Launch {selectedRole.split(' / ')[0]} Workspace</span>
            <ArrowRight size={16} />
          </Link>

          {/* Instant 1-Click Demo Access Bar */}
          <div className="instant-demo-bar">
            <span className="demo-divider-text">INSTANT 1-CLICK ACCESS</span>
            <div className="quick-access-chips">
              {ROLES.map((r, i) => (
                <Link
                  key={r.id}
                  href={`/dashboard?role=${encodeURIComponent(r.id)}`}
                  className="quick-chip"
                >
                  Enter as <strong>{i === 0 ? 'Clinician' : i === 1 ? 'Patient' : 'Researcher'}</strong>
                  <ArrowRight size={12} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
