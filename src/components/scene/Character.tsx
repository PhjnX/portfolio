"use client";

import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/**
 * A clay-style cartoon of the site owner (curly black hair, round glasses, black hoodie),
 * built from primitives so it needs no model file. Local +z is the direction it faces and
 * the origin is the hips.
 *
 * `motion.desk` goes from 0 (standing bust) to 1 (seated and typing) and is driven by the
 * scene's transition, so the pose changes in step with the camera move.
 */

/** `waveAt` is the clock time a wave started (negative = none). */
export type CharacterMotion = { desk: number; turn: number; waveAt: number };

const WAVE_SECONDS = 2.2;

/** 0..1 envelope for a wave: quick lift, hold, ease down. */
function waveAmount(t: number, start: number) {
  const k = t - start;
  if (start < 0 || k < 0 || k > WAVE_SECONDS) return 0;
  const up = THREE.MathUtils.smoothstep(k, 0, 0.3);
  const down = 1 - THREE.MathUtils.smoothstep(k, WAVE_SECONDS - 0.45, WAVE_SECONDS);
  return up * down;
}

const SKIN = "#f0b18c";
const SKIN_SHADE = "#d98f6a";
const HAIR = "#191310";
const HOODIE = "#1e1d26";
const HOODIE_TRIM = "#2c2a36";
const PANTS = "#2f2e3b";
const SHOE = "#f4f4f7";

/* ---------- Shared materials ---------- */

function useMaterials() {
  return useMemo(
    () => ({
      skin: new THREE.MeshPhysicalMaterial({
        color: SKIN,
        roughness: 0.48,
        sheen: 0.6,
        sheenColor: new THREE.Color("#ffd8c4"),
        sheenRoughness: 0.5,
        clearcoat: 0.08,
      }),
      skinShade: new THREE.MeshPhysicalMaterial({ color: SKIN_SHADE, roughness: 0.55, sheen: 0.4 }),
      hair: new THREE.MeshPhysicalMaterial({
        color: HAIR,
        roughness: 0.55,
        sheen: 0.8,
        sheenColor: new THREE.Color("#5a4a6e"),
        sheenRoughness: 0.4,
      }),
      hoodie: new THREE.MeshPhysicalMaterial({
        color: HOODIE,
        roughness: 0.9,
        sheen: 1,
        sheenColor: new THREE.Color("#5b5675"),
        sheenRoughness: 0.7,
      }),
      trim: new THREE.MeshPhysicalMaterial({ color: HOODIE_TRIM, roughness: 0.9, sheen: 0.8, sheenColor: new THREE.Color("#5b5675") }),
      pants: new THREE.MeshPhysicalMaterial({ color: PANTS, roughness: 0.85, sheen: 0.6, sheenColor: new THREE.Color("#55516b") }),
      shoe: new THREE.MeshPhysicalMaterial({ color: SHOE, roughness: 0.45, clearcoat: 0.3 }),
      sole: new THREE.MeshStandardMaterial({ color: "#c9c9d2", roughness: 0.6 }),
      frame: new THREE.MeshPhysicalMaterial({ color: "#0c0c10", roughness: 0.25, clearcoat: 1 }),
      lens: new THREE.MeshPhysicalMaterial({ color: "#dfe6ff", transparent: true, opacity: 0.1, roughness: 0, clearcoat: 1 }),
      white: new THREE.MeshPhysicalMaterial({ color: "#ffffff", roughness: 0.2, clearcoat: 0.6 }),
      iris: new THREE.MeshPhysicalMaterial({ color: "#3a2417", roughness: 0.2, clearcoat: 1 }),
      pupil: new THREE.MeshBasicMaterial({ color: "#0a0706" }),
      mouth: new THREE.MeshStandardMaterial({ color: "#5c1f24", roughness: 0.6 }),
      tongue: new THREE.MeshStandardMaterial({ color: "#d4626a", roughness: 0.6 }),
      blush: new THREE.MeshBasicMaterial({ color: "#ff7b7b", transparent: true, opacity: 0.18, depthWrite: false }),
      string: new THREE.MeshStandardMaterial({ color: "#ececf2", roughness: 0.5 }),
    }),
    [],
  );
}

