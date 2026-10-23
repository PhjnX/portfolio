"use client";

import { Environment, Lightformer, PerformanceMonitor, RoundedBox, useProgress, useTexture } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import { AnimatePresence, motion as m } from "motion/react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, N8AO } from "@react-three/postprocessing";
import { easing } from "maath";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { Project } from "@/content/projects";
import { ui, type Lang, type SectionId } from "@/content/site";
import type { Point } from "../Providers";
import { Character, type CharacterMotion } from "./Character";
import { Sky, type SkyState } from "./Sky";
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
type Theme = "light" | "dark";
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
    pos: [0, bust ? -5.8 : 0.4, -3],
    turn: bust ? 0 : 1.0,
    scale: l.scale * 0.7,
  };
}

/** Screenshots of the live sites per monitor screen (public/projects). */
const SHOTS = {
  dashboard: ["/projects/ems-1.jpg", "/projects/ems-2.jpg", "/projects/ems-3.jpg"],
  coffee: ["/projects/coffee-1.jpg", "/projects/coffee-2.jpg", "/projects/coffee-3.jpg"],
};
const SHOT_FILES = Object.values(SHOTS).flat();

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
function Glow({ motion, daylight }: { motion: React.RefObject<CharacterMotion>; daylight: React.RefObject<number> }) {
  const night = useMemo(() => new THREE.Color("#7b5cff"), []);
  const day = useMemo(() => new THREE.Color("#ffb07a"), []);
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
    const d = daylight.current ?? 0;
    mat.uniforms.uOpacity.value =
      THREE.MathUtils.lerp(0.75, 0.25, THREE.MathUtils.smoothstep(k, 0.05, 0.6)) * THREE.MathUtils.lerp(1, 0.55, d);
    (mat.uniforms.uColor.value as THREE.Color).lerpColors(night, day, d);
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

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/**
 * Day/night timeline. A theme change grows the new sky as a circle from the toggle
 * (about 1.1 s), then the sun or moon rises in it; lights follow the same clock.
 */
function useDaylight(theme: Theme, origin: Point) {
  const initial = theme === "light" ? 1 : 0;
  const sky = useRef<SkyState>({
    from: initial,
    to: initial,
    reveal: 3,
    sun: initial,
    moon: 1 - initial,
    origin: new THREE.Vector2(origin.x, origin.y),
    x: 0.8,
  });
  const daylight = useRef(initial);
  const startedAt = useRef<number | null>(null);
  const changing = useRef(false);

  useEffect(() => {
    const s = sky.current;
    const next = theme === "light" ? 1 : 0;
    if (next === s.to) return;
    s.from = s.to;
    s.to = next;
    s.origin.set(origin.x, origin.y);
    s.reveal = 0;
    startedAt.current = null;
    changing.current = true;
    // origin is read once per change; it updates together with theme.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  useFrame(({ clock }) => {
    if (!changing.current) return;
    const t = clock.elapsedTime;
    if (startedAt.current === null) startedAt.current = t;
    const k = t - startedAt.current;
    const s = sky.current;
    const rising = easeInOutCubic(clamp01((k - 0.25) / 1.5));
    const setting = 1 - easeInOutCubic(clamp01(k / 0.8));
    s.reveal = easeInOutCubic(clamp01(k / 1.1)) * 2.8;
    if (s.to === 1) {
      s.sun = rising;
      s.moon = setting;
    } else {
      s.sun = setting;
      s.moon = rising;
    }
    daylight.current = THREE.MathUtils.lerp(s.from, s.to, easeInOutCubic(clamp01(k / 1.2)));
    if (k > 1.8) {
      s.from = s.to;
      changing.current = false;
    }
  });

  return { sky, daylight };
}

/** Lights that move from a violet night set-up to a warm, brighter day. */
function Lights({ daylight }: { daylight: React.RefObject<number> }) {
  const ambient = useRef<THREE.AmbientLight>(null);
  const key = useRef<THREE.DirectionalLight>(null);
  const back = useRef<THREE.DirectionalLight>(null);
  const colors = useMemo(
    () => ({
      keyNight: new THREE.Color("#fff4ea"),
      keyDay: new THREE.Color("#ffe2bf"),
      backNight: new THREE.Color("#a58cff"),
      backDay: new THREE.Color("#ffd2a6"),
    }),
    [],
  );
  useFrame(() => {
    const d = daylight.current ?? 0;
    if (ambient.current) ambient.current.intensity = THREE.MathUtils.lerp(0.45, 0.95, d);
    if (key.current) {
      key.current.intensity = THREE.MathUtils.lerp(1.7, 2.1, d);
      key.current.color.lerpColors(colors.keyNight, colors.keyDay, d);
    }
    if (back.current) {
      back.current.intensity = THREE.MathUtils.lerp(1.6, 0.9, d);
      back.current.color.lerpColors(colors.backNight, colors.backDay, d);
    }
  });
  return (
    <>
      <ambientLight ref={ambient} intensity={0.45} />
      {/* Key light from the front-right, a cool fill from the left, a rim from behind. */}
      <directionalLight ref={key} position={[3, 5, 7]} intensity={1.7} color="#fff4ea" />
      <directionalLight position={[-6, 1, 4]} intensity={0.45} color="#b8c8ff" />
      <directionalLight ref={back} position={[-3, 3, -6]} intensity={1.6} color="#a58cff" />
    </>
  );
}

type Bubble = { id: number; text: string } | null;

/**
 * What the character says and when it waves: a hello when the loading screen opens,
 * "Xin chÃ o!" / "Hello!" when the language changes, and a random line when clicked.
 */
function useGreetings(
  motion: React.RefObject<CharacterMotion>,
  lang: Lang,
  revealed: boolean,
  setBubble: (b: Bubble) => void,
) {
  const clock = useThree((s) => s.clock);
  const lastLine = useRef(-1);
  const hideTimer = useRef(0);

  const say = useCallback(
    (text: string, ms = 2800) => {
      motion.current.waveAt = clock.elapsedTime;
      setBubble({ id: Date.now(), text });
      window.clearTimeout(hideTimer.current);
      hideTimer.current = window.setTimeout(() => setBubble(null), ms);
    },
    [clock, motion, setBubble],
  );

  useEffect(() => () => window.clearTimeout(hideTimer.current), []);

  // Hello once the page opens.
  useEffect(() => {
    if (!revealed) return;
    const id = window.setTimeout(() => say(ui.character.hello[lang], 4200), 900);
    return () => window.clearTimeout(id);
    // Only on reveal; a later language change has its own greeting.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed]);

  // A short hello in the new language.
  const firstLang = useRef(true);
  useEffect(() => {
    if (firstLang.current) {
      firstLang.current = false;
      return;
    }
    if (revealed) say(ui.character.lang[lang]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const onCharacterClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      // Clicks on links and buttons laid over the character are for them, not for it.
      if ((e.nativeEvent.target as HTMLElement | null)?.closest("a, button, input")) return;
      e.stopPropagation();
      const lines = ui.character.lines;
      let i = Math.floor(Math.random() * lines.length);
      if (i === lastLine.current) i = (i + 1) % lines.length;
      lastLine.current = i;
      say(lines[i][lang]);
    },
    [lang, say],
  );

  return { onCharacterClick };
}

/** Pointer cursor while hovering the character. */
const pointer = (over: boolean) => () => {
  document.body.style.cursor = over ? "pointer" : "";
};

/** Drawn as normal DOM outside the canvas; the scene moves it to the character's head every frame. */
function SpeechBubble({ bubble, anchor }: { bubble: Bubble; anchor: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div ref={anchor} className="pointer-events-none fixed top-0 left-0 z-20" style={{ transform: "translate(-999px, -999px)" }}>
      <AnimatePresence>
        {bubble && (
          <m.div
            key={bubble.id}
            initial={{ opacity: 0, scale: 0.6, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -6 }}
            transition={{ type: "spring", stiffness: 420, damping: 26 }}
            className="relative w-max max-w-[220px] origin-bottom-left rounded-2xl rounded-bl-sm bg-fg px-3.5 py-2 text-sm font-bold text-bg shadow-lg"
          >
            {bubble.text}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Tells the page how far loading has got (100 when nothing is loading) and when the first frames are drawn. */
function LoadReporter({ onProgress, onReady }: { onProgress: (pct: number) => void; onReady: () => void }) {
  const { active, progress } = useProgress();
  useEffect(() => {
    onProgress(active ? progress : 100);
  }, [active, progress, onProgress]);

  const frames = useRef(0);
  const reported = useRef(false);
  useFrame(() => {
    if (reported.current || active) return;
    frames.current += 1;
    // A few frames in, shaders are compiled and the scene is really on screen.
    if (frames.current > 3) {
      reported.current = true;
      onReady();
    }
  });
  return null;
}

type WorldProps = {
  section: SectionId;
  screen: Screen;
  theme: Theme;
  themeOrigin: Point;
  lang: Lang;
  /** False while the loading screen is up; the camera glides in when it turns true. */
  revealed: boolean;
};

type BubbleProps = {
  setBubble: (b: Bubble) => void;
  bubbleAnchor: React.RefObject<HTMLDivElement | null>;
};

type SceneProps = WorldProps & {
  onProgress: (pct: number) => void;
  onReady: () => void;
  /** Stop rendering while the scene is covered (phones, past the intro) to save battery. */
  paused?: boolean;
};

function World({ section, screen, theme, themeOrigin, lang, revealed, setBubble, bubbleAnchor }: WorldProps & BubbleProps) {
  const { size, camera } = useThree();
  const { sky, daylight } = useDaylight(theme, themeOrigin);
  // Sun and moon sit on the side of the screen that has no text in this section.
  const skyX = section === "about" || section === "whatido" ? 0.2 : section === "experience" || section === "work" ? 0.58 : 0.8;
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
  const motion = useRef<CharacterMotion>({ desk: current.current.desk, turn: current.current.turn, waveAt: -1 });
  const { onCharacterClick } = useGreetings(motion, lang, revealed, setBubble);
  // Point beside the head that the speech bubble follows.
  const bubblePoint = useRef<THREE.Group>(null);
  const projected = useMemo(() => new THREE.Vector3(), []);
  const revealedAt = useRef<number | null>(null);

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

  // Real screenshots of the live sites, shown as a slideshow on the monitor; the other
  // projects keep their drawn screens.
  const shots = useTexture(SHOT_FILES, (loaded) => {
    for (const tex of Array.isArray(loaded) ? loaded : [loaded]) {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 8;
    }
  });
  const monitorKey = layout.monitor === "phone" ? "dashboard" : layout.monitor;
  const slides = SHOTS[monitorKey as keyof typeof SHOTS]?.map((file) => shots[SHOT_FILES.indexOf(file)]);
  const [slide, setSlide] = useState(0);
  useEffect(() => {
    setSlide(0);
    if (!slides || layout.mode !== "desk") return;
    const id = window.setInterval(() => setSlide((n) => n + 1), 3500);
    return () => window.clearInterval(id);
    // slides is derived from monitorKey.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monitorKey, layout.mode]);
  const monitor = slides ? slides[slide % slides.length] : screens[monitorKey as keyof typeof screens];

  useFrame((state, dt) => {
    sky.current.x = THREE.MathUtils.damp(sky.current.x, skyX, 1.6, dt);
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

    // Opening shot: start further back and glide in once the loading screen opens.
    if (revealed && revealedAt.current === null) revealedAt.current = t;
    const intro = revealedAt.current === null ? 1 : 1 - easeInOutCubic(clamp01((t - revealedAt.current) / 1.8));

    // The camera eases back a little mid-move and settles again.
    camera.position.z = 11.5 + arc * 0.9 + intro * 6;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, state.pointer.x * 0.25, 2, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, state.pointer.y * 0.15, 2, dt);
    camera.lookAt(0, 0, 0);

    if (rim.current) {
      easing.damp3(rim.current.position, [c.pos.x + state.pointer.x * 2, 2 + state.pointer.y, -3], 0.4, dt);
      rim.current.intensity = THREE.MathUtils.lerp(60, 18, daylight.current);
    }
    head.set(c.pos.x, c.pos.y + 1.55 * c.scale, c.pos.z);

    // Keep the speech bubble next to the head on screen.
    if (bubblePoint.current && bubbleAnchor.current) {
      bubblePoint.current.getWorldPosition(projected).project(camera);
      const x = (projected.x * 0.5 + 0.5) * size.width;
      const y = (-projected.y * 0.5 + 0.5) * size.height;
      bubbleAnchor.current.style.transform = `translate(${x}px, ${y}px) translateY(-100%)`;
    }
  });

  return (
    <>
      <Sky state={sky} />
      <Lights daylight={daylight} />
      <pointLight ref={rim} color="#8c6bff" intensity={60} distance={14} />
      <group ref={rig}>
        <group ref={body}>
          <Glow motion={motion} daylight={daylight} />
          <Character motion={motion} />
          {/* Invisible hit area: clicking the character makes it wave and say something. */}
          <mesh position={[0, 0.9, 0]} onClick={onCharacterClick} onPointerOver={pointer(true)} onPointerOut={pointer(false)}>
            <boxGeometry args={[1.4, 2.8, 1.1]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
          </mesh>
          <group ref={bubblePoint} position={[0.5, 2.15, 0]} />
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

export default function Scene({ onProgress, onReady, paused = false, ...world }: SceneProps) {
  const [bubble, setBubble] = useState<Bubble>(null);
  const bubbleAnchor = useRef<HTMLDivElement>(null);
  // Drops to a lighter render (no retina resolution, no soft shadows or bloom) if the frame rate stays low.
  // Phones and tablets start in the light mode: no retina resolution, no soft shadows or bloom.
  const [lowPower, setLowPower] = useState(
    () => window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 1024,
  );
  // An opaque background keeps the post-processing clean (it mishandles a transparent canvas).
  const bg = useThemeBackground();
  return (
    <>
    <Canvas
      eventSource={document.body}
      eventPrefix="client"
      camera={{ position: [0, 0, 11.5], fov: 35 }}
      dpr={lowPower ? [1, 1.25] : [1, 1.5]}
      frameloop={paused ? "never" : "always"}
      gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
    >
      <color attach="background" args={[bg]} />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={2.2} color="#ffffff" position={[0, 4, 6]} scale={[8, 3, 1]} />
        <Lightformer form="rect" intensity={2} color="#8c7bff" position={[-6, 1, -2]} rotation-y={Math.PI / 2} scale={[8, 4, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#4fd1e8" position={[6, -1, 2]} rotation-y={-Math.PI / 2} scale={[8, 3, 1]} />
      </Environment>
      <LoadReporter onProgress={onProgress} onReady={onReady} />
      <Suspense fallback={null}>
        <World {...world} setBubble={setBubble} bubbleAnchor={bubbleAnchor} />
      </Suspense>
      <PerformanceMonitor onDecline={() => setLowPower(true)} />
      {!lowPower && (
      <EffectComposer multisampling={4}>
        <N8AO aoRadius={0.6} intensity={2.2} distanceFalloff={0.6} halfRes quality="performance" />
        <Bloom intensity={0.35} luminanceThreshold={1} mipmapBlur />
      </EffectComposer>
      )}
    </Canvas>
    <SpeechBubble bubble={bubble} anchor={bubbleAnchor} />
    </>
  );
}
