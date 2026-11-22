'use client';

import { Activity, RotateCcw, ScanLine, Eye } from 'lucide-react';
import type { AnatomyFocus, SliceMode } from '@/lib/types';

type Props = {
  focus: AnatomyFocus;
  onSelectFocus: (focus: AnatomyFocus) => void;
  sliceMode: SliceMode;
  onSelectSlice: (slice: SliceMode) => void;
  labelsOn: boolean;
  onToggleLabels: () => void;
};

export default function AnatomyInspector({
  focus,
  onSelectFocus,
  sliceMode,
  onSelectSlice,
  labelsOn,
  onToggleLabels,
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
          className={`inspector-btn target-btn ${focus === 'caudate' ? 'active' : ''}`}
          onClick={() => onSelectFocus('caudate')}
        >
          <span className="target-dot caudate" /> Caudate
        </button>
        <button
          type="button"
          className={`inspector-btn target-btn ${focus === 'putamen' ? 'active' : ''}`}
          onClick={() => onSelectFocus('putamen')}
        >
          <span className="target-dot putamen" /> Putamen
        </button>
      </div>

      <div className="slice-selectors" role="group" aria-label="Select imaging slice plane">
        <span className="inspector-label">PLANE</span>
        {(['axial', 'coronal', 'sagittal'] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            className={`slice-btn ${sliceMode === mode ? 'active' : ''}`}
            onClick={() => onSelectSlice(mode)}
          >
            {mode.slice(0, 2).toUpperCase()}
          </button>
        ))}
      </div>

      <div className="inspector-actions">
        <button
          type="button"
          className={`toggle-labels-btn ${labelsOn ? 'active' : ''}`}
          onClick={onToggleLabels}
          title="Toggle ROI labels"
        >
          <Eye size={13} /> {labelsOn ? 'Labels' : 'Mute'}
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
