'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { Scan, Layers, Info, Sparkles, Scissors, ArrowDown, X, Zap } from 'lucide-react';
import type { AnatomyFocus, SliceMode } from '@/lib/types';

type BrainSceneProps = {
  progress?: number;
  missing?: boolean;
  sliceMode?: SliceMode;
  labelsOn?: boolean;
  active?: boolean;
  focus?: AnatomyFocus;
  onSelectAnatomy?: (focus: AnatomyFocus) => void;
  onScrollToImaging?: () => void;
};

// Preload the authentic NIH 3D anatomical human brain asset
if (typeof window !== 'undefined') {
  useGLTF.preload('/models/brain_human-nih3d.glb');
}

/* -------------------------------------------------------------------------- */
/* Authentic NIH 3D Anatomical Human Brain Mesh Model                          */
/* -------------------------------------------------------------------------- */
function AuthenticAnatomicalBrain({
  focused,
  sliceMode,
  isCrossSection,
}: {
  focused: AnatomyFocus;
  sliceMode: SliceMode;
  isCrossSection: boolean;
}) {
  const { scene } = useGLTF('/models/brain_human-nih3d.glb');
  const brainRef = useRef<THREE.Group>(null);

  // Hardware clipping planes for orthogonal cross-section cutaways
  const clippingPlanes = useMemo(() => {
    if (!isCrossSection) return [];
    if (sliceMode === 'axial') {
      return [new THREE.Plane(new THREE.Vector3(0, -1, 0), 0.22)];
    }
    if (sliceMode === 'coronal') {
      return [new THREE.Plane(new THREE.Vector3(0, 0, -1), 0.15)];
    }
    return [new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0.05)];
  }, [isCrossSection, sliceMode]);

  const isOverview = focused === 'overview';
  const isStriatum = focused === 'striatum';
  const isTargeted = focused === 'caudate' || focused === 'putamen';

  // Apply physically plausible brain-tissue materials across all authentic anatomical sub-meshes
  useEffect(() => {
    if (!scene) return;
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        mesh.material = new THREE.MeshPhysicalMaterial({
          color: isOverview ? '#9cb0a7' : isCrossSection ? '#a8bbb3' : '#526963',
          roughness: isOverview ? 0.46 : 0.35,
          metalness: 0.05,
          transmission: isOverview ? 0.0 : isStriatum ? 0.88 : isTargeted ? 0.92 : 0.18,
          thickness: isOverview ? 0.0 : 0.25,
          transparent: !isOverview,
          opacity: isOverview ? 1.0 : isStriatum ? 0.25 : isTargeted ? 0.2 : 0.9,
          clearcoat: 0.35,
          clearcoatRoughness: 0.25,
          clippingPlanes: clippingPlanes,
          clipShadows: true,
          depthWrite: isOverview || isCrossSection,
        });
      }
    });
  }, [scene, isOverview, isStriatum, isTargeted, isCrossSection, clippingPlanes]);

  return (
    <primitive
      ref={brainRef}
      object={scene}
      scale={[0.017, 0.017, 0.017]}
      position={[0, -0.05, 0.05]}
      rotation={[0, 0, 0]}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Subcortical Thalamic Nuclear Bed (Anatomical Landmark for Basal Ganglia)    */
/* -------------------------------------------------------------------------- */
function AnatomicalThalamus({ focused }: { focused: AnatomyFocus }) {
  const isBasalActive = focused === 'striatum' || focused === 'caudate' || focused === 'putamen';

  const thalamusGeo = useMemo(() => {
    const geo = new THREE.SphereGeometry(0.32, 28, 28);
    geo.scale(1.0, 0.85, 1.4); // Egg-shaped thalamic nuclear complex
    return geo;
  }, []);

  return (
    <group position={[0, 0.22, -0.05]}>
      {/* Left Thalamus */}
      <mesh position={[-0.32, 0, 0]} rotation={[0.1, 0.15, -0.05]} geometry={thalamusGeo}>
        <meshPhysicalMaterial
          color="#657b75"
          roughness={0.52}
          transparent
          opacity={isBasalActive ? 0.65 : 0.35}
        />
      </mesh>
      {/* Right Thalamus */}
      <mesh position={[0.32, 0, 0]} rotation={[0.1, -0.15, 0.05]} geometry={thalamusGeo}>
        <meshPhysicalMaterial
          color="#657b75"
          roughness={0.52}
          transparent
          opacity={isBasalActive ? 0.65 : 0.35}
        />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* Caudate Nucleus (Organic C-Shaped Caput, Corpus & Cauda)                   */
/* -------------------------------------------------------------------------- */
function AnatomicalCaudate({
  side,
  active,
  onClick,
}: {
  side: 'left' | 'right';
  active: boolean;
  onClick?: () => void;
}) {
  const sign = side === 'left' ? -1 : 1;
  const meshRef = useRef<THREE.Mesh>(null);

  // Stereotactic C-curve scaled to sit inside the authentic ventricles
  const curve = useMemo(() => {
    const points = [
      new THREE.Vector3(sign * 0.28, 0.38, 0.55), // Caput (Anterior head)
      new THREE.Vector3(sign * 0.42, 0.62, 0.22), // Genu / Superior arch
      new THREE.Vector3(sign * 0.48, 0.45, -0.28), // Corpus descending
      new THREE.Vector3(sign * 0.42, 0.12, -0.55), // Cauda (inferior tail)
    ];
    return new THREE.CatmullRomCurve3(points);
  }, [sign]);

  const geometry = useMemo(() => {
    return new THREE.TubeGeometry(curve, 48, 0.13, 20, false);
  }, [curve]);

  useFrame((state) => {
    if (active && meshRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 3.5) * 0.05;
      meshRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <group onClick={(e) => { e.stopPropagation(); onClick?.(); }}>
      <mesh ref={meshRef} geometry={geometry}>
        <meshStandardMaterial
          color={active ? '#FF5722' : '#C45239'}
          emissive={active ? '#FF5722' : '#8A2B14'}
          emissiveIntensity={active ? 1.75 : 0.7}
          roughness={0.22}
          metalness={0.15}
        />
      </mesh>
      {/* Soft volumetric dopaminergic glow */}
      {active && (
        <mesh geometry={geometry}>
          <meshBasicMaterial
            color="#FFA726"
            transparent
            opacity={0.3}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* Putamen (Lentiform Nucleus: Lateral Biconvex Structure)                    */
/* -------------------------------------------------------------------------- */
function AnatomicalPutamen({
  side,
  active,
  onClick,
}: {
  side: 'left' | 'right';
  active: boolean;
  onClick?: () => void;
}) {
  const sign = side === 'left' ? -1 : 1;
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(0.32, 32, 32);
    geo.scale(1.2, 0.92, 1.6); // Biconvex anatomical lens
    return geo;
  }, []);

  useFrame((state) => {
    if (active && meshRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 3.5 + 0.5) * 0.05;
      meshRef.current.scale.set(1.2 * pulse, 0.92 * pulse, 1.6 * pulse);
    }
  });

  return (
    <group
      position={[sign * 0.54, 0.18, 0.12]}
      rotation={[0.12, -sign * 0.22, 0.14]}
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
    >
      <mesh ref={meshRef} geometry={geometry}>
        <meshStandardMaterial
          color={active ? '#FF3D00' : '#B8452D'}
          emissive={active ? '#FF3D00' : '#732111'}
          emissiveIntensity={active ? 1.85 : 0.65}
          roughness={0.2}
          metalness={0.18}
        />
      </mesh>
      {/* Soft striatal dopaminergic aura */}
      {active && (
        <mesh geometry={geometry}>
          <meshBasicMaterial
            color="#FF7043"
            transparent
            opacity={0.34}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* Substantia Nigra Pars Compacta (Dopamine Origin in Upper Midbrain)        */
/* -------------------------------------------------------------------------- */
function AnatomicalSubstantiaNigra({ focused }: { focused: AnatomyFocus }) {
  const isTargeted = focused !== 'overview';
  const meshGeo = useMemo(() => {
    const geo = new THREE.CylinderGeometry(0.06, 0.04, 0.22, 16);
    geo.rotateZ(Math.PI / 3);
    return geo;
  }, []);

  return (
    <group position={[0, -0.12, -0.08]}>
      {/* Left Substantia Nigra */}
      <mesh position={[-0.18, 0, 0]} geometry={meshGeo}>
        <meshPhysicalMaterial
          color="#38A892"
          emissive="#38A892"
          emissiveIntensity={isTargeted ? 1.6 : 0.6}
          roughness={0.4}
        />
      </mesh>
      {/* Right Substantia Nigra */}
      <mesh position={[0.18, 0, 0]} geometry={meshGeo}>
        <meshPhysicalMaterial
          color="#38A892"
          emissive="#38A892"
          emissiveIntensity={isTargeted ? 1.6 : 0.6}
          roughness={0.4}
        />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* Nigrostriatal Dopaminergic Pathways & Animated Action Potentials          */
/* -------------------------------------------------------------------------- */
function NigrostriatalPathway({ active }: { active: boolean }) {
  const pulseRef1 = useRef<THREE.Mesh>(null);
  const pulseRef2 = useRef<THREE.Mesh>(null);
  const pulseRef3 = useRef<THREE.Mesh>(null);
  const pulseRef4 = useRef<THREE.Mesh>(null);

  // Left & right curves from Substantia Nigra up into Caudate and Putamen
  const curves = useMemo(() => {
    const c1 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.18, -0.12, -0.08),
      new THREE.Vector3(-0.22, 0.12, 0.18),
      new THREE.Vector3(-0.28, 0.38, 0.55),
    ]);
    const c2 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.18, -0.12, -0.08),
      new THREE.Vector3(-0.35, 0.1, 0.12),
      new THREE.Vector3(-0.56, 0.32, 0.28),
    ]);
    const c3 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.18, -0.12, -0.08),
      new THREE.Vector3(0.22, 0.12, 0.18),
      new THREE.Vector3(0.28, 0.38, 0.55),
    ]);
    const c4 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.18, -0.12, -0.08),
      new THREE.Vector3(0.35, 0.1, 0.12),
      new THREE.Vector3(0.56, 0.32, 0.28),
    ]);

    return {
      c1, c2, c3, c4,
      pts1: c1.getPoints(36),
      pts2: c2.getPoints(36),
      pts3: c3.getPoints(36),
      pts4: c4.getPoints(36),
    };
  }, []);

  useFrame(({ clock }) => {
    if (!active) return;
    const t = clock.getElapsedTime() * 0.75;
    const p1 = (t % 1);
    const p2 = ((t + 0.35) % 1);
    const p3 = ((t + 0.5) % 1);
    const p4 = ((t + 0.85) % 1);

    if (pulseRef1.current) {
      pulseRef1.current.position.copy(curves.c1.getPoint(p1));
    }
    if (pulseRef2.current) {
      pulseRef2.current.position.copy(curves.c2.getPoint(p2));
    }
    if (pulseRef3.current) {
      pulseRef3.current.position.copy(curves.c3.getPoint(p3));
    }
    if (pulseRef4.current) {
      pulseRef4.current.position.copy(curves.c4.getPoint(p4));
    }
  });

  const lineGeo1 = useMemo(() => new THREE.BufferGeometry().setFromPoints(curves.pts1), [curves]);
  const lineGeo2 = useMemo(() => new THREE.BufferGeometry().setFromPoints(curves.pts2), [curves]);
  const lineGeo3 = useMemo(() => new THREE.BufferGeometry().setFromPoints(curves.pts3), [curves]);
  const lineGeo4 = useMemo(() => new THREE.BufferGeometry().setFromPoints(curves.pts4), [curves]);

  if (!active) return null;

  return (
    <group>
      {/* Nigrostriatal Axonal Projection Fiber Lines */}
      <primitive object={new THREE.Line(lineGeo1, new THREE.LineBasicMaterial({ color: '#38A892', transparent: true, opacity: 0.65 }))} />
      <primitive object={new THREE.Line(lineGeo2, new THREE.LineBasicMaterial({ color: '#FF7043', transparent: true, opacity: 0.7 }))} />
      <primitive object={new THREE.Line(lineGeo3, new THREE.LineBasicMaterial({ color: '#38A892', transparent: true, opacity: 0.65 }))} />
      <primitive object={new THREE.Line(lineGeo4, new THREE.LineBasicMaterial({ color: '#FF7043', transparent: true, opacity: 0.7 }))} />

      {/* Traveling Dopaminergic Action Potential Beads */}
      <mesh ref={pulseRef1}>
        <sphereGeometry args={[0.03, 12, 12]} />
        <meshBasicMaterial color="#55E6CC" />
      </mesh>
      <mesh ref={pulseRef2}>
        <sphereGeometry args={[0.034, 12, 12]} />
        <meshBasicMaterial color="#FF9E80" />
      </mesh>
      <mesh ref={pulseRef3}>
        <sphereGeometry args={[0.03, 12, 12]} />
        <meshBasicMaterial color="#55E6CC" />
      </mesh>
      <mesh ref={pulseRef4}>
        <sphereGeometry args={[0.034, 12, 12]} />
        <meshBasicMaterial color="#FF9E80" />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* Deep Brain Stimulation (DBS) Subthalamic Quadripolar Lead & 130 Hz Wave   */
/* -------------------------------------------------------------------------- */
function DBSElectrodeStimulator({ active }: { active: boolean }) {
  const waveRef1 = useRef<THREE.Mesh>(null);
  const waveRef2 = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!active) return;
    const t = clock.getElapsedTime() * 3.4;
    const s1 = 1 + (t % 1.5) * 1.8;
    const s2 = 1 + ((t + 0.75) % 1.5) * 1.8;
    const op1 = Math.max(0, 0.7 - ((t % 1.5) / 1.5) * 0.7);
    const op2 = Math.max(0, 0.7 - (((t + 0.75) % 1.5) / 1.5) * 0.7);

    if (waveRef1.current) {
      waveRef1.current.scale.set(s1, s1, s1);
      (waveRef1.current.material as THREE.MeshBasicMaterial).opacity = op1;
    }
    if (waveRef2.current) {
      waveRef2.current.scale.set(s2, s2, s2);
      (waveRef2.current.material as THREE.MeshBasicMaterial).opacity = op2;
    }
  });

  if (!active) return null;

  return (
    <group position={[0.22, 0.08, -0.02]} rotation={[0.15, 0, 0.18]}>
      {/* Stereotaxic Lead Shaft (Platinum-Iridium) */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.014, 0.014, 1.3, 16]} />
        <meshStandardMaterial color="#94A3B8" metalness={0.9} roughness={0.15} />
      </mesh>

      {/* 4 Cylindrical Micro-Electrode Contacts (0, 1, 2, 3) */}
      {[0, 0.06, 0.12, 0.18].map((yOffset, idx) => (
        <mesh key={idx} position={[0, yOffset, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 0.035, 16]} />
          <meshStandardMaterial
            color="#E2E8F0"
            metalness={0.95}
            roughness={0.1}
            emissive="#55E6CC"
            emissiveIntensity={0.9}
          />
        </mesh>
      ))}

      {/* 130 Hz High-Frequency Electrical Pulse Field */}
      <mesh ref={waveRef1} position={[0, 0.06, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial
          color="#55E6CC"
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={waveRef2} position={[0, 0.06, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial
          color="#38A892"
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* Orthogonal Imaging Slice Plane Guide Overlay                               */
/* -------------------------------------------------------------------------- */
function SlicePlaneOverlay({ mode, visible }: { mode: SliceMode; visible: boolean }) {
  if (!visible) return null;

  const { position, rotation } = useMemo(() => {
    if (mode === 'axial') {
      return { position: [0, 0.22, 0] as [number, number, number], rotation: [-Math.PI / 2, 0, 0] as [number, number, number] };
    }
    if (mode === 'coronal') {
      return { position: [0, 0.15, 0.15] as [number, number, number], rotation: [0, 0, 0] as [number, number, number] };
    }
    return { position: [0.05, 0.15, 0] as [number, number, number], rotation: [0, Math.PI / 2, 0] as [number, number, number] };
  }, [mode]);

  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <planeGeometry args={[3.8, 3.8]} />
        <meshBasicMaterial
          color="#38A892"
          transparent
          opacity={0.14}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.PlaneGeometry(3.8, 3.8)]} />
        <lineBasicMaterial color="#55E6CC" transparent opacity={0.65} />
      </lineSegments>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* Responsive Camera Rig Controller with Portrait / Mobile Viewport Tuning   */
/* -------------------------------------------------------------------------- */
function CameraRigController({
  focus,
  progress = 0,
}: {
  focus: AnatomyFocus;
  progress: number;
}) {
  const { camera, size } = useThree();

  useFrame((_, delta) => {
    // Dynamic responsive zoom compensation for portrait viewports (mobile phones)
    // Three.js vertical FOV cuts off sides on portrait aspect ratios (aspect < 1)
    const aspect = size.width / Math.max(size.height, 1);
    const zoomComp = aspect < 1.0 ? Math.min(1.45, 1.05 / Math.max(0.65, aspect)) : 1.0;

    let targetPos = new THREE.Vector3(2.5 * zoomComp, 1.4 * zoomComp, 4.4 * zoomComp);
    let targetLook = new THREE.Vector3(0, 0.05, 0);

    if (focus === 'striatum') {
      targetPos = new THREE.Vector3(1.8 * zoomComp, 1.1 * zoomComp, 2.5 * zoomComp);
      targetLook = new THREE.Vector3(0.2, 0.15, 0.1);
    } else if (focus === 'caudate') {
      targetPos = new THREE.Vector3(1.4 * zoomComp, 0.9 * zoomComp, 1.8 * zoomComp);
      targetLook = new THREE.Vector3(0.3, 0.3, 0.2);
    } else if (focus === 'putamen') {
      targetPos = new THREE.Vector3(1.9 * zoomComp, 0.7 * zoomComp, 1.6 * zoomComp);
      targetLook = new THREE.Vector3(0.55, 0.15, 0.1);
    } else if (focus === 'cross-section') {
      targetPos = new THREE.Vector3(2.6 * zoomComp, 1.8 * zoomComp, 3.2 * zoomComp);
      targetLook = new THREE.Vector3(0, 0.1, 0);
    } else {
      // Elevated 3/4 anatomical perspective framing the WHOLE brain centered
      const yaw = 0.52 + Math.sin(progress * Math.PI) * 0.45;
      const pitch = (1.35 + Math.cos(progress * Math.PI * 1.5) * 0.25) * zoomComp;
      const dist = 5.2 * zoomComp;
      targetPos = new THREE.Vector3(
        Math.sin(yaw) * dist,
        pitch,
        Math.cos(yaw) * dist
      );
      targetLook = new THREE.Vector3(0, 0.05, 0);
    }

    camera.position.lerp(targetPos, Math.min(1, delta * 3.6));
    camera.lookAt(targetLook);
  });

  return null;
}

/* -------------------------------------------------------------------------- */
/* Main 3D Brain Scene Component — ParkiSight AI Authentic Mesh Explorer      */
/* -------------------------------------------------------------------------- */
export default function RealBrainScene({
  progress = 0,
  missing = false,
  sliceMode = 'axial',
  labelsOn = true,
  active = true,
  focus = 'overview',
  onSelectAnatomy,
  onScrollToImaging,
}: BrainSceneProps) {
  const [hasWebGL, setHasWebGL] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [viewMode, setViewMode] = useState<'3d' | 'atlas'>('3d');
  // Text box dossier is hidden by default per user request, toggled via button
  const [showDossier, setShowDossier] = useState(false);
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  const [dbsActive, setDbsActive] = useState(false);
  const [reticleCoords, setReticleCoords] = useState<{
    x: number;
    y: number;
    mniX: string;
    mniY: string;
    mniZ: string;
  } | null>(null);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const normX = (x / rect.width) * 2 - 1;
    const normY = -(y / rect.height) * 2 + 1;

    setReticleCoords({
      x,
      y,
      mniX: (normX * 42).toFixed(1),
      mniY: (normY * 48 + 10).toFixed(1),
      mniZ: ((normX + normY) * 18 + 8).toFixed(1),
    });
  };

  useEffect(() => {
    const current = (document.documentElement.getAttribute('data-theme') as 'dark' | 'light') || 'dark';
    setThemeMode(current);

    const onThemeChange = (e: CustomEvent<'dark' | 'light'>) => {
      if (e.detail) setThemeMode(e.detail);
    };
    window.addEventListener('themechange', onThemeChange as EventListener);
    return () => window.removeEventListener('themechange', onThemeChange as EventListener);
  }, []);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      setHasWebGL(Boolean(gl));
    } catch {
      setHasWebGL(false);
    }

    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(query.matches);
    const updateMotion = () => setReducedMotion(query.matches);
    query.addEventListener('change', updateMotion);
    return () => query.removeEventListener('change', updateMotion);
  }, []);

  // When user actively focuses a specific structure, contextually open the dossier
  useEffect(() => {
    if (focus !== 'overview') {
      setShowDossier(true);
    }
  }, [focus]);

  const isCrossSection = focus === 'cross-section';
  const isInternalActive = focus !== 'overview';

  return (
    <div
      className="canvas-wrapper"
      style={{ width: '100%', height: '100%', position: 'relative' }}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setReticleCoords(null)}
    >
      {/* Precision Stereotaxic MNI Floating Reticle */}
      {viewMode === '3d' && reticleCoords && (
        <div
          className="mni-reticle-hud"
          style={{
            transform: `translate3d(${reticleCoords.x + 12}px, ${reticleCoords.y + 12}px, 0)`,
          }}
        >
          <div className="reticle-readout">
            <span className="reticle-coords">
              X:{reticleCoords.mniX} Y:{reticleCoords.mniY} Z:{reticleCoords.mniZ}
            </span>
            <span className="reticle-tag">MNI mm</span>
          </div>
        </div>
      )}

      {/* Top Left: Dossier Toggle Pill Button */}
      {viewMode === '3d' && labelsOn && (
        <div className="top-left-pills-row">
          <button
            type="button"
            className={`dossier-toggle-pill ${showDossier ? 'is-active' : ''}`}
            onClick={() => setShowDossier(!showDossier)}
            title={showDossier ? 'Hide anatomical details' : 'Show anatomical details & MNI coordinates'}
          >
            <Info size={12} />
            <span>{showDossier ? 'HIDE DOSSIER' : 'ANATOMICAL DOSSIER'}</span>
          </button>
          <button
            type="button"
            className={`dbs-toggle-pill ${dbsActive ? 'is-active' : ''}`}
            onClick={() => {
              const next = !dbsActive;
              setDbsActive(next);
              if (next && focus === 'overview') {
                onSelectAnatomy?.('striatum');
              }
            }}
            title={dbsActive ? 'Deactivate DBS Neurostimulation' : 'Engage 130 Hz Subthalamic DBS Lead Simulation'}
          >
            <Zap size={11} className={dbsActive ? 'pulse-zap' : ''} />
            <span>{dbsActive ? '130 Hz DBS ACTIVE' : 'SIMULATE DBS'}</span>
          </button>
        </div>
      )}

      {/* Top Right: View Mode Switcher (3D Orbit vs Medical Atlas) */}
      <div className="brain-view-mode-pill">
        <button
          type="button"
          className={`view-mode-btn ${viewMode === '3d' ? 'active' : ''}`}
          onClick={() => setViewMode('3d')}
          title="Interactive 3D WebGL anatomical reconstruction"
        >
          <Layers size={11} /> 3D Orbit
        </button>
        <button
          type="button"
          className={`view-mode-btn ${viewMode === 'atlas' ? 'active' : ''}`}
          onClick={() => setViewMode('atlas')}
          title="Authentic Wikimedia Commons medical anatomical scan (Brain AS.stl)"
        >
          <Scan size={11} /> Medical Atlas (STL)
        </button>
      </div>

      {/* Signature Interaction Callout: "Explore the Striatum" (Only in Overview mode) */}
      {viewMode === '3d' && focus === 'overview' && (
        <button
          type="button"
          className="explore-striatum-trigger"
          onClick={() => {
            onSelectAnatomy?.('striatum');
            setShowDossier(true);
          }}
          title="Zoom inside the brain to reveal the basal ganglia"
        >
          <Sparkles size={12} className="spin-slow" />
          <span>EXPLORE THE STRIATUM (BASAL GANGLIA)</span>
          <span className="pill-arrow">→</span>
        </button>
      )}

      {/* Floating 2D HUD Card for Stereotaxic ROI (Hidden by default, shown on click) */}
      {showDossier && labelsOn && (
        <div className={`roi-floating-hud ${focus !== 'overview' ? 'is-focused' : ''}`}>
          {focus === 'overview' && (
            <>
              <div className="roi-hud-header">
                <span className="roi-badge overview">NIH 3D MNI ANATOMICAL MESH</span>
                <div className="roi-header-actions">
                  <span className="roi-mni">215,899 Vertices</span>
                  <button
                    type="button"
                    className="roi-close-btn"
                    onClick={() => setShowDossier(false)}
                    aria-label="Close dossier"
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>
              <div className="roi-hud-title">Authentic Cerebral Cortex & Deep Striatum</div>
              <div className="roi-hud-desc">
                Genuine anatomical human brain surface mesh derived from CT/MRI volumetric segmentation. Displays physiological gyri, sulci, and lobes.
              </div>
              <div className="roi-hud-meta">
                <span>Left Drag: Orbit</span>
                <span>Scroll: Zoom</span>
              </div>
            </>
          )}

          {focus === 'striatum' && (
            <>
              <div className="roi-hud-header">
                <span className="roi-badge striatum">DEEP BASAL GANGLIA</span>
                <div className="roi-header-actions">
                  <span className="roi-mni">Striatal Subcortex</span>
                  <button
                    type="button"
                    className="roi-close-btn"
                    onClick={() => setShowDossier(false)}
                    aria-label="Close dossier"
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>
              <div className="roi-hud-title">The Striatum (Caudate & Putamen)</div>
              <div className="roi-hud-desc">
                Cortex rendered translucent. The striatum serves as the critical entry gate for dopaminergic projections from the substantia nigra pars compacta.
              </div>
              <div className="roi-hud-meta">
                <span className="roi-highlight-green">Bilateral Architecture</span>
                <span className="roi-highlight-danger">PD Degeneration Focus</span>
              </div>
            </>
          )}

          {focus === 'caudate' && (
            <>
              <div className="roi-hud-header">
                <span className="roi-badge caudate">STEREOTAXIC ROI</span>
                <div className="roi-header-actions">
                  <span className="roi-mni">MNI (±14, +10, +8) mm</span>
                  <button
                    type="button"
                    className="roi-close-btn"
                    onClick={() => setShowDossier(false)}
                    aria-label="Close dossier"
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>
              <div className="roi-hud-title">Caput, Corpus & Cauda Nuclei Caudati</div>
              <div className="roi-hud-desc">
                Arched C-shaped subcortical structure bordering the lateral ventricles. Coordinates associative frontostriatal circuits and habit planning.
              </div>
              <div className="roi-hud-meta">
                <span>Volume: ~3,240 mm³</span>
                <span className="roi-highlight-green">Baseline SBR: 2.48 (Preserved)</span>
              </div>
            </>
          )}

          {focus === 'putamen' && (
            <>
              <div className="roi-hud-header">
                <span className="roi-badge putamen">PRIMARY PD DEFICIT ROI</span>
                <div className="roi-header-actions">
                  <span className="roi-mni">MNI (±26, +2, +1) mm</span>
                  <button
                    type="button"
                    className="roi-close-btn"
                    onClick={() => setShowDossier(false)}
                    aria-label="Close dossier"
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>
              <div className="roi-hud-title">Putamen (Lentiform Nucleus)</div>
              <div className="roi-hud-desc">
                Lateral lentiform nucleus. Primary site of presynaptic nigrostriatal dopaminergic denervation in early-stage Parkinson&apos;s disease.
              </div>
              <div className="roi-hud-meta">
                <span>Volume: ~4,120 mm³</span>
                <span className="roi-highlight-danger">Contralateral SBR: 1.42 (Severe Loss)</span>
              </div>
            </>
          )}

          {focus === 'cross-section' && (
            <>
              <div className="roi-hud-header">
                <span className="roi-badge cross-section">ANATOMICAL CUTAWAY</span>
                <div className="roi-header-actions">
                  <span className="roi-mni">{sliceMode.toUpperCase()} PLANE</span>
                  <button
                    type="button"
                    className="roi-close-btn"
                    onClick={() => setShowDossier(false)}
                    aria-label="Close dossier"
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>
              <div className="roi-hud-title">Radiological Cross-Section</div>
              <div className="roi-hud-desc">
                Hardware-accelerated cutting plane slicing through cerebral cortex to expose deep ventricular spaces and basal ganglia nuclear boundaries.
              </div>
              <div className="roi-hud-meta">
                <span>Plane: {sliceMode.toUpperCase()}</span>
                <span>Switch plane below (AX/CO/SA)</span>
              </div>
            </>
          )}

          {/* Quick DaTSCAN SPECT Transition Button */}
          {onScrollToImaging && (
            <button
              type="button"
              className="roi-datscan-link-btn"
              onClick={onScrollToImaging}
              title="Jump to Scene 02 for empirical DaTSCAN SPECT analysis"
            >
              <span>Correlate with DaTSCAN SPECT</span>
              <ArrowDown size={11} />
            </button>
          )}
        </div>
      )}

      {/* Render Mode: 3D Three.js Scene */}
      {viewMode === '3d' && hasWebGL && !reducedMotion ? (
        <Canvas
          camera={{ position: [2.5, 1.4, 4.4], fov: 40 }}
          dpr={[1, 1.75]}
          gl={{
            antialias: true,
            alpha: true,
            localClippingEnabled: true, // Enable hardware clipping planes for cross-section cutaways
            powerPreference: 'high-performance',
          }}
        >
          <color attach="background" args={[themeMode === 'light' ? '#ece8e0' : '#0c1214']} />
          <ambientLight intensity={themeMode === 'light' ? 0.85 : 0.62} />
          <hemisphereLight intensity={themeMode === 'light' ? 0.85 : 0.7} color={themeMode === 'light' ? '#ffffff' : '#c2e6dc'} groundColor={themeMode === 'light' ? '#ded8cc' : '#0d1b1a'} />
          <directionalLight position={[6, 8, 5]} intensity={themeMode === 'light' ? 1.6 : 1.35} color={themeMode === 'light' ? '#ffffff' : '#eaf6f2'} />
          <pointLight position={[-5, -3, -4]} intensity={0.8} color="#2a5a54" />
          <spotLight
            position={[0, 5, 2]}
            intensity={focus !== 'overview' ? 2.8 : 1.4}
            angle={0.45}
            penumbra={0.8}
            color="#ff7f50"
          />

          <CameraRigController focus={focus} progress={progress} />

          <Suspense fallback={null}>
            <group position={[0, 0, 0]}>
              {/* Authentic NIH 3D Anatomical Human Brain Mesh Model */}
              <AuthenticAnatomicalBrain
                focused={focus}
                sliceMode={sliceMode}
                isCrossSection={isCrossSection}
              />

              {/* Subcortical Thalamic Nuclear Complex — Only revealed when exploring deep anatomy */}
              {isInternalActive && <AnatomicalThalamus focused={focus} />}

              {/* Substantia Nigra (Dopamine Factory) — Only revealed when exploring deep anatomy */}
              {isInternalActive && <AnatomicalSubstantiaNigra focused={focus} />}

              {/* Nigrostriatal Action Potential Fiber Pulses — Only revealed when exploring deep anatomy */}
              {isInternalActive && <NigrostriatalPathway active={isInternalActive} />}

              {/* Deep Brain Stimulation (DBS) Subthalamic Neurostimulation Lead */}
              <DBSElectrodeStimulator active={dbsActive} />

              {/* Bilateral Striatum (Caudate & Putamen) — Only revealed when exploring deep anatomy */}
              {isInternalActive && (
                <>
                  <AnatomicalCaudate
                    side="left"
                    active={focus === 'striatum' || focus === 'caudate'}
                    onClick={() => onSelectAnatomy?.('caudate')}
                  />
                  <AnatomicalCaudate
                    side="right"
                    active={focus === 'striatum' || focus === 'caudate'}
                    onClick={() => onSelectAnatomy?.('caudate')}
                  />
                  <AnatomicalPutamen
                    side="left"
                    active={focus === 'striatum' || focus === 'putamen'}
                    onClick={() => onSelectAnatomy?.('putamen')}
                  />
                  <AnatomicalPutamen
                    side="right"
                    active={focus === 'striatum' || focus === 'putamen'}
                    onClick={() => onSelectAnatomy?.('putamen')}
                  />
                </>
              )}

              {/* Orthogonal Slice Plane Guide */}
              <SlicePlaneOverlay mode={sliceMode} visible={isCrossSection} />
            </group>
          </Suspense>

          <OrbitControls
            enableZoom={true}
            enablePan={false}
            rotateSpeed={0.45}
            zoomSpeed={0.65}
            minDistance={2.2}
            maxDistance={8.0}
            target={[0, 0.05, 0]}
            maxPolarAngle={Math.PI / 1.7}
            minPolarAngle={Math.PI / 3.4}
            touches={{
              ONE: THREE.TOUCH.ROTATE,
              TWO: THREE.TOUCH.DOLLY_PAN,
            }}
          />
        </Canvas>
      ) : (
        /* Render Mode: Authentic Medical Scan Atlas (Wikimedia Commons Brain AS.stl) */
        <div className="real-brain-scene fallback-mode" data-active={active} data-slice={sliceMode} aria-label="Authentic Anatomical Brain Model (AgnieszkaStarostecka, CC BY 4.0)">
          <div className="real-brain-halo" />
          <div className="real-brain-image-wrap">
            <img
              className="real-brain-image"
              src="/images/human-brain-anatomical.png"
              alt="Authentic anatomical human brain render (CC BY 4.0, Wikimedia Commons)"
              draggable={false}
            />
            {/* Interactive striatal glowing hotspots on real scan */}
            <i
              className={`striatal-highlight highlight-left ${focus === 'caudate' ? 'focus-caudate' : ''} ${focus === 'putamen' ? 'focus-putamen' : ''}`}
            />
            <i
              className={`striatal-highlight highlight-right ${focus === 'caudate' ? 'focus-caudate' : ''} ${focus === 'putamen' ? 'focus-putamen' : ''}`}
            />
          </div>

          <div className="atlas-attribution-badge">
            <Info size={11} /> Authentic scan: Wikimedia Commons (Brain AS.stl, CC BY 4.0)
          </div>
        </div>
      )}
    </div>
  );
}