type Mats = ReturnType<typeof useMaterials>;

/* ---------- Hair: one lumpy shell plus a few loose curls ---------- */

const HEAD_R = 0.5;

/** Cheap 3D "noise" from layered sines; enough to make the hair surface look curly. */
function curl(x: number, y: number, z: number) {
  return (
    Math.sin(x * 11 + y * 3) * Math.sin(y * 12 - z * 2) * Math.sin(z * 10 + x * 4) * 0.55 +
    Math.sin(x * 23 + z * 7) * Math.sin(y * 21) * 0.25 +
    Math.sin((x + y + z) * 17) * 0.2
  );
}

/** How much hair a direction on the head gets: none on the face, full on top and at the back. */
function hairMask(d: THREE.Vector3) {
  const front = THREE.MathUtils.smoothstep(d.z, 0.05, 0.6);
  // The hairline sits higher at the front than at the sides and the back.
  const line = THREE.MathUtils.lerp(-0.25, 0.56, front);
  const sideburn = Math.abs(d.x) > 0.75 && d.z > -0.1 ? 0.25 : 0;
  return THREE.MathUtils.smoothstep(d.y, line - 0.08 - sideburn, line + 0.1);
}

function useHairGeometry() {
  return useMemo(() => {
    // Merge the icosahedron's duplicated vertices so normals are smooth, not faceted.
    const ico = new THREE.IcosahedronGeometry(1, 24);
    ico.deleteAttribute("uv");
    ico.deleteAttribute("normal");
    const geo = mergeVertices(ico);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const d = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      d.fromBufferAttribute(pos, i).normalize();
      const m = hairMask(d);
      // Fuller on top, like a curly crop; tucked inside the head where there is no hair.
      const volume = 0.06 + Math.max(0, d.y) * 0.1;
      const r = HEAD_R - 0.03 + m * (volume + 0.05 + curl(d.x, d.y, d.z) * 0.045);
      pos.setXYZ(i, d.x * r, d.y * r, d.z * r);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);
}

/** Small curls along the hairline and on top so the silhouette is not too smooth. */
function useCurlPositions() {
  return useMemo(() => {
    const out: { p: THREE.Vector3; s: number }[] = [];
    const n = 260;
    const d = new THREE.Vector3();
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const a = i * 2.399963;
      d.set(Math.cos(a) * r, y, Math.sin(a) * r);
      const m = hairMask(d);
      if (m < 0.6) continue;
      const j = Math.sin(i * 12.9898) * 0.5 + 0.5;
      // Keep only some, so the curls read as clumps rather than a pattern.
      if (j < 0.62) continue;
      const volume = 0.06 + Math.max(0, d.y) * 0.1;
      // Sunk halfway into the shell so they read as bumps of the same mass.
      const radius = HEAD_R - 0.03 + volume + 0.03 + curl(d.x, d.y, d.z) * 0.045;
      out.push({ p: d.clone().multiplyScalar(radius), s: 0.045 + j * 0.03 });
    }
    return out;
  }, []);
}

function Hair({ mats }: { mats: Mats }) {
  const geo = useHairGeometry();
  const curls = useCurlPositions();
  const inst = useMemo(() => {
    const mesh = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 12, 10), mats.hair, curls.length);
    const m = new THREE.Matrix4();
    curls.forEach((c, i) => {
      m.compose(c.p, new THREE.Quaternion(), new THREE.Vector3(c.s, c.s, c.s));
      mesh.setMatrixAt(i, m);
    });
    return mesh;
  }, [curls, mats.hair]);
  return (
    <group position={[0, 0.03, -0.01]} scale={[1.02, 1, 1]}>
      <mesh geometry={geo} material={mats.hair} />
      <primitive object={inst} />
    </group>
  );
}

/* ---------- Face ---------- */

