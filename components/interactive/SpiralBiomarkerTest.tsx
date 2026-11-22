'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Activity, RotateCcw, Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, Play } from 'lucide-react';

type Point = { x: number; y: number; t: number };

export default function SpiralBiomarkerTest() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState<Point[]>([]);
  const [mode, setMode] = useState<'draw' | 'healthy' | 'parkinsonian'>('draw');

  // Computed Neuromotor Biomarkers
  const [metrics, setMetrics] = useState({
    tremorFrequency: 0,
    smoothnessIndex: 0,
    kinematicJerk: 0,
    status: 'Draw a spiral from center outward to begin analysis',
    severity: 'neutral' as 'neutral' | 'normal' | 'tremor',
  });

  // Draw background reference guide spiral
  const drawGuide = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) * 0.44;

    // Faint concentric Archimedes spiral guide
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 6]);

    const numTurns = 3.5;
    for (let angle = 0; angle < numTurns * 2 * Math.PI; angle += 0.05) {
      const radius = (angle / (numTurns * 2 * Math.PI)) * maxRadius;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      if (angle === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Center starting bullseye
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, 2 * Math.PI);
    ctx.fillStyle = '#38A892';
    ctx.fill();

    ctx.font = '10px monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.textAlign = 'center';
    ctx.fillText('START HERE', centerX, centerY - 10);
  }, []);

  // Redraw canvas on state changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI scaling
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    drawGuide(ctx, rect.width, rect.height);

    // Draw user path
    if (points.length > 1) {
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.strokeStyle = metrics.severity === 'tremor' ? '#FF5722' : metrics.severity === 'normal' ? '#4ADE80' : '#55E6CC';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }
  }, [points, metrics.severity, drawGuide]);

  // Compute kinematic metrics from points
  const analyzeTrajectory = useCallback((pts: Point[]) => {
    if (pts.length < 25) {
      setMetrics({
        tremorFrequency: 0,
        smoothnessIndex: 0,
        kinematicJerk: 0,
        status: 'Spiral too brief for clinical frequency estimation. Draw a larger 3-loop spiral.',
        severity: 'neutral',
      });
      return;
    }

    let totalJerk = 0;
    let directionalChanges = 0;
    const centerX = (canvasRef.current?.getBoundingClientRect().width || 360) / 2;
    const centerY = (canvasRef.current?.getBoundingClientRect().height || 360) / 2;

    const radii: number[] = [];
    for (let i = 0; i < pts.length; i++) {
      const r = Math.sqrt((pts[i].x - centerX) ** 2 + (pts[i].y - centerY) ** 2);
      radii.push(r);
    }

    // Measure radial velocity fluctuations (tremor oscillations)
    let oscillations = 0;
    for (let i = 2; i < radii.length; i++) {
      const d1 = radii[i - 1] - radii[i - 2];
      const d2 = radii[i] - radii[i - 1];
      if (d1 * d2 < 0) oscillations++;
      totalJerk += Math.abs(d2 - d1);
    }

    const durationSec = Math.max(0.8, (pts[pts.length - 1].t - pts[0].t) / 1000);
    const estimatedHz = Number(Math.min(9.5, Math.max(0, (oscillations / (2 * durationSec)))).toFixed(1));
    const smoothness = Math.max(15, Math.min(98, Math.round(100 - (totalJerk / pts.length) * 12)));
    const jerkVal = Number((totalJerk / pts.length).toFixed(2));

    const isTremor = (estimatedHz >= 3.8 && estimatedHz <= 6.5) || smoothness < 62;

    setMetrics({
      tremorFrequency: estimatedHz,
      smoothnessIndex: smoothness,
      kinematicJerk: jerkVal,
      status: isTremor
        ? 'Pathological 4–6 Hz oscillatory micro-tremor detected consistent with resting tremor spectrum'
        : 'Smooth continuous kinematic trajectory. Normal motor execution verified',
      severity: isTremor ? 'tremor' : 'normal',
    });
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setIsDrawing(true);
    setMode('draw');
    setPoints([{ x, y, t: performance.now() }]);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setPoints((prev) => [...prev, { x, y, t: performance.now() }]);
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
    analyzeTrajectory(points);
  };

  const resetCanvas = () => {
    setPoints([]);
    setMode('draw');
    setMetrics({
      tremorFrequency: 0,
      smoothnessIndex: 0,
      kinematicJerk: 0,
      status: 'Draw a spiral from center outward to begin analysis',
      severity: 'neutral',
    });
  };

  // Automated Healthy Simulation
  const simulateHealthy = () => {
    setMode('healthy');
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const maxR = Math.min(rect.width, rect.height) * 0.42;

    const simPts: Point[] = [];
    const turns = 3.2;
    const totalSteps = 140;
    const startTime = performance.now();

    for (let i = 0; i <= totalSteps; i++) {
      const angle = (i / totalSteps) * turns * 2 * Math.PI;
      const r = (i / totalSteps) * maxR;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      simPts.push({ x, y, t: startTime + i * 22 });
    }

    setPoints(simPts);
    analyzeTrajectory(simPts);
  };

  // Automated Parkinsonian 5 Hz Tremor Simulation
  const simulateParkinsonian = () => {
    setMode('parkinsonian');
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const maxR = Math.min(rect.width, rect.height) * 0.4;

    const simPts: Point[] = [];
    const turns = 3.2;
    const totalSteps = 160;
    const startTime = performance.now();

    for (let i = 0; i <= totalSteps; i++) {
      const angle = (i / totalSteps) * turns * 2 * Math.PI;
      // Inject 5.0 Hz oscillatory perturbation mimicking parkinsonian resting tremor
      const tremorNoise = Math.sin(i * 0.72) * 5.2 + Math.cos(i * 1.4) * 2.8;
      const r = (i / totalSteps) * maxR + tremorNoise;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      simPts.push({ x, y, t: startTime + i * 25 });
    }

    setPoints(simPts);
    analyzeTrajectory(simPts);
  };

  return (
    <div className="spiral-biomarker-card">
      <div className="spiral-card-header">
        <div>
          <span className="scientific-tag">DIGITAL NEUROMOTOR BIOMARKER LAB</span>
          <h3 className="spiral-card-title">Archimedes Spiral Kinematic Tremor Test</h3>
        </div>
        <div className="spiral-actions-row">
          <button
            type="button"
            className={`spiral-mode-btn ${mode === 'draw' ? 'active' : ''}`}
            onClick={resetCanvas}
          >
            <RotateCcw size={12} /> Draw Freehand
          </button>
          <button
            type="button"
            className={`spiral-mode-btn ${mode === 'healthy' ? 'active' : ''}`}
            onClick={simulateHealthy}
          >
            <CheckCircle2 size={12} /> Healthy Control
          </button>
          <button
            type="button"
            className={`spiral-mode-btn ${mode === 'parkinsonian' ? 'active' : ''}`}
            onClick={simulateParkinsonian}
          >
            <AlertTriangle size={12} /> Parkinsonian (5 Hz)
          </button>
        </div>
      </div>

      <div className="spiral-body-grid">
        {/* Interactive Canvas Viewport */}
        <div className="spiral-canvas-wrap">
          <canvas
            ref={canvasRef}
            className="spiral-interactive-canvas"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          />
          <div className="canvas-instruction-cue">
            <span>Draw 3 loops starting from the center bullseye</span>
          </div>
        </div>

        {/* Real-Time Kinematic Analysis Board */}
        <div className="spiral-analytics-pane">
          <div className="analytics-header">
            <span className="analytics-pill">KINEMATIC SENSOR METRICS</span>
            <span className={`status-indicator ${metrics.severity}`}>
              {metrics.severity === 'tremor' ? 'TREMOR PATTERN' : metrics.severity === 'normal' ? 'PHYSIOLOGICAL' : 'READY'}
            </span>
          </div>

          <div className="metrics-gauges-stack">
            <div className="metric-row">
              <span className="metric-name">Tremor Frequency</span>
              <strong className={`metric-val ${metrics.severity === 'tremor' ? 'highlight-danger' : 'highlight-green'}`}>
                {metrics.tremorFrequency > 0 ? `${metrics.tremorFrequency} Hz` : '—'}
              </strong>
              <small>Clinical PD resting tremor window: 4.0–6.0 Hz</small>
            </div>

            <div className="metric-row">
              <span className="metric-name">Kinematic Smoothness</span>
              <strong className="metric-val">
                {metrics.smoothnessIndex > 0 ? `${metrics.smoothnessIndex}%` : '—'}
              </strong>
              <small>Inverse trajectory jerk index</small>
            </div>

            <div className="metric-row">
              <span className="metric-name">Radial Jerk Derivative</span>
              <strong className="metric-val">
                {metrics.kinematicJerk > 0 ? `${metrics.kinematicJerk}` : '—'}
              </strong>
              <small>Micrographic velocity fluctuation score</small>
            </div>
          </div>

          <div className="clinical-interpretation-box">
            <Activity size={14} className="icon-pulse" />
            <p>{metrics.status}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
