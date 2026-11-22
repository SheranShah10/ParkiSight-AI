'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Activity, ArrowUpRight, Menu, X, ShieldCheck } from 'lucide-react';
import ThemeToggle from '@/components/theme/ThemeToggle';

type Props = {
  activeChapter?: number;
};

export default function Header({ activeChapter = 0 }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && menuOpen) setMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  return (
    <header className={`neural-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="header-inner">
        {/* Brand */}
        <Link href="/" className="neural-brand" aria-label="ParkiSight AI Homepage">
          <span className="brand-icon">
            <Activity size={16} />
          </span>
          <span className="brand-name">
            <strong>ParkiSight</strong>
            <small>AI</small>
          </span>
          <span className="brand-badge">2026 RESEARCH</span>
        </Link>

        {/* Center Navigation Links */}
        <nav className="header-nav" aria-label="Main Navigation">
          <a href="#arrival" className="nav-link">
            <span>01</span> ARRIVAL
          </a>
          <a href="#imaging" className="nav-link">
            <span>02</span> IMAGING
          </a>
          <a href="#missingness" className="nav-link">
            <span>03</span> SPARSITY
          </a>
          <a href="#fusion" className="nav-link">
            <span>04</span> FUSION
          </a>
          <a href="#evidence" className="nav-link">
            <span>05</span> EVIDENCE
          </a>
        </nav>

        {/* Right Action Buttons */}
        <div className="header-actions">
          <ThemeToggle />
          <Link href="/auth" className="auth-link">
            Sign In
          </Link>
          <Link href="/dashboard" className="demo-launch-btn">
            <span>Enter CDSS Demo</span>
            <ArrowUpRight size={14} />
          </Link>
          <button
            type="button"
            className="mobile-toggle-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="mobile-drawer" role="dialog" aria-modal="true" aria-label="Mobile Navigation">
          <div className="drawer-links">
            <a href="#arrival" onClick={() => setMenuOpen(false)}>
              <b>01</b> The Brain Arrival
            </a>
            <a href="#imaging" onClick={() => setMenuOpen(false)}>
              <b>02</b> Dopamine Transporter Imaging
            </a>
            <a href="#missingness" onClick={() => setMenuOpen(false)}>
              <b>03</b> Longitudinal Sparsity
            </a>
            <a href="#fusion" onClick={() => setMenuOpen(false)}>
              <b>04</b> NeuroCross & AMGU Fusion
            </a>
            <a href="#evidence" onClick={() => setMenuOpen(false)}>
              <b>05</b> Research Evidence & Cohorts
            </a>
            <div className="drawer-actions">
              <div className="drawer-theme-row">
                <span>Color Theme:</span>
                <ThemeToggle showLabel={true} />
              </div>
              <Link href="/auth" onClick={() => setMenuOpen(false)} className="drawer-auth-btn">
                Workspace Roles
              </Link>
              <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="drawer-demo-btn">
                Launch Live Demo <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