/** Eyebrow drawn as a short curved tube. */
function Brow({ side, mats }: { side: 1 | -1; mats: Mats }) {
  const geo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.08, -0.008, 0),
      new THREE.Vector3(0, 0.018, 0.01),
      new THREE.Vector3(0.08, 0.004, 0),
    ]);
    return new THREE.TubeGeometry(curve, 16, 0.02, 8, false);
  }, []);
  return <mesh geometry={geo} material={mats.hair} position={[side * 0.17, 0.235, 0.455]} rotation={[0, side * 0.25, side * -0.08]} />;
}

function Eye({ side, mats, pupil, lid }: {
  side: 1 | -1;
  mats: Mats;
  pupil: React.RefObject<THREE.Group | null>;
  lid: React.RefObject<THREE.Mesh | null>;
}) {
  // Upper half of a sphere, slightly bigger than the eye, that rotates down to blink.
  const lidGeo = useMemo(() => new THREE.SphereGeometry(0.098, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), []);
  return (
    <group position={[side * 0.17, 0.07, 0.4]} rotation={[0, side * 0.22, 0]}>
      <mesh material={mats.white} scale={[1, 1.08, 0.7]}>
        <sphereGeometry args={[0.092, 24, 18]} />
      </mesh>
      <group ref={pupil}>
        <mesh material={mats.iris} position={[0, 0, 0.058]} scale={[1, 1.05, 0.45]}>
          <sphereGeometry args={[0.052, 20, 14]} />
        </mesh>
        <mesh material={mats.pupil} position={[0, 0, 0.078]} scale={[1, 1, 0.3]}>
          <sphereGeometry args={[0.027, 14, 10]} />
        </mesh>
        <mesh material={mats.white} position={[0.016, 0.02, 0.085]}>
          <sphereGeometry args={[0.011, 8, 6]} />
        </mesh>
      </group>
      {/* Pivot at the eye centre: -0.9 rad tucks it up and back (open), 1.45 covers the eye (closed). */}
      <mesh ref={lid} geometry={lidGeo} material={mats.skin} rotation={[-0.9, 0, 0]} scale={[1.04, 1.12, 0.78]} />
    </group>
  );
}

function Glasses({ mats }: { mats: Mats }) {
  return (
    <group position={[0, 0.07, 0.5]}>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.17, 0, 0]} rotation={[0, s * 0.2, 0]}>
          <mesh material={mats.frame} scale={[1, 0.92, 1]}>
            <torusGeometry args={[0.125, 0.018, 12, 48]} />
          </mesh>
          <mesh material={mats.lens} position={[0, 0, -0.004]} scale={[1, 0.92, 1]}>
            <circleGeometry args={[0.12, 32]} />
          </mesh>
        </group>
      ))}
      <mesh material={mats.frame} position={[0, 0.02, -0.01]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.013, 0.013, 0.1, 8]} />
      </mesh>
      {[-1, 1].map((s) => (
        // Arms run from the outer edge of each rim back to the ear, along the side of the head.
        <mesh key={`t${s}`} material={mats.frame} position={[s * 0.38, 0.02, -0.285]} rotation={[0, -s * 0.33, 0]}>
          <boxGeometry args={[0.018, 0.022, 0.56]} />
        </mesh>
      ))}
    </group>
  );
}

function Mouth({ mats }: { mats: Mats }) {
  // An open, friendly grin: dark half-disc with a row of teeth and a hint of tongue.
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-0.12, 0);
    s.quadraticCurveTo(0, 0.025, 0.12, 0);
    s.quadraticCurveTo(0.1, -0.12, 0, -0.125);
    s.quadraticCurveTo(-0.1, -0.12, -0.12, 0);
    return new THREE.ExtrudeGeometry(s, { depth: 0.02, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.01, bevelSegments: 4 });
  }, []);
  const teeth = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-0.1, -0.004);
    s.quadraticCurveTo(0, 0.02, 0.1, -0.004);
    s.lineTo(0.085, -0.04);
    s.quadraticCurveTo(0, -0.03, -0.085, -0.04);
    s.lineTo(-0.1, -0.004);
    return new THREE.ShapeGeometry(s);
  }, []);
  return (
    <group position={[0, -0.13, 0.455]} rotation={[-0.18, 0, 0]}>
      <mesh geometry={shape} material={mats.mouth} />
      <mesh geometry={teeth} material={mats.white} position={[0, 0, 0.034]} />
      <mesh material={mats.tongue} position={[0, -0.085, 0.022]} scale={[1, 0.45, 0.4]}>
        <sphereGeometry args={[0.06, 16, 10]} />
      </mesh>
    </group>
  );
}

