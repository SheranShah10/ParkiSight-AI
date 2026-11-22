'use client';

import { useEffect, useState, type CSSProperties } from 'react';

export type SliceMode = 'axial' | 'coronal' | 'sagittal';
type SceneProps = { progress: number; missing: boolean; sliceMode: SliceMode; labelsOn: boolean; active: boolean };

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const smooth = (from: number, to: number, value: number) => {
  const t = clamp01((value - from) / (to - from));
  return t * t * (3 - 2 * t);
};

/** Scroll-choreographed presentation of the cited anatomical brain-model render. */
export default function NeuralScene({ progress, missing, sliceMode, labelsOn, active }: SceneProps) {
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  const zoomIn = smooth(.12, .34, progress);
  const zoomOut = smooth(.76, .9, progress);
  const zoom = 1 + zoomIn * .18 - zoomOut * .14;
  const pitch = reducedMotion ? 0 : Math.sin(progress * Math.PI * 2) * 2.5;
  const yaw = reducedMotion ? 0 : 4 + smooth(.28, .52, progress) * 8 - smooth(.72, .88, progress) * 8;
  const x = -smooth(.18, .32, progress) * 3 + smooth(.38, .6, progress) * 2;
  const style = {
    '--brain-transform': `translate3d(${x}%, ${-zoomIn * 1.5}%, 0) rotateX(${pitch}deg) rotateY(${yaw}deg) scale(${zoom})`,
    '--particle-opacity': missing ? .8 : smooth(.14, .32, progress) * (1 - smooth(.72, .86, progress)) * .72,
    '--token-opacity': smooth(.34, .49, progress) * (1 - smooth(.66, .78, progress)) * .9,
    '--slice-opacity': smooth(.58, .72, progress) * (1 - smooth(.8, .9, progress)) * .8,
  } as CSSProperties;

  return <div className="real-brain-scene" style={style} data-active={active} data-labels={labelsOn} data-slice={sliceMode} aria-hidden="true">
    <div className="real-brain-halo"/>
    <div className="real-brain-image-wrap">
      <img className="real-brain-image" src="/images/human-brain-anatomical.png" alt="" draggable={false} fetchPriority="high"/>
      <i className="striatal-highlight highlight-left"/><i className="striatal-highlight highlight-right"/>
    </div>
    <div className="real-brain-particles"/>
    <div className="real-brain-tokens"/>
    <div className="real-brain-slice"><span>{sliceMode.toUpperCase()} PLANE</span></div>
  </div>;
}
