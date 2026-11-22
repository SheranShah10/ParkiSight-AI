'use client';

import { Activity, RotateCcw, ScanLine, Eye, Sparkles, Scissors, ArrowDown } from 'lucide-react';
import type { AnatomyFocus, SliceMode } from '@/lib/types';

type Props = {
  focus: AnatomyFocus;
  onSelectFocus: (focus: AnatomyFocus) => void;
  sliceMode: SliceMode;
  onSelectSlice: (slice: SliceMode) => void;
  labelsOn: boolean;
  onToggleLabels: () => void;
  onScrollToImaging?: () => void;
};

export default function AnatomyInspector({
  focus,
  onSelectFocus,
  sliceMode,
  onSelectSlice,
  labelsOn,
  onToggleLabels,
  onScrollToImaging,
}: Props) {
  return (
    <div className="anatomy-inspector-bar">
      <div className="anatomy-targets" role="group" aria-label="Select anatomical focus">
        <span className="inspector-label">ANATOMICAL FOCUS</span>
        <button
          type="button"
          className={`inspector-btn ${focus === 'overview' ? 'active' : ''}`}
          onClick={() => onSelectFocus('overview')}
        >
          Overview
        </button>
        <button
          type="button"
          className={`inspector-btn target-btn ${focus === 'striatum' ? 'active' : ''}`}
          onClick={() => onSelectFocus('striatum')}
          title="Zoom into bilateral striatum (caudate & putamen)"
        >
          <span className="target-dot striatum" /> Striatum
        </button>
        <button
          type="button"
          className={`inspector-btn target-btn ${focus === 'caudate' ? 'active' : ''}`}
          onClick={() => onSelectFocus('caudate')}
          title="Inspect Caput, Corpus, and Cauda Nuclei Caudati"
        >
          <span className="target-dot caudate" /> Caudate
        </button>
        <button
          type="button"
          className={`inspector-btn target-btn ${focus === 'putamen' ? 'active' : ''}`}
          onClick={() => onSelectFocus('putamen')}
          title="Inspect Putamen lentiform nucleus (Primary PD Deficit)"
        >
          <span className="target-dot putamen" /> Putamen
        </button>
        <button
          type="button"
          className={`inspector-btn target-btn ${focus === 'compare' ? 'active' : ''}`}
          onClick={() => onSelectFocus('compare')}
          title="Compare contralateral vs ipsilateral striatal dopamine depletion"
        >
          <Activity size={12} /> Compare
        </button>
        <button
          type="button"
          className={`inspector-btn target-btn ${focus === 'cross-section' ? 'active' : ''}`}
          onClick={() => onSelectFocus('cross-section')}
          title="Hardware cross-section cutaway clipping"
        >
          <Scissors size={12} /> Section
        </button>
        <button
          type="button"
          className="inspector-btn reset-btn"
          onClick={() => onSelectFocus('overview')}
          title="Reset anatomical camera and orientation"
        >
          <RotateCcw size={11} /> Reset
        </button>
      </div>

      <div className="slice-selectors" role="group" aria-label="Select imaging slice plane">
        <span className="inspector-label">PLANE</span>
        {(['axial', 'coronal', 'sagittal'] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            className={`slice-btn ${sliceMode === mode ? 'active' : ''}`}
            onClick={() => {
              onSelectSlice(mode);
              if (focus !== 'cross-section') onSelectFocus('cross-section');
            }}
          >
            {mode.slice(0, 2).toUpperCase()}
          </button>
        ))}
      </div>

      <div className="inspector-actions">
        {onScrollToImaging && (
          <button
            type="button"
            className="datscan-transition-btn"
            onClick={onScrollToImaging}
            title="Correlate with DaTSCAN SPECT imaging in Chapter 02"
          >
            <ScanLine size={12} /> DaTSCAN <ArrowDown size={11} />
          </button>
        )}
        <button
          type="button"
          className={`toggle-labels-btn ${labelsOn ? 'active' : ''}`}
          onClick={onToggleLabels}
          title="Toggle ROI labels"
        >
          <Eye size={13} /> {labelsOn ? 'HUD' : 'Mute'}
        </button>
        <button
          type="button"
          className="reset-btn"
          onClick={() => {
            onSelectFocus('overview');
            onSelectSlice('axial');
          }}
          title="Reset camera and planes"
        >
          <RotateCcw size={13} />
        </button>
      </div>
    </div>
  );
}