function Head({ mats, headRef, pupils, lids }: {
  mats: Mats;
  headRef: React.RefObject<THREE.Group | null>;
  pupils: [React.RefObject<THREE.Group | null>, React.RefObject<THREE.Group | null>];
  lids: [React.RefObject<THREE.Mesh | null>, React.RefObject<THREE.Mesh | null>];
}) {
  return (
    <group ref={headRef} position={[0, 1.08, 0]}>
      <group position={[0, 0.46, 0]}>
        {/* Skull and a slightly fuller jaw */}
        <mesh material={mats.skin} scale={[1, 1.02, 0.95]}>
          <sphereGeometry args={[HEAD_R, 64, 48]} />
        </mesh>
        <mesh material={mats.skin} position={[0, -0.14, 0.05]} scale={[0.86, 0.62, 0.82]}>
          <sphereGeometry args={[HEAD_R, 48, 32]} />
        </mesh>
        {/* Ears */}
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 0.49, 0.0, -0.02]} rotation={[0, s * 0.35, 0]}>
            <mesh material={mats.skin} scale={[0.45, 1, 0.75]}>
              <sphereGeometry args={[0.11, 20, 16]} />
            </mesh>
            <mesh material={mats.skinShade} position={[s * 0.02, 0, 0.02]} scale={[0.25, 0.65, 0.45]}>
              <sphereGeometry args={[0.11, 16, 12]} />
            </mesh>
          </group>
        ))}
        <Hair mats={mats} />
        <Eye side={-1} mats={mats} pupil={pupils[0]} lid={lids[0]} />
        <Eye side={1} mats={mats} pupil={pupils[1]} lid={lids[1]} />
        <Glasses mats={mats} />
        <Brow side={-1} mats={mats} />
        <Brow side={1} mats={mats} />
        {/* Nose */}
        <mesh material={mats.skin} position={[0, -0.03, 0.5]} scale={[1.1, 0.9, 0.85]}>
          <sphereGeometry args={[0.065, 20, 16]} />
        </mesh>
        {/* Blush */}
        {[-1, 1].map((s) => (
          <mesh key={`b${s}`} material={mats.blush} position={[s * 0.27, -0.09, 0.4]} rotation={[0, s * 0.6, 0]}>
            <circleGeometry args={[0.07, 24]} />
          </mesh>
        ))}
        <Mouth mats={mats} />
      </group>
    </group>
  );
}

/* ---------- Body ---------- */

function useTorsoGeometry() {
  return useMemo(() => {
    // Profile of the hoodie from waist to collar, spun around the y axis.
    const pts = [
      [0.0, -0.08],
      [0.4, -0.06],
      [0.44, 0.1],
      [0.46, 0.38],
      [0.45, 0.62],
      [0.4, 0.8],
      [0.28, 0.93],
      [0.14, 0.98],
      [0.0, 0.99],
    ].map(([r, y]) => new THREE.Vector2(r, y));
    const geo = new THREE.LatheGeometry(new THREE.SplineCurve(pts).getPoints(40), 48);
    geo.computeVertexNormals();
    return geo;
  }, []);
}

