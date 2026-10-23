"use client";

import { Environment, Lightformer, RoundedBox } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, N8AO } from "@react-three/postprocessing";
import { easing } from "maath";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { Project } from "@/content/projects";
import type { SectionId } from "@/content/site";
import { Character, type CharacterMotion } from "./Character";
import {
  checkoutTexture,
  codeTexture,
  coffeeTexture,
  dashboardTexture,
  logoTexture,
  phoneTexture,
  shadowTexture,
  shopTexture,
} from "./textures";

type Screen = Project["screen"];
type Mode = "bust" | "desk";
type Vec = [number, number, number];

type Layout = {
  /** Where the character's hips sit, how far it is turned, and how big it is. */
  pos: Vec;
  turn: number;
  scale: number;
  mode: Mode;
  monitor: "code" | Screen;
  tiles: boolean;
};

/**
 * One pose per section. In "bust" mode the character is large and its legs are below
 * the frame, so only the head and shoulders show, like the hero of the reference site.
 */
function layoutFor(section: SectionId, screen: Screen): Layout {
  switch (section) {
    case "intro":
      return { pos: [0, -3.55, 0], turn: 0, scale: 2.35, mode: "bust", monitor: "code", tiles: false };
    case "about":
      return { pos: [-3.3, -3.55, 0], turn: 0.4, scale: 2.35, mode: "bust", monitor: "code", tiles: false };
    case "whatido":
      return { pos: [-3.0, -0.75, 0], turn: 1.15, scale: 1.25, mode: "desk", monitor: "code", tiles: false };
    case "experience":
      return { pos: [3.1, -0.85, 0], turn: 2.45, scale: 1.2, mode: "desk", monitor: "dashboard", tiles: false };
    case "work":
      return { pos: [3.1, -0.85, 0], turn: 2.45, scale: 1.2, mode: "desk", monitor: screen, tiles: false };
    case "skills":
      return { pos: [3.6, -3.3, -1], turn: -0.45, scale: 2.0, mode: "bust", monitor: "code", tiles: true };
    case "contact":
      return { pos: [3.1, -3.55, 0], turn: -0.4, scale: 2.35, mode: "bust", monitor: "code", tiles: false };
  }
}

/** On narrow screens the text runs full width, so centre the character and push it back. */
function fit(l: Layout, wide: boolean): Layout {
  if (wide) return l;
  const bust = l.mode === "bust";
  return {
    ...l,
    pos: [0, bust ? -4.2 : 0.4, -3],
    turn: bust ? 0 : 1.0,
    scale: l.scale * 0.7,
  };
}

const MONITOR_PINK = "#d58fc4";
const FURNITURE = "#ececf1";

