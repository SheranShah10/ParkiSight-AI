'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Scan, Layers, Info, Sparkles, Scissors, ArrowDown, Eye, RotateCcw } from 'lucide-react';
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

/* -------------------------------------------------------------------------- */
/* High-Fidelity Anatomical Cerebral Cortex with Authentic Sulcal Folding     */
/* -------------------------------------------------------------------------- */
function AnatomicalHemisphere({
  side,
  focused,
  sliceMode,
  isCrossSection,
}: {
  side: 'left' | 'right';
  focused: AnatomyFocus;
  sliceMode: SliceMode;
  isCrossSection: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const sign = side === 'left' ? -1 : 1;

  // Generate stereotaxically proportioned cerebral cortex with multi-octave gyral folding
  const geometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(1.68, 64, 64);
    const pos = geo.attributes.position;
    const v = new THREE.Vector3();

    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);

      // MNI152 Stereotactic anatomical proportions
      v.z *= 1.28; // Anteroposterior elongation (Frontal to Occipital)
      v.y *= 1.06; // Cranial vault dome
      v.x *= 0.85; // Lateral compression

      // Frontal lobe expansion (anterior-superior volume)
      if (v.z > 0.35 && v.y > -0.25) {
        v.x *= 1.06;
        v.y *= 1.03;
      }
      // Temporal lobe forward pole (anterior-inferior lateral)
      if (v.z > 0.05 && v.y < -0.32 && Math.abs(v.x) > 0.38) {
        v.x *= 1.12;
        v.z *= 1.05;
      }
      // Occipital lobe posterior tapering
      if (v.z < -0.65) {
        v.x *= 0.85;
        v.y *= 0.92;
      }

      // Sylvian (lateral) fissure groove
      const isSylvian = Math.abs(v.y + 0.16) < 0.28 && v.z > -0.32 && v.z < 0.58 && Math.abs(v.x) > 0.55;
      const sylvianDepression = isSylvian ? -0.095 : 0;

      // Multi-scale cortical gyri and sulci convolutions
      const primarySulci = Math.sin(v.x * 5.2 + v.y * 3.8) * Math.cos(v.z * 4.4) * 0.078;
      const secondaryGyri = Math.sin(v.y * 9.6 + v.z * 7.8) * Math.cos(v.x * 8.2) * 0.035;
      const tertiaryWrinkles = Math.cos(v.x * 14.5 + v.z * 11.2 + v.y * 10.4) * 0.018;
      const displacement = primarySulci + secondaryGyri + tertiaryWrinkles + sylvianDepression;

      // Longitudinal interhemispheric fissure separation
      if (Math.abs(v.x) < 0.36) {
        v.x = Math.sign(v.x) * Math.max(0.14, Math.abs(v.x) - 0.08);
      }

      v.addScaledVector(v.clone().normalize(), displacement);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  // Hardware clipping planes for orthogonal cross-section cutaways
  const clippingPlanes = useMemo(() => {
    if (!isCrossSection) return [];
    if (sliceMode === 'axial') {
      return [new THREE.Plane(new THREE.Vector3(0, -1, 0), 0.26)];
    }
    if (sliceMode === 'coronal') {
      return [new THREE.Plane(new THREE.Vector3(0, 0, -1), 0.18)];
    }
    return [new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0.05)];
  }, [isCrossSection, sliceMode]);

  const isOverview = focused === 'overview';
  const isStriatum = focused === 'striatum';
  const isTargeted = focused === 'caudate' || focused === 'putamen';

  return (
    <group position={[sign * 0.9, 0.16, 0]}>
      <mesh ref={meshRef} geometry={geometry}>
        <meshPhysicalMaterial
          color={isOverview ? '#94aaa1' : isCrossSection ? '#a8bbb3' : '#4f6660'}
          roughness={isOverview ? 0.44 : 0.32}
          metalness={0.06}
          transmission={isOverview ? 0.45 : isStriatum ? 0.88 : isTargeted ? 0.92 : 0.2}
          thickness={isOverview ? 0.85 : 0.3}
          transparent
          opacity={isOverview ? 0.88 : isStriatum ? 0.28 : isTargeted ? 0.22 : 0.9}
          clearcoat={0.35}
          clearcoatRoughness={0.2}
          clippingPlanes={clippingPlanes}
          clipShadows
          depthWrite={isOverview || isCrossSection}
        />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* Subcortical Thalamic Nuclear Bed (Anatomical Landmark for Basal Ganglia)    */
/* -------------------------------------------------------------------------- */
function AnatomicalThalamus({ focused }: { focused: AnatomyFocus }) {
  const isOverview = focused === 'overview';
  const isBasalActive = focused === 'striatum' || focused === 'caudate' || focused === 'putamen';

  const thalamusGeo = useMemo(() => {
    const geo = new THREE.SphereGeometry(0.38, 28, 28);
    geo.scale(1.0, 0.85, 1.45); // Egg-shaped thalamic nuclear complex
    return geo;
  }, []);

  return (
    <group position={[0, 0.28, -0.05]}>
      {/* Left Thalamus */}
      <mesh position={[-0.38, 0, 0]} rotation={[0.1, 0.15, -0.05]} geometry={thalamusGeo}>
        <meshPhysicalMaterial
          color="#657b75"
          roughness={0.52}
          transparent
          opacity={isOverview ? 0.5 : isBasalActive ? 0.65 : 0.4}
        />
      </mesh>
      {/* Right Thalamus */}
      <mesh position={[0.38, 0, 0]} rotation={[0.1, -0.15, 0.05]} geometry={thalamusGeo}>
        <meshPhysicalMaterial
          color="#657b75"
          roughness={0.52}
          transparent
          opacity={isOverview ? 0.5 : isBasalActive ? 0.65 : 0.4}
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
    const geo = new THREE.SphereGeometry(0.85, 42, 42);
    const pos = geo.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      v.x *= 1.45; // Transverse cerebellar width
      v.y *= 0.68; // Flattened
      v.z *= 0.86; // Anteroposterior
      const folia = Math.sin(v.y * 24.0) * 0.024;
      v.addScaledVector(v.clone().normalize(), folia);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <group position={[0, -1.02, -1.08]}>
      {/* Cerebellar Hemispheres */}
      <mesh geometry={cerebellumGeo}>
        <meshPhysicalMaterial
          color="#5a6f69"
          roughness={0.58}
          metalness={0.06}
          transmission={isOverview ? 0.45 : 0.85}
          transparent
          opacity={isOverview ? 0.78 : 0.28}
        />
      </mesh>
      {/* Pons & Medulla Oblongata */}
      <mesh position={[0, -0.42, 0.45]} rotation={[0.22, 0, 0]}>
        <cylinderGeometry args={[0.34, 0.24, 1.35, 32]} />
        <meshPhysicalMaterial
          color="#4c5e59"
          roughness={0.52}
          metalness={0.05}
          transparent
          opacity={isOverview ? 0.75 : 0.25}
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

  // Stereotactic C-curve bordering the lateral ventricle anterior horn & body
  const curve = useMemo(() => {
    const points = [
      new THREE.Vector3(sign * 0.36, 0.44, 0.78), // Caput (Anterior head)
      new THREE.Vector3(sign * 0.52, 0.74, 0.32), // Genu / Superior arch
      new THREE.Vector3(sign * 0.62, 0.54, -0.38), // Corpus descending
      new THREE.Vector3(sign * 0.52, 0.12, -0.76), // Cauda (inferior tail)
    ];
    return new THREE.CatmullRomCurve3(points);
  }, [sign]);

  const geometry = useMemo(() => {
    return new THREE.TubeGeometry(curve, 54, 0.165, 24, false);
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
    const geo = new THREE.SphereGeometry(0.41, 38, 38);
    geo.scale(1.24, 0.96, 1.74); // Biconvex anatomical lens
    return geo;
  }, []);

  useFrame((state) => {
    if (active && meshRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 3.5 + 0.5) * 0.05;
      meshRef.current.scale.set(1.24 * pulse, 0.96 * pulse, 1.74 * pulse);
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
/* Orthogonal Imaging Slice Plane Guides                                      */
/* -------------------------------------------------------------------------- */
function SlicePlaneOverlay({ mode, visible }: { mode: SliceMode; visible: boolean }) {
  if (!visible) return null;

  const { position, rotation } = useMemo(() => {
    if (mode === 'axial') {
      return { position: [0, 0.26, 0] as [number, number, number], rotation: [-Math.PI / 2, 0, 0] as [number, number, number] };
    }
    if (mode === 'coronal') {
      return { position: [0, 0.2, 0.18] as [number, number, number], rotation: [0, 0, 0] as [number, number, number] };
    }
    return { position: [0.05, 0.2, 0] as [number, number, number], rotation: [0, Math.PI / 2, 0] as [number, number, number] };
  }, [mode]);

  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <planeGeometry args={[4.4, 4.4]} />
        <meshBasicMaterial
          color="#38A892"
          transparent
          opacity={0.14}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.PlaneGeometry(4.4, 4.4)]} />
        <lineBasicMaterial color="#55E6CC" transparent opacity={0.65} />
      </lineSegments>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* Unified Camera Rig Controller with Smooth Cinematic Interpolation          */
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

    if (focus === 'striatum') {
      // Zoom toward deep basal ganglia center
      targetPos = new THREE.Vector3(2.3, 1.3, 3.1);
      targetLook = new THREE.Vector3(0.4, 0.32, 0.2);
    } else if (focus === 'caudate') {
      // Direct focus on right caudate nucleus
      targetPos = new THREE.Vector3(1.8, 1.25, 2.3);
      targetLook = new THREE.Vector3(0.42, 0.44, 0.35);
    } else if (focus === 'putamen') {
      // Direct focus on right putamen lentiform nucleus
      targetPos = new THREE.Vector3(2.4, 0.95, 2.0);
      targetLook = new THREE.Vector3(0.82, 0.22, 0.16);
    } else if (focus === 'cross-section') {
      // Orthogonal perspective for sliced view
      targetPos = new THREE.Vector3(3.2, 2.4, 3.8);
      targetLook = new THREE.Vector3(0, 0.15, 0);
    } else {
      // Smooth scroll-linked orbital angle in Overview mode
      const yaw = Math.sin(progress * Math.PI) * 0.75;
      const pitch = 1.35 + Math.cos(progress * Math.PI * 1.5) * 0.38;
      targetPos = new THREE.Vector3(
        Math.cos(yaw) * 4.3 + Math.sin(progress * 2) * 0.35,
        pitch,
        Math.sin(yaw) * 4.3 + 1.2
      );
    }

    camera.position.lerp(targetPos, Math.min(1, delta * 3.6));
    camera.lookAt(targetLook);
  });

  return null;
}

/* -------------------------------------------------------------------------- */
/* Main 3D Brain Scene Component — ParkiSight AI 4.0                          */
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

  const isCrossSection = focus === 'cross-section';

  return (
    <div className="canvas-wrapper" style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* View Mode Switcher Pill (3D Interactive vs Authentic Medical Atlas) */}
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
          onClick={() => onSelectAnatomy?.('striatum')}
          title="Zoom inside the brain to reveal the basal ganglia"
        >
          <Sparkles size={12} className="spin-slow" />
          <span>EXPLORE THE STRIATUM (BASAL GANGLIA)</span>
          <span className="pill-arrow">→</span>
        </button>
      )}

      {/* Floating 2D HUD Card for Stereotaxic ROI (Always Crisp, Zero 3D Text Distortion) */}
      {labelsOn && (
        <div className={`roi-floating-hud ${focus !== 'overview' ? 'is-focused' : ''}`}>
          {focus === 'overview' && (
            <>
              <div className="roi-hud-header">
                <span className="roi-badge overview">MNI152 STEREOTAXY</span>
                <span className="roi-mni">1.0 mm Isotropic</span>
              </div>
              <div className="roi-hud-title">Cerebral Cortex & Striatum</div>
              <div className="roi-hud-desc">
                Whole-brain volumetric reconstruction displaying frontal, temporal, parietal, and occipital lobes with deep basal ganglia integration.
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
                <span className="roi-mni">Striatal Subcortex</span>
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
                <span className="roi-mni">MNI (±14, +10, +8) mm</span>
              </div>
              <div className="roi-hud-title">Caput, Corpus & Cauda Nuclei Caudati</div>
              <div className="roi-hud-desc">
                Arched C-shaped subcortical structure bordering the lateral ventricles. Coordinates associative frontostriatal circuits and habit planning.
              </div>
              <div className="roi-hud-meta">
                <span>Volume: ~3,240 mm³</span>
                <span className="roi-highlight-green">Baseline SBR: 2.48 (Relative Preservation)</span>
              </div>
            </>
          )}

          {focus === 'putamen' && (
            <>
              <div className="roi-hud-header">
                <span className="roi-badge putamen">PRIMARY PD DEFICIT ROI</span>
                <span className="roi-mni">MNI (±26, +2, +1) mm</span>
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
                <span className="roi-mni">{sliceMode.toUpperCase()} PLANE</span>
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
          camera={{ position: [3.4, 1.8, 4.8], fov: 42 }}
          dpr={[1, 1.75]}
          gl={{
            antialias: true,
            alpha: true,
            localClippingEnabled: true, // Enable hardware clipping planes for cross-section cutaways
            powerPreference: 'high-performance',
          }}
        >
          <color attach="background" args={['#0c1214']} />
          <ambientLight intensity={0.58} />
          <hemisphereLight intensity={0.65} color="#c2e6dc" groundColor="#0d1b1a" />
          <directionalLight position={[6, 8, 5]} intensity={1.3} color="#eaf6f2" />
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
              {/* Left & Right Cerebral Hemispheres with Sulcal Gyri Folding */}
              <AnatomicalHemisphere
                side="left"
                focused={focus}
                sliceMode={sliceMode}
                isCrossSection={isCrossSection}
              />
              <AnatomicalHemisphere
                side="right"
                focused={focus}
                sliceMode={sliceMode}
                isCrossSection={isCrossSection}
              />

              {/* Subcortical Thalamic Nuclear Complex */}
              <AnatomicalThalamus focused={focus} />

              {/* Cerebellum & Brainstem */}
              <SubcorticalBrainstemStructures focused={focus} />

              {/* Bilateral Striatum (Caudate & Putamen) */}
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

              {/* Orthogonal Slice Plane Guide */}
              <SlicePlaneOverlay mode={sliceMode} visible={isCrossSection} />
            </group>
          </Suspense>

          <OrbitControls
            enableZoom={true}
            enablePan={false}
            rotateSpeed={0.45}
            zoomSpeed={0.65}
            minDistance={1.8}
            maxDistance={8.5}
            maxPolarAngle={Math.PI / 1.7}
            minPolarAngle={Math.PI / 3.4}
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