function Torso({ mats }: { mats: Mats }) {
  const geo = useTorsoGeometry();
  return (
    <group>
      <mesh geometry={geo} material={mats.hoodie} scale={[1.28, 1, 0.82]} />
      {/* Waistband */}
      <mesh material={mats.trim} position={[0, -0.02, 0]} scale={[1.28, 1, 0.82]}>
        <cylinderGeometry args={[0.415, 0.41, 0.1, 48]} />
      </mesh>
      {/* Kangaroo pocket */}
      <RoundedBox args={[0.5, 0.2, 0.06]} radius={0.03} position={[0, 0.2, 0.355]} rotation={[-0.08, 0, 0]} material={mats.trim} />
      {/* Hood resting behind the neck */}
      <mesh material={mats.trim} position={[0, 0.95, -0.06]} rotation={[Math.PI / 2 - 0.25, 0, 0]} scale={[1.15, 1, 0.9]}>
        <torusGeometry args={[0.2, 0.085, 16, 40]} />
      </mesh>
      {/* Drawstrings with tips */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.08, 0.76, 0.33]} rotation={[0.18, 0, s * 0.05]}>
          <mesh material={mats.string}>
            <cylinderGeometry args={[0.012, 0.012, 0.24, 8]} />
          </mesh>
          <mesh material={mats.string} position={[0, -0.13, 0]}>
            <cylinderGeometry args={[0.018, 0.016, 0.04, 8]} />
          </mesh>
        </group>
      ))}
      {/* Neck */}
      <mesh material={mats.skin} position={[0, 1.04, 0]}>
        <cylinderGeometry args={[0.13, 0.15, 0.2, 24]} />
      </mesh>
      {/* Hips */}
      <mesh material={mats.pants} position={[0, -0.05, 0]} scale={[1.05, 0.5, 0.8]}>
        <sphereGeometry args={[0.4, 24, 16]} />
      </mesh>
    </group>
  );
}

type Limb = React.RefObject<THREE.Group | null>;