/** Desk, chair, monitor and phone, in the character's local space (it faces +z). */
function Workspace({
  motion,
  monitor,
  phoneFocus,
}: {
  motion: React.RefObject<CharacterMotion>;
  monitor: THREE.Texture;
  phoneFocus: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  const phone = useRef<THREE.Group>(null);
  const screenMat = useRef<THREE.MeshBasicMaterial>(null);

  // Dim the screen for a moment when its content changes, like a monitor switching input.
  useEffect(() => {
    screenMat.current?.color.setScalar(0.08);
  }, [monitor]);
  const phoneTex = useMemo(() => phoneTexture(), []);
  const shadow = useMemo(() => shadowTexture(), []);

  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    // Grows in during the second half of the move to the desk and leaves early on the way back.
    const k = motion.current?.desk ?? 0;
    const s = Math.max(0.001, THREE.MathUtils.smootherstep(k, 0.35, 0.95));
    g.scale.setScalar(s);
    g.visible = s > 0.01;
    if (screenMat.current) {
      const c = screenMat.current.color;
      c.setScalar(THREE.MathUtils.damp(c.r, 1, 6, dt));
    }
    if (phone.current) {
      const p = phoneFocus ? 1.6 : 1;
      easing.damp3(phone.current.scale, [p, p, p], 0.3, dt);
    }
  });

  const legs = (w: number, d: number, top: number, bottom: number, r = 0.03) =>
    [
      [-w, -d],
      [w, -d],
      [-w, d],
      [w, d],
    ].map(([x, z]) => (
      <mesh key={`${x}${z}`} position={[x, (top + bottom) / 2, z]}>
        <cylinderGeometry args={[r, r, top - bottom, 10]} />
        <meshStandardMaterial color={FURNITURE} roughness={0.4} />
      </mesh>
    ));

  return (
    <group ref={ref} scale={0.001}>
      {/* Floor shadow */}
      <mesh position={[0, -0.79, 0.6]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.6, 3]} />
        <meshBasicMaterial map={shadow} transparent depthWrite={false} />
      </mesh>

      {/* Chair */}
      <RoundedBox args={[0.85, 0.08, 0.8]} radius={0.03} position={[0, -0.24, 0.05]}>
        <meshStandardMaterial color={FURNITURE} roughness={0.4} />
      </RoundedBox>
      <RoundedBox args={[0.85, 0.75, 0.07]} radius={0.03} position={[0, 0.25, -0.38]} rotation={[-0.12, 0, 0]}>
        <meshStandardMaterial color={FURNITURE} roughness={0.4} />
      </RoundedBox>
      {legs(0.34, 0.32, -0.28, -0.79)}

      {/* Desk */}
      <group position={[0, 0, 1.25]}>
        <RoundedBox args={[2.4, 0.06, 1.0]} radius={0.02} position={[0, 0.5, 0]}>
          <meshStandardMaterial color={FURNITURE} roughness={0.35} />
        </RoundedBox>
        {legs(1.1, 0.42, 0.47, -0.79, 0.035)}

        {/* Keyboard and mouse */}
        <RoundedBox args={[0.8, 0.04, 0.26]} radius={0.015} position={[0, 0.55, -0.28]}>
          <meshStandardMaterial color="#d9d9e0" roughness={0.5} />
        </RoundedBox>
        <RoundedBox args={[0.1, 0.04, 0.16]} radius={0.02} position={[0.58, 0.55, -0.26]}>
          <meshStandardMaterial color="#d9d9e0" roughness={0.5} />
        </RoundedBox>

        {/* Monitor, facing the character */}
        <group position={[0, 0.53, 0.25]}>
          <mesh position={[0, 0.18, 0]}>
            <cylinderGeometry args={[0.04, 0.05, 0.36, 12]} />
            <meshStandardMaterial color={MONITOR_PINK} roughness={0.4} />
          </mesh>
          <RoundedBox args={[0.4, 0.03, 0.28]} radius={0.012} position={[0, 0.015, 0]}>
            <meshStandardMaterial color={MONITOR_PINK} roughness={0.4} />
          </RoundedBox>
          <RoundedBox args={[1.5, 0.94, 0.07]} radius={0.03} position={[0, 0.78, 0.02]}>
            <meshStandardMaterial color={MONITOR_PINK} roughness={0.4} />
          </RoundedBox>
          <mesh position={[0, 0.78, -0.017]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[1.42, 0.86]} />
            <meshBasicMaterial ref={screenMat} map={monitor} toneMapped={false} />
          </mesh>
        </group>

        {/* Phone on a stand */}
        <group ref={phone} position={[0.92, 0.53, 0.05]} rotation={[0, Math.PI - 0.5, 0]}>
          <mesh position={[0, 0.03, 0.04]} rotation={[0.35, 0, 0]}>
            <boxGeometry args={[0.22, 0.04, 0.12]} />
            <meshStandardMaterial color="#2b2b35" />
          </mesh>
          <group position={[0, 0.2, 0]} rotation={[-0.25, 0, 0]}>
            <RoundedBox args={[0.17, 0.34, 0.018]} radius={0.008}>
              <meshStandardMaterial color="#1d1d25" metalness={0.8} roughness={0.3} />
            </RoundedBox>
            <mesh position={[0, 0, 0.0095]}>
              <planeGeometry args={[0.155, 0.325]} />
              <meshBasicMaterial map={phoneTex} toneMapped={false} />
            </mesh>
          </group>
        </group>

        {/* Mug */}
        <mesh position={[-0.85, 0.6, -0.15]}>
          <cylinderGeometry args={[0.07, 0.06, 0.16, 16]} />
          <meshStandardMaterial color="#8c7bff" roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
}

/** Purple light behind the bust, as on the reference site. */
function Glow({ motion }: { motion: React.RefObject<CharacterMotion> }) {
  // Radial falloff computed in the shader, so the edge is always soft.
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uColor: { value: new THREE.Color("#7b5cff") }, uOpacity: { value: 0 } },
        vertexShader: "varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
        fragmentShader:
          "uniform vec3 uColor; uniform float uOpacity; varying vec2 vUv; void main() { float d = clamp(length(vUv - 0.5) * 2.0, 0.0, 1.0); float a = pow(1.0 - d, 2.4); gl_FragColor = vec4(uColor * a * uOpacity, 1.0); }",
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        toneMapped: false,
      }),
    [],
  );
  useFrame(() => {
    const k = motion.current?.desk ?? 0;
    // Full behind the bust, a faint wash behind the desk.
    mat.uniforms.uOpacity.value = THREE.MathUtils.lerp(0.75, 0.25, THREE.MathUtils.smoothstep(k, 0.05, 0.6));
  });
  return (
    <mesh position={[0, 1.35, -1.2]} material={mat}>
      <planeGeometry args={[5, 5]} />
    </mesh>
  );
}

