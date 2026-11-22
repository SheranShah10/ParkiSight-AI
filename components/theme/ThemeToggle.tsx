'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({
  className = '',
  showLabel = false,
}: {
  className?: string;
  showLabel?: boolean;
}) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('parkisight-theme') as 'dark' | 'light' | null;
      if (saved) {
        setTheme(saved);
        document.documentElement.setAttribute('data-theme', saved);
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initial = prefersDark ? 'dark' : 'dark';
        setTheme(initial);
        document.documentElement.setAttribute('data-theme', initial);
      }
    } catch {
      // Ignore localStorage access errors in iframe/sandboxes
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try {
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('parkisight-theme', next);
    } catch {
      // Ignore storage errors
    }
    window.dispatchEvent(new CustomEvent('themechange', { detail: next }));
  };

  if (!mounted) {
    return (
      <button
        type="button"
        className={`theme-toggle-btn ${className}`}
        aria-label="Toggle theme"
      >
        <Moon size={14} />
        {showLabel && <span className="theme-btn-label">Theme</span>}
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`theme-toggle-btn ${className} ${theme === 'light' ? 'is-light' : 'is-dark'}`}
      onClick={toggleTheme}
      title={theme === 'dark' ? 'Switch to Clinical Light Theme' : 'Switch to Obsidian Dark Theme'}
      aria-label="Toggle color theme"
    >
      {theme === 'dark' ? <Sun size={14} className="theme-icon sun-icon" /> : <Moon size={14} className="theme-icon moon-icon" />}
      {showLabel && <span className="theme-btn-label">{theme === 'dark' ? 'Light' : 'Dark'}</span>}
    </button>
  );
}
