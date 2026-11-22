'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Line, Html } from '@react-three/drei';
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
/* Anatomical Hemisphere Geometry with Lobar Segmentation                     */
/* -------------------------------------------------------------------------- */
function AnatomicalHemisphere({
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

  // Generate stereotaxically proportioned cerebral cortex with lobar landmarks
  const geometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(1.65, 56, 56);
    const pos = geo.attributes.position;
    const v = new THREE.Vector3();

    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);

      // Anatomical proportions based on MNI152 template dimensions
      v.z *= 1.28; // Anteroposterior elongation (Frontal-Occipital)
      v.y *= 1.04; // Superior-inferior dome
      v.x *= 0.88; // Mediolateral compression

      // Lobar sculpting:
      // Frontal lobe expansion (anterior-superior)
      if (v.z > 0.4 && v.y > -0.2) {
        v.x *= 1.04;
        v.y *= 1.02;
      }
      // Temporal lobe anterior pole (anterior-inferior lateral)
      if (v.z > 0.1 && v.y < -0.3 && Math.abs(v.x) > 0.4) {
        v.x *= 1.08;
      }
      // Occipital lobe tapering (posterior)
      if (v.z < -0.7) {
        v.x *= 0.88;
        v.y *= 0.94;
      }

      // Sylvian (lateral) fissure groove
      const isLateralFissure = Math.abs(v.y + 0.15) < 0.25 && v.z > -0.3 && v.z < 0.6 && Math.abs(v.x) > 0.6;
      const fissureDepression = isLateralFissure ? -0.075 : 0;

      // Primary Sulcal patterns (Central, Postcentral, Superior Frontal sulci)
      const sulcus1 = Math.sin(v.x * 5.6 + v.y * 4.2) * Math.cos(v.z * 4.8) * 0.08;
      const sulcus2 = Math.sin(v.y * 9.2 + v.z * 7.4) * 0.038;
      const sulcus3 = Math.cos(v.x * 12.8 + v.z * 10.2) * 0.022;
      const displacement = sulcus1 + sulcus2 + sulcus3 + fissureDepression;

      // Longitudinal interhemispheric fissure separation
      if (Math.abs(v.x) < 0.3) {
        v.x = Math.sign(v.x) * Math.max(0.12, Math.abs(v.x) - 0.07);
      }

      v.addScaledVector(v.clone().normalize(), displacement);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  const isOverview = focused === 'overview';

  return (
    <group position={[sign * 0.88, 0.15, 0]}>
      <mesh ref={meshRef} geometry={geometry}>
        <meshPhysicalMaterial
          color={isOverview ? '#8ea19a' : '#2d3b37'}
          roughness={0.52}
          metalness={0.05}
          transmission={isOverview ? 0.45 : 0.88}
          thickness={isOverview ? 0.85 : 0.2}
          transparent
          opacity={isOverview ? 0.75 : 0.22}
          wireframe={!isOverview}
          depthWrite={isOverview}
        />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* Cerebellum & Brainstem Lower Structures                                    */
/* -------------------------------------------------------------------------- */
function SubcorticalBrainstemStructures({ focused }: { focused: AnatomyFocus }) {
  const isOverview = focused === 'overview';

  const cerebellumGeo = useMemo(() => {
    const geo = new THREE.SphereGeometry(0.85, 36, 36);
    const pos = geo.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      v.x *= 1.48; // Transverse width
      v.y *= 0.65; // Flattened superior-inferiorly
      v.z *= 0.85; // Anteroposterior
      // Horizontal cerebellar folia grooves
      const folia = Math.sin(v.y * 22.0) * 0.028;
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
          color="#52645f"
          roughness={0.68}
          transparent
          opacity={isOverview ? 0.65 : 0.16}
        />
      </mesh>
      {/* Pons & Medulla Oblongata */}
      <mesh position={[0, -0.42, 0.45]} rotation={[0.22, 0, 0]}>
        <cylinderGeometry args={[0.34, 0.24, 1.35, 24]} />
        <meshStandardMaterial
          color="#43524e"
          roughness={0.65}
          transparent
          opacity={isOverview ? 0.6 : 0.14}
        />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* Caudate Nucleus (Caput, Corpus, and Cauda Nuclei Caudati)                  */
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

  // Stereotaxic coordinates along the lateral ventricle
  const curve = useMemo(() => {
    const points = [
      new THREE.Vector3(sign * 0.38, 0.42, 0.78), // Caput (Anterior head)
      new THREE.Vector3(sign * 0.52, 0.72, 0.32), // Genu / Superior arch
      new THREE.Vector3(sign * 0.64, 0.52, -0.42), // Corpus descending
      new THREE.Vector3(sign * 0.54, 0.08, -0.82), // Cauda (inferior tail)
    ];
    return new THREE.CatmullRomCurve3(points);
  }, [sign]);

  const geometry = useMemo(() => {
    return new THREE.TubeGeometry(curve, 36, 0.15, 16, false);
  }, [curve]);

  useFrame((state) => {
    if (active && meshRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 3.5) * 0.07;
      meshRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <group onClick={(e) => { e.stopPropagation(); onClick?.(); }}>
      <mesh ref={meshRef} geometry={geometry}>
        <meshStandardMaterial
          color={active ? '#D85C42' : '#c2583e'}
          emissive={active ? '#D85C42' : '#6e2b1b'}
          emissiveIntensity={active ? 1.5 : 0.55}
          roughness={0.24}
          metalness={0.12}
        />
      </mesh>
      {/* Outer aura wireframe */}
      <mesh geometry={geometry}>
        <meshBasicMaterial
          color="#FF7555"
          transparent
          opacity={active ? 0.42 : 0.12}
          wireframe
        />
      </mesh>

      {/* 3D Callout Annotation if active */}
      {active && side === 'right' && (
        <Html position={[1.1, 0.85, 0.3]} distanceFactor={6} center>
          <div className="r3f-annotation-box">
            <span className="anno-tag">STEREOTAXIC ROI</span>
            <strong>Caput Nuclei Caudati</strong>
            <small>MNI (±14, +10, +8) mm</small>
            <p>Executive habit circuitry & associative loops</p>
          </div>
        </Html>
      )}
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* Putamen (Lateral Lentiform Nucleus)                                        */
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
    const geo = new THREE.SphereGeometry(0.38, 28, 28);
    geo.scale(1.18, 0.94, 1.68); // Biconvex lentiform nucleus
    return geo;
  }, []);

  useFrame((state) => {
    if (active && meshRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 3.5 + 0.5) * 0.07;
      meshRef.current.scale.set(1.18 * pulse, 0.94 * pulse, 1.68 * pulse);
    }
  });

  return (
    <group
      position={[sign * 0.86, 0.24, 0.16]}
      rotation={[0.12, -sign * 0.22, 0.14]}
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
    >
      <mesh ref={meshRef} geometry={geometry}>
        <meshStandardMaterial
          color={active ? '#D85C42' : '#b8523a'}
          emissive={active ? '#D85C42' : '#692617'}
          emissiveIntensity={active ? 1.65 : 0.6}
          roughness={0.22}
          metalness={0.16}
        />
      </mesh>
      {/* Outer DAT binding boundary */}
      <mesh geometry={geometry}>
        <meshBasicMaterial
          color="#FF8366"
          transparent
          opacity={active ? 0.45 : 0.14}
          wireframe
        />
      </mesh>

      {/* 3D Callout Annotation if active */}
      {active && side === 'right' && (
        <Html position={[0.7, 0.4, 0.3]} distanceFactor={6} center>
          <div className="r3f-annotation-box">
            <span className="anno-tag">PRIMARY PD DEFICIT ROI</span>
            <strong>Putamen (Lentiform)</strong>
            <small>MNI (±26, +2, +1) mm</small>
            <p>Primary site of presynaptic DAT loss</p>
          </div>
        </Html>
      )}
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* Orthogonal Imaging Slice Plane Overlay                                     */
/* -------------------------------------------------------------------------- */
function SlicePlaneOverlay({ mode }: { mode: SliceMode }) {
  const { position, rotation, label } = useMemo(() => {
    if (mode === 'axial') {
      return { position: [0, 0.24, 0] as [number, number, number], rotation: [-Math.PI / 2, 0, 0] as [number, number, number], label: 'AXIAL z=60' };
    }
    if (mode === 'coronal') {
      return { position: [0, 0.2, 0.16] as [number, number, number], rotation: [0, 0, 0] as [number, number, number], label: 'CORONAL y=64' };
    }
    return { position: [0, 0.2, 0] as [number, number, number], rotation: [0, Math.PI / 2, 0] as [number, number, number], label: 'SAGITTAL x=64' };
  }, [mode]);

  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <planeGeometry args={[4.5, 4.5]} />
        <meshBasicMaterial
          color="#38A892"
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.PlaneGeometry(4.5, 4.5)]} />
        <lineBasicMaterial color="#55E6CC" transparent opacity={0.6} />
      </lineSegments>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* Dynamic Camera Rig Controller with Smooth Interpolation                    */
/* -------------------------------------------------------------------------- */
function CameraRigController({
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
      targetPos = new THREE.Vector3(1.7, 1.3, 2.7);
      targetLook = new THREE.Vector3(0.5, 0.45, 0.3);
    } else if (focus === 'putamen') {
      targetPos = new THREE.Vector3(2.5, 0.9, 2.3);
      targetLook = new THREE.Vector3(0.85, 0.24, 0.16);
    } else {
      // Natural cinematic scroll-linked angle
      const yaw = Math.sin(progress * Math.PI) * 0.75;
      const pitch = 1.35 + Math.cos(progress * Math.PI * 1.5) * 0.38;
      targetPos = new THREE.Vector3(
        Math.cos(yaw) * 4.3 + Math.sin(progress * 2) * 0.35,
        pitch,
        Math.sin(yaw) * 4.3 + 1.2
      );
    }

    camera.position.lerp(targetPos, Math.min(1, delta * 3.4));
    camera.lookAt(targetLook);
  });

  return null;
}

/* -------------------------------------------------------------------------- */
/* Main 3D Brain Scene Component                                              */
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
        <ambientLight intensity={0.52} />
        <hemisphereLight intensity={0.62} color="#b8ded3" groundColor="#0d1b1a" />
        <directionalLight position={[6, 8, 5]} intensity={1.25} color="#eaf6f2" />
        <pointLight position={[-5, -3, -4]} intensity={0.75} color="#2a5a54" />
        <spotLight
          position={[0, 5, 2]}
          intensity={focus !== 'overview' ? 2.6 : 1.2}
          angle={0.45}
          penumbra={0.8}
          color="#ff7f50"
        />

        <CameraRigController focus={focus} progress={progress} />

        <Suspense fallback={null}>
          <group position={[0, 0, 0]}>
            {/* Left & Right Cerebral Hemispheres */}
            <AnatomicalHemisphere side="left" focused={focus} sliceMode={sliceMode} />
            <AnatomicalHemisphere side="right" focused={focus} sliceMode={sliceMode} />

            {/* Cerebellum & Brainstem */}
            <SubcorticalBrainstemStructures focused={focus} />

            {/* Bilateral Striatum (Caudate & Putamen) */}
            <AnatomicalCaudate side="left" active={focus === 'caudate'} onClick={() => onSelectAnatomy?.('caudate')} />
            <AnatomicalCaudate side="right" active={focus === 'caudate'} onClick={() => onSelectAnatomy?.('caudate')} />
            <AnatomicalPutamen side="left" active={focus === 'putamen'} onClick={() => onSelectAnatomy?.('putamen')} />
            <AnatomicalPutamen side="right" active={focus === 'putamen'} onClick={() => onSelectAnatomy?.('putamen')} />

            {/* Orthogonal Slice Plane */}
            <SlicePlaneOverlay mode={sliceMode} />
          </group>
        </Suspense>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          rotateSpeed={0.45}
          maxPolarAngle={Math.PI / 1.7}
          minPolarAngle={Math.PI / 3.4}
        />
      </Canvas>
    </div>
  );
}