const TILE_NAMES = [
  "React",
  "TypeScript",
  "Next.js",
  "JavaScript",
  "Tailwind CSS",
  "Redux Toolkit",
  "Expo",
  "WordPress",
  "WooCommerce",
  "Elementor",
  "Supabase",
  "Figma",
  "Git",
  "Puppeteer",
  "Vite",
  "PHP",
];

/** Tech logos that orbit the character's head on the skills section and hide elsewhere. */
function Tiles({ active, center }: { active: boolean; center: THREE.Vector3 }) {
  const refs = useRef<(THREE.Group | null)[]>([]);
  const textures = useMemo(() => TILE_NAMES.map((n) => logoTexture(n)), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  const rot = useMemo(() => new THREE.Euler(), []);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const n = TILE_NAMES.length;
    refs.current.forEach((g, i) => {
      if (!g) return;
      const a = (i / n) * Math.PI * 2 + t * 0.18;
      const ring = i % 2 === 0 ? 2.1 : 2.7;
      if (active) {
        target.set(center.x + Math.cos(a) * ring, center.y + Math.sin(a) * ring * 0.62, center.z + Math.sin(a * 2) * 0.4);
      } else {
        target.set(center.x + Math.cos(a) * 9, center.y + Math.sin(a) * 6, -6);
      }
      rot.set(Math.sin(t * 0.7 + i) * 0.15, Math.cos(a) * -0.3, 0);
      const s = active ? 0.72 : 0.001;
      easing.damp3(g.position, target, 0.45 + (i % 4) * 0.08, dt);
      easing.dampE(g.rotation, rot, 0.4, dt);
      easing.damp3(g.scale, [s, s, s], 0.4, dt);
      g.visible = g.scale.x > 0.01;
    });
  });

  return (
    <>
      {TILE_NAMES.map((name, i) => (
        <group key={name} ref={(el) => void (refs.current[i] = el)} scale={0.001}>
          <RoundedBox args={[0.8, 0.8, 0.14]} radius={0.12} smoothness={4}>
            <meshStandardMaterial color="#181822" metalness={0.6} roughness={0.35} />
          </RoundedBox>
          <mesh position={[0, 0, 0.071]}>
            <planeGeometry args={[0.8, 0.8]} />
            <meshBasicMaterial map={textures[i]} transparent toneMapped={false} />
          </mesh>
        </group>
      ))}
    </>
  );
}

/** Length of one section-to-section move, in seconds. Matches the text transition. */
const DURATION = 1.4;
const easeInOutCubic = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - (-2 * p + 2) ** 3 / 2);

type Pose = { pos: THREE.Vector3; scale: number; turn: number; desk: number };

function poseOf(l: Layout): Pose {
  return { pos: new THREE.Vector3(...l.pos), scale: l.scale, turn: l.turn, desk: l.mode === "desk" ? 1 : 0 };
}

