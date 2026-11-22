'use client';

import Link from 'next/link';
import { Activity, MoveUpRight, ShieldCheck, HeartPulse } from 'lucide-react';
import { RESEARCH_METADATA } from '@/lib/research-data';

export default function Footer() {
  return (
    <footer className="neural-footer">
      <div className="footer-top-grid">
        <div className="footer-brand-col">
          <Link href="/" className="footer-brand">
            <span className="brand-icon">
              <Activity size={18} />
            </span>
            <strong>ParkiSight</strong>
            <small>AI</small>
          </Link>
          <p className="footer-tagline">
            Knowledge-Based Multimodal and Missing-Modality Decision Support for Parkinson&apos;s Disease Staging and Progression.
          </p>
          <div className="footer-badge">
            <ShieldCheck size={14} /> PEER-REVIEWED METHODOLOGY · 2026
          </div>
        </div>

        <div className="footer-links-col">
          <span className="col-heading">RESEARCH REGISTRIES</span>
          <a href="https://www.ppmi-info.org/" target="_blank" rel="noreferrer">
            PPMI (Parkinson&apos;s Progression Markers) <MoveUpRight size={12} />
          </a>
          <a href="https://pdbp.ninds.nih.gov/" target="_blank" rel="noreferrer">
            NINDS PDBP Registry <MoveUpRight size={12} />
          </a>
          <a href="https://github.com/Farman335/ParkiSight-AI" target="_blank" rel="noreferrer">
            Source Code (GitHub) <MoveUpRight size={12} />
          </a>
        </div>

        <div className="footer-links-col">
          <span className="col-heading">WORKSPACE PERSPECTIVES</span>
          <Link href="/dashboard?role=Clinician%20%2F%20Neurologist">Neurologist / Clinician</Link>
          <Link href="/dashboard?role=Patient%20%2F%20Caregiver">Patient Companion</Link>
          <Link href="/dashboard?role=Researcher%20%2F%20Trial%20Lead">Trial Lead / Researcher</Link>
          <Link href="/auth">Sign In / Switch Role</Link>
        </div>

        <div className="footer-links-col">
          <span className="col-heading">3D MODEL ATTRIBUTION</span>
          <a href="https://commons.wikimedia.org/wiki/File:Brain_AS.stl" target="_blank" rel="noreferrer">
            Brain AS.stl by AgnieszkaStarostecka <MoveUpRight size={12} />
          </a>
          <small className="attr-license">Licensed under Creative Commons Attribution 4.0 International (CC BY 4.0)</small>
        </div>
      </div>

      {/* Authors and Affiliations Bar */}
      <div className="footer-authors-bar">
        <span className="authors-label">RESEARCH TEAM & COLLABORATING INSTITUTIONS:</span>
        <p className="authors-text">
          <strong>Muhammad Sheran Ali Bukhari¹</strong> (Lead Author), <strong>Sami Ur Rehman Raja¹</strong> (Neural Architect), <strong>Dr. Farman Ali¹*</strong>, <strong>Dr. Tariq Mahmood⁵</strong>, <strong>Dr. Ayesha Malik⁵</strong>, <strong>Dr. Usman Farooq⁶</strong>, <strong>Raed Alsini²</strong>, <strong>Ayman Yafoz²</strong>, <strong>Naif Waheb Rajkhan³</strong>, <strong>Tamim Alkhalifah⁴</strong>
          <br />
          ¹Department of Computer Science, Bahria University, Islamabad, Pakistan · ⁵Department of Neurology, Pakistan Institute of Medical Sciences (PIMS) & Shifa International Hospital, Islamabad · ⁶Aga Khan University Hospital, Karachi · ²Department of Information Systems, King Abdulaziz University, Jeddah · ³Department of Computer Science, King Abdulaziz University · ⁴College of Computer, Qassim University, Saudi Arabia
        </p>
      </div>

      {/* Medical & Regulatory Disclaimer */}
      <div className="footer-disclaimer-box">
        <HeartPulse size={16} />
        <p>
          <strong>Regulatory & Medical Disclaimer:</strong> {RESEARCH_METADATA.disclaimer}
        </p>
      </div>

      <div className="footer-bottom-line">
        <span>© 2026 ParkiSight-AI Research Consortium. Open Science & Academic Use.</span>
        <span>Version 2.0.4 · Built with Next.js App Router, Three.js & TypeScript</span>
      </div>
    </footer>
  );
}
