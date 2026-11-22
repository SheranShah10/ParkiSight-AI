'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import type { AnatomyFocus, SliceMode } from '@/lib/types';

type BrainSceneProps = {
  progress?: number;
  missing?: boolean;
  sliceMode?: SliceMode;
  labelsOn?: boolean;
  active?: boolean;
  focus?: AnatomyFocus;
  onSelectAnatomy?: (focus: AnatomyFocus) => void;
};

/* -------------------------------------------------------------------------- */
/* Anatomical Brain Hemisphere Mesh (Left & Right Cortex + Cerebellum)        */
/* -------------------------------------------------------------------------- */
function CerebralCortex({
  side,
  focused,
  sliceMode,
}: {
  side: 'left' | 'right';
  focused: AnatomyFocus;
  sliceMode: SliceMode;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const sign = side === 'left' ? -1 : 1;

  // Generate procedural gyri & sulci surface perturbation
  const geometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(1.65, 48, 48);
    const pos = geo.attributes.position;
    const v = new THREE.Vector3();

    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);

      // Anatomical shaping: elongate antero-posteriorly, flatten inferiorly
      v.z *= 1.28; // Frontal-occipital elongation
      v.y *= 1.05; // Superior dome
      v.x *= 0.88; // Lateral compression

      // Sulcal folds using layered harmonic harmonics
      const fold1 = Math.sin(v.x * 5.2 + v.y * 3.8) * Math.cos(v.z * 4.6) * 0.085;
      const fold2 = Math.sin(v.y * 8.4 + v.z * 7.1) * 0.045;
      const fold3 = Math.cos(v.x * 12.0 + v.z * 9.5) * 0.025;
      const displacement = fold1 + fold2 + fold3;

      // Medial longitudinal fissure separation
      if (Math.abs(v.x) < 0.28) {
        v.x = Math.sign(v.x) * Math.max(0.12, Math.abs(v.x) - 0.08);
      }

      v.addScaledVector(v.clone().normalize(), displacement);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  const cortexOpacity = focused === 'overview' ? 0.72 : 0.28;
  const isTargeted = focused === 'overview';

  return (
    <group position={[sign * 0.88, 0.15, 0]}>
      <mesh ref={meshRef} geometry={geometry}>
        <meshPhysicalMaterial
          color={isTargeted ? '#829a92' : '#3d4b47'}
          roughness={0.62}
          metalness={0.08}
          transmission={0.45}
          thickness={0.8}
          transparent
          opacity={cortexOpacity}
          wireframe={focused !== 'overview'}
          depthWrite={focused === 'overview'}
        />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* Cerebellum & Brainstem Lower Structures                                   */
/* -------------------------------------------------------------------------- */
function LowerBrainStructures({ focused }: { focused: AnatomyFocus }) {
  const cerebellumGeo = useMemo(() => {
    const geo = new THREE.SphereGeometry(0.85, 32, 32);
    const pos = geo.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      v.x *= 1.45;
      v.y *= 0.65;
      v.z *= 0.85;
      const folia = Math.sin(v.y * 18.0) * 0.03;
      v.addScaledVector(v.clone().normalize(), folia);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <group position={[0, -1.05, -1.1]}>
      {/* Cerebellar Hemispheres */}
      <mesh geometry={cerebellumGeo}>
        <meshStandardMaterial
          color="#52635e"
          roughness={0.7}
          transparent
          opacity={focused === 'overview' ? 0.65 : 0.2}
        />
      </mesh>
      {/* Brainstem / Pons / Medulla */}
      <mesh position={[0, -0.45, 0.45]} rotation={[0.25, 0, 0]}>
        <cylinderGeometry args={[0.32, 0.25, 1.3, 24]} />
        <meshStandardMaterial
          color="#42514c"
          roughness={0.65}
          transparent
          opacity={focused === 'overview' ? 0.6 : 0.15}
        />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* Striatal Inner Structures: Caudate Nucleus (C-Shaped Head & Tail)          */
/* -------------------------------------------------------------------------- */
function CaudateNucleus({
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

  // Generate authentic C-shaped arch of the caudate nucleus along lateral ventricle
  const curve = useMemo(() => {
    const points = [
      new THREE.Vector3(sign * 0.42, 0.45, 0.72), // Head (anterior, medial)
      new THREE.Vector3(sign * 0.58, 0.68, 0.25), // Body (superior arch)
      new THREE.Vector3(sign * 0.65, 0.48, -0.45), // Body descending
      new THREE.Vector3(sign * 0.52, 0.05, -0.75), // Tail (posterior-inferior)
    ];
    return new THREE.CatmullRomCurve3(points);
  }, [sign]);

  const geometry = useMemo(() => {
    return new THREE.TubeGeometry(curve, 32, 0.14, 16, false);
  }, [curve]);

  useFrame((state) => {
    if (active && meshRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 3.5) * 0.08;
      meshRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <group onClick={(e) => { e.stopPropagation(); onClick?.(); }}>
      <mesh ref={meshRef} geometry={geometry}>
        <meshStandardMaterial
          color={active ? '#E85D3B' : '#d87042'}
          emissive={active ? '#FF4500' : '#8c3516'}
          emissiveIntensity={active ? 1.6 : 0.6}
          roughness={0.25}
          metalness={0.15}
        />
      </mesh>
      {/* Glow aura */}
      <mesh geometry={geometry}>
        <meshBasicMaterial
          color="#FF6B4A"
          transparent
          opacity={active ? 0.35 : 0.12}
          wireframe
        />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* Striatal Inner Structures: Putamen (Lateral Lentiform Nucleus)             */
/* -------------------------------------------------------------------------- */
function PutamenNucleus({
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
    const geo = new THREE.SphereGeometry(0.38, 24, 24);
    geo.scale(1.15, 0.95, 1.65); // Biconvex lens shape
    return geo;
  }, []);

  useFrame((state) => {
    if (active && meshRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 3.5 + 0.5) * 0.08;
      meshRef.current.scale.set(1.15 * pulse, 0.95 * pulse, 1.65 * pulse);
    }
  });

  return (
    <group
      position={[sign * 0.85, 0.22, 0.15]}
      rotation={[0.1, -sign * 0.2, 0.15]}
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
    >
      <mesh ref={meshRef} geometry={geometry}>
        <meshStandardMaterial
          color={active ? '#E85D3B' : '#c9643b'}
          emissive={active ? '#FF3700' : '#802e12'}
          emissiveIntensity={active ? 1.8 : 0.65}
          roughness={0.22}
          metalness={0.2}
        />
      </mesh>
      {/* Outer dopamine binding volume boundary */}
      <mesh geometry={geometry}>
        <meshBasicMaterial
          color="#FF7A57"
          transparent
          opacity={active ? 0.4 : 0.14}
          wireframe
        />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* Orthogonal Imaging Slice Plane Overlay (Axial / Coronal / Sagittal)         */
/* -------------------------------------------------------------------------- */
function SlicePlanePlane({ mode }: { mode: SliceMode }) {
  const planeRef = useRef<THREE.Mesh>(null);

  const { position, rotation, label } = useMemo(() => {
    if (mode === 'axial') {
      return { position: [0, 0.25, 0] as [number, number, number], rotation: [-Math.PI / 2, 0, 0] as [number, number, number], label: 'AXIAL z=60' };
    }
    if (mode === 'coronal') {
      return { position: [0, 0.2, 0.15] as [number, number, number], rotation: [0, 0, 0] as [number, number, number], label: 'CORONAL y=64' };
    }
    return { position: [0, 0.2, 0] as [number, number, number], rotation: [0, Math.PI / 2, 0] as [number, number, number], label: 'SAGITTAL x=64' };
  }, [mode]);

  return (
    <group position={position} rotation={rotation}>
      <mesh ref={planeRef}>
        <planeGeometry args={[4.4, 4.4]} />
        <meshBasicMaterial
          color="#42D0B6"
          transparent
          opacity={0.16}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      {/* Slice frame */}
      <lineSegments>
        <edgesGeometry args={[new THREE.PlaneGeometry(4.4, 4.4)]} />
        <lineBasicMaterial color="#55E6CC" transparent opacity={0.65} />
      </lineSegments>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* Dopamine Transporter Tracer Particles / Prior Token Particles              */
/* -------------------------------------------------------------------------- */
function StriatalParticles({ missing }: { missing: boolean }) {
  const count = 180;
  const points = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const sign = i % 2 === 0 ? 1 : -1;
      const radius = 0.2 + Math.random() * 0.45;
      const theta = Math.random() * Math.PI * 2;
      const z = (Math.random() - 0.5) * 0.9;
      arr[i * 3] = sign * (0.65 + Math.cos(theta) * radius * 0.7);
      arr[i * 3 + 1] = 0.25 + Math.sin(theta) * radius * 0.7;
      arr[i * 3 + 2] = z + 0.1;
    }
    return arr;
  }, []);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.08;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[points, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={missing ? 0.045 : 0.06}
        color={missing ? '#7a918a' : '#FF6838'}
        transparent
        opacity={missing ? 0.35 : 0.85}
      />
    </points>
  );
}

/* -------------------------------------------------------------------------- */
/* Dynamic Camera Controller (Smooth Camera Lerp & Framing)                   */
/* -------------------------------------------------------------------------- */
function CameraRig({
  focus,
  progress = 0,
}: {
  focus: AnatomyFocus;
  progress: number;
}) {
  const { camera } = useThree();

  useFrame((_, delta) => {
    let targetPos = new THREE.Vector3(3.4, 1.8, 4.8);
    let targetLook = new THREE.Vector3(0, 0, 0);

    if (focus === 'caudate') {
      targetPos = new THREE.Vector3(1.6, 1.4, 2.8);
      targetLook = new THREE.Vector3(0.5, 0.4, 0.3);
    } else if (focus === 'putamen') {
      targetPos = new THREE.Vector3(2.6, 0.8, 2.2);
      targetLook = new THREE.Vector3(0.85, 0.2, 0.15);
    } else {
      // Natural scroll-linked angle
      const yaw = Math.sin(progress * Math.PI) * 0.8;
      const pitch = 1.4 + Math.cos(progress * Math.PI * 1.5) * 0.4;
      targetPos = new THREE.Vector3(
        Math.cos(yaw) * 4.4 + Math.sin(progress * 2) * 0.4,
        pitch,
        Math.sin(yaw) * 4.4 + 1.2
      );
    }

    camera.position.lerp(targetPos, Math.min(1, delta * 3.2));
    camera.lookAt(targetLook);
  });

  return null;
}

/* -------------------------------------------------------------------------- */
/* MAIN 3D BRAIN EXPERIENCE COMPONENT                                         */
/* -------------------------------------------------------------------------- */
export default function RealBrainScene({
  progress = 0,
  missing = false,
  sliceMode = 'axial',
  labelsOn = true,
  active = true,
  focus = 'overview',
  onSelectAnatomy,
}: BrainSceneProps) {
  const [hasWebGL, setHasWebGL] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

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

  // Graceful high-fidelity fallback if WebGL is unavailable or reduced motion is selected
  if (!hasWebGL || reducedMotion) {
    return (
      <div className="real-brain-scene fallback-mode" data-active={active} data-slice={sliceMode} aria-label="3D Anatomical Brain Model (Fallback Render)">
        <div className="real-brain-halo" />
        <div className="real-brain-image-wrap">
          <img
            className="real-brain-image"
            src="/images/human-brain-anatomical.png"
            alt="Anatomical 3D brain preview by AgnieszkaStarostecka (CC BY 4.0)"
            draggable={false}
          />
          <i className="striatal-highlight highlight-left" />
          <i className="striatal-highlight highlight-right" />
        </div>
        {labelsOn && (
          <div className="anatomy-markers">
            <button type="button" onClick={() => onSelectAnatomy?.('caudate')} className={focus === 'caudate' ? 'active' : ''}>
              CAUDATE NUCLEUS
            </button>
            <button type="button" onClick={() => onSelectAnatomy?.('putamen')} className={focus === 'putamen' ? 'active' : ''}>
              PUTAMEN
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="canvas-wrapper" style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas
        camera={{ position: [3.4, 1.8, 4.8], fov: 42 }}
        dpr={[1, 1.75]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        <color attach="background" args={['#0c1214']} />
        <ambientLight intensity={0.55} />
        <hemisphereLight intensity={0.65} color="#b8ded3" groundColor="#0d1b1a" />
        <directionalLight position={[6, 8, 5]} intensity={1.25} color="#eaf6f2" />
        <pointLight position={[-5, -3, -4]} intensity={0.8} color="#2a5a54" />
        <spotLight
          position={[0, 5, 2]}
          intensity={focus !== 'overview' ? 2.5 : 1.2}
          angle={0.45}
          penumbra={0.8}
          color="#ff7f50"
        />

        <CameraRig focus={focus} progress={progress} />

        <Suspense fallback={null}>
          <group position={[0, 0, 0]}>
            {/* Left & Right Cerebral Hemispheres */}
            <CerebralCortex side="left" focused={focus} sliceMode={sliceMode} />
            <CerebralCortex side="right" focused={focus} sliceMode={sliceMode} />

            {/* Cerebellum & Brainstem */}
            <LowerBrainStructures focused={focus} />

            {/* Striatal Structures (Caudate & Putamen) */}
            <CaudateNucleus side="left" active={focus === 'caudate'} onClick={() => onSelectAnatomy?.('caudate')} />
            <CaudateNucleus side="right" active={focus === 'caudate'} onClick={() => onSelectAnatomy?.('caudate')} />
            <PutamenNucleus side="left" active={focus === 'putamen'} onClick={() => onSelectAnatomy?.('putamen')} />
            <PutamenNucleus side="right" active={focus === 'putamen'} onClick={() => onSelectAnatomy?.('putamen')} />

            {/* Slice Plane Visualizer */}
            <SlicePlanePlane mode={sliceMode} />

            {/* Dopamine Transporter Particles */}
            <StriatalParticles missing={missing} />
          </group>
        </Suspense>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          rotateSpeed={0.5}
          maxPolarAngle={Math.PI / 1.7}
          minPolarAngle={Math.PI / 3.4}
        />
      </Canvas>
    </div>
  );
}