function World({ section, screen }: { section: SectionId; screen: Screen }) {
  const { size, camera } = useThree();
  const wide = size.width >= 1024;
  const layout = fit(layoutFor(section, screen), wide);

  const rig = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const rim = useRef<THREE.PointLight>(null);
  const head = useMemo(() => new THREE.Vector3(), []);
  const sway = useRef(0);

  // The transition: every change of layout eases from wherever things are now to the new pose.
  const current = useRef<Pose>(poseOf(layout));
  const from = useRef<Pose>(poseOf(layout));
  const target = useRef<Pose>(poseOf(layout));
  const startedAt = useRef<number | null>(null);
  const motion = useRef<CharacterMotion>({ desk: current.current.desk, turn: current.current.turn });

  const key = `${layout.pos.join()}|${layout.scale}|${layout.turn}|${layout.mode}`;
  useEffect(() => {
    const c = current.current;
    from.current = { pos: c.pos.clone(), scale: c.scale, turn: c.turn, desk: c.desk };
    target.current = poseOf(layout);
    startedAt.current = null;
    // layout is derived from key; listing it would restart the move on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const screens = useMemo(
    () => ({
      code: codeTexture(),
      dashboard: dashboardTexture(),
      shop: shopTexture(),
      checkout: checkoutTexture(),
      coffee: coffeeTexture(),
    }),
    [],
  );
  useEffect(() => () => Object.values(screens).forEach((t) => t.dispose()), [screens]);
  const monitor = layout.monitor === "phone" ? screens.dashboard : screens[layout.monitor];

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    if (startedAt.current === null) startedAt.current = t;
    const p = Math.min(1, (t - startedAt.current) / DURATION);
    const e = easeInOutCubic(p);

    const a = from.current;
    const b = target.current;
    const c = current.current;
    c.pos.lerpVectors(a.pos, b.pos, e);
    c.scale = THREE.MathUtils.lerp(a.scale, b.scale, e);
    c.turn = THREE.MathUtils.lerp(a.turn, b.turn, e);
    c.desk = THREE.MathUtils.lerp(a.desk, b.desk, e);
    motion.current.desk = c.desk;
    motion.current.turn = c.turn;

    // Lift slightly in the middle of a long move, so it reads as one arc rather than a slide.
    const travel = Math.min(1, a.pos.distanceTo(b.pos) / 4);
    const arc = Math.sin(Math.PI * e) * travel;

    if (rig.current) {
      rig.current.position.set(c.pos.x, c.pos.y + arc * 0.25, c.pos.z);
      rig.current.scale.setScalar(c.scale);
    }
    sway.current = THREE.MathUtils.damp(sway.current, state.pointer.x * 0.08, 3, dt);
    if (body.current) body.current.rotation.y = c.turn + sway.current;

    // The camera eases back a little mid-move and settles again.
    camera.position.z = 11.5 + arc * 0.9;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, state.pointer.x * 0.25, 2, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, state.pointer.y * 0.15, 2, dt);
    camera.lookAt(0, 0, 0);

    if (rim.current) easing.damp3(rim.current.position, [c.pos.x + state.pointer.x * 2, 2 + state.pointer.y, -3], 0.4, dt);
    head.set(c.pos.x, c.pos.y + 1.55 * c.scale, c.pos.z);
  });

  return (
    <>
      <pointLight ref={rim} color="#8c6bff" intensity={60} distance={14} />
      <group ref={rig}>
        <group ref={body}>
          <Glow motion={motion} />
          <Character motion={motion} />
          <Workspace motion={motion} monitor={monitor} phoneFocus={section === "work" && screen === "phone"} />
        </group>
      </group>
      <Tiles active={layout.tiles} center={head} />
    </>
  );
}

/** The page background colour, kept in sync with the theme toggle. */
function useThemeBackground() {
  const read = () => getComputedStyle(document.documentElement).getPropertyValue("--bg").trim() || "#08080c";
  const [bg, setBg] = useState(read);
  useEffect(() => {
    const obs = new MutationObserver(() => setBg(read()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return bg;
}

export default function Scene({ section, screen }: { section: SectionId; screen: Screen }) {
  // An opaque background keeps the post-processing clean (it mishandles a transparent canvas).
  const bg = useThemeBackground();
  return (
    <Canvas
      eventSource={document.body}
      eventPrefix="client"
      camera={{ position: [0, 0, 11.5], fov: 35 }}
      dpr={[1, 1.75]}
      gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
    >
      <color attach="background" args={[bg]} />
      <ambientLight intensity={0.45} />
      {/* Key light from the front-right, a cool fill from the left, violet rim from behind. */}
      <directionalLight position={[3, 5, 7]} intensity={1.7} color="#fff4ea" />
      <directionalLight position={[-6, 1, 4]} intensity={0.45} color="#b8c8ff" />
      <directionalLight position={[-3, 3, -6]} intensity={1.6} color="#a58cff" />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={2.2} color="#ffffff" position={[0, 4, 6]} scale={[8, 3, 1]} />
        <Lightformer form="rect" intensity={2} color="#8c7bff" position={[-6, 1, -2]} rotation-y={Math.PI / 2} scale={[8, 4, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#4fd1e8" position={[6, -1, 2]} rotation-y={-Math.PI / 2} scale={[8, 3, 1]} />
      </Environment>
      <World section={section} screen={screen} />
      <EffectComposer multisampling={4}>
        <N8AO aoRadius={0.6} intensity={2.2} distanceFalloff={0.6} halfRes />
        <Bloom intensity={0.35} luminanceThreshold={0.85} mipmapBlur />
      </EffectComposer>
    </Canvas>
  );
}