function Arm({ side, shoulder, elbow, mats }: { side: 1 | -1; shoulder: Limb; elbow: Limb; mats: Mats }) {
  return (
    <group ref={shoulder} position={[side * 0.5, 0.86, 0]}>
      <mesh material={mats.hoodie} position={[-side * 0.04, -0.07, 0]}>
        <sphereGeometry args={[0.145, 20, 16]} />
      </mesh>
      <mesh material={mats.hoodie} position={[0, -0.27, 0]}>
        <capsuleGeometry args={[0.14, 0.3, 8, 20]} />
      </mesh>
      <group ref={elbow} position={[0, -0.54, 0]}>
        <mesh material={mats.hoodie} position={[0, -0.2, 0]}>
          <capsuleGeometry args={[0.125, 0.26, 8, 20]} />
        </mesh>
        <mesh material={mats.trim} position={[0, -0.39, 0]}>
          <cylinderGeometry args={[0.112, 0.112, 0.07, 20]} />
        </mesh>
        {/* Mitten hand with a thumb */}
        <group position={[0, -0.5, 0.01]}>
          <mesh material={mats.skin} scale={[0.95, 1.15, 0.75]}>
            <sphereGeometry args={[0.1, 20, 16]} />
          </mesh>
          <mesh material={mats.skin} position={[-side * 0.075, 0.02, 0.04]} rotation={[0, 0, side * 0.6]} scale={[0.6, 1, 0.6]}>
            <capsuleGeometry args={[0.032, 0.06, 6, 10]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

function Leg({ side, hip, knee, mats }: { side: 1 | -1; hip: Limb; knee: Limb; mats: Mats }) {
  return (
    <group ref={hip} position={[side * 0.2, -0.02, 0]}>
      <mesh material={mats.pants} position={[0, -0.3, 0]}>
        <capsuleGeometry args={[0.17, 0.38, 8, 20]} />
      </mesh>
      <group ref={knee} position={[0, -0.6, 0]}>
        <mesh material={mats.pants} position={[0, -0.26, 0]}>
          <capsuleGeometry args={[0.15, 0.36, 8, 20]} />
        </mesh>
        <group position={[0, -0.56, 0.08]}>
          <RoundedBox args={[0.26, 0.16, 0.42]} radius={0.075} smoothness={5} material={mats.shoe} />
          <RoundedBox args={[0.27, 0.05, 0.43]} radius={0.02} position={[0, -0.07, 0]} material={mats.sole} />
        </group>
      </group>
    </group>
  );
}

/* ---------- Character ---------- */

const lerp = THREE.MathUtils.lerp;

export function Character({ motion }: { motion: React.RefObject<CharacterMotion> }) {
  const mats = useMaterials();
  const head = useRef<THREE.Group>(null);
  const pupilL = useRef<THREE.Group>(null);
  const pupilR = useRef<THREE.Group>(null);
  const lidL = useRef<THREE.Mesh>(null);
  const lidR = useRef<THREE.Mesh>(null);
  const torso = useRef<THREE.Group>(null);
  const shoulderL = useRef<THREE.Group>(null);
  const shoulderR = useRef<THREE.Group>(null);
  const elbowL = useRef<THREE.Group>(null);
  const elbowR = useRef<THREE.Group>(null);
  const hipL = useRef<THREE.Group>(null);
  const hipR = useRef<THREE.Group>(null);
  const kneeL = useRef<THREE.Group>(null);
  const kneeR = useRef<THREE.Group>(null);
  const blinkAt = useRef(2);
  const look = useRef(new THREE.Vector2());

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const k = motion.current?.desk ?? 0;
    const turn = motion.current?.turn ?? 0;

    // Smooth the pointer once, then use it everywhere so head and eyes move together.
    easing.damp2(look.current, state.pointer, 0.18, dt);
    const { x, y } = look.current;

    if (head.current) {
      const idleYaw = Math.sin(t * 0.4) * 0.04;
      head.current.rotation.set(
        lerp(-y * 0.32, 0.2 - y * 0.12, k) + Math.sin(t * 0.7) * 0.015,
        lerp(-turn * 0.7 + x * 0.55, x * 0.25, k) + idleYaw,
        lerp(-x * 0.06, 0, k),
      );
    }
    for (const p of [pupilL, pupilR]) {
      if (p.current) p.current.rotation.set(-y * 0.3, x * 0.4, 0);
    }

    // Blink every few seconds; sometimes twice.
    if (t > blinkAt.current + 0.16) blinkAt.current = t + 2.2 + Math.random() * 2.8;
    const b = t - blinkAt.current;
    const closed = b > 0 && b < 0.16 ? Math.sin((b / 0.16) * Math.PI) : 0;
    for (const lid of [lidL, lidR]) {
      if (lid.current) lid.current.rotation.x = lerp(-0.9, 1.45, closed);
    }

    if (torso.current) {
      torso.current.scale.set(1 + Math.sin(t * 1.6) * 0.006, 1 + Math.sin(t * 1.6) * 0.012, 1);
    }

    // Arms: relaxed at the sides, or forward on the keyboard with a light typing motion.
    const type = (phase: number) => Math.sin(t * 12 + phase) * 0.06 * k;
    if (shoulderL.current) shoulderL.current.rotation.set(lerp(0.05, -1.12, k), 0, lerp(-0.16, -0.04, k));
    // Waving: the right arm swings up and out, the forearm rocks side to side.
    const w = waveAmount(t, motion.current?.waveAt ?? -1);
    if (shoulderR.current)
      shoulderR.current.rotation.set(lerp(lerp(0.05, -1.12, k), -0.25, w), 0, lerp(lerp(0.16, 0.04, k), 2.55, w));
    if (elbowL.current) elbowL.current.rotation.set(lerp(-0.15, -0.45, k) + type(0), 0, 0);
    if (elbowR.current)
      elbowR.current.rotation.set(lerp(lerp(-0.15, -0.45, k) + type(1.7), -0.15, w), 0, w * (0.45 + Math.sin(t * 11) * 0.45));

    // Legs: standing, or seated with thighs forward and shins down.
    for (const [hip, knee] of [
      [hipL, kneeL],
      [hipR, kneeR],
    ] as const) {
      if (hip.current) hip.current.rotation.x = lerp(0, -Math.PI / 2, k);
      if (knee.current) knee.current.rotation.x = lerp(0, Math.PI / 2, k);
    }
  });

  return (
    <group>
      <group ref={torso}>
        <Torso mats={mats} />
      </group>
      <Head mats={mats} headRef={head} pupils={[pupilL, pupilR]} lids={[lidL, lidR]} />
      <Arm side={-1} shoulder={shoulderL} elbow={elbowL} mats={mats} />
      <Arm side={1} shoulder={shoulderR} elbow={elbowR} mats={mats} />
      <Leg side={-1} hip={hipL} knee={kneeL} mats={mats} />
      <Leg side={1} hip={hipR} knee={kneeR} mats={mats} />
    </group>
  );
}
