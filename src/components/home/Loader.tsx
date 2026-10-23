"use client";

import { motion, type TargetAndTransition } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { profile, ui } from "@/content/site";
import { useT } from "../Providers";

const ease = [0.22, 1, 0.36, 1] as const;
/** How long the signature takes to draw; the loader never closes before it is finished. */
const DRAW_SECONDS = 1.5;

type Props = {
  /** Real progress, 0..100, reported by the 3D scene. */
  target: number;
  onDone: () => void;
};

/**
 * Opening screen: "Phjn" is drawn stroke by stroke like a signature, with a percentage that
 * follows the real loading of the 3D scene. When both are done it opens as a circle that
 * grows from the centre, revealing the scene behind it.
 */
export function Loader({ target, onDone }: Props) {
  const t = useT();
  const [pct, setPct] = useState(0);
  const [drawn, setDrawn] = useState(false);
  const shown = useRef(0);
  const done = useRef(false);

  // Ease the counter toward the real progress; it never goes backwards.
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      // Time-based easing, so the counter moves at the same speed whatever the frame rate.
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const next = shown.current + (target - shown.current) * (1 - Math.exp(-dt * 5));
      shown.current = Math.max(shown.current, target - next < 0.4 ? target : next);
      setPct(Math.floor(shown.current));
      if (shown.current < target) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  useEffect(() => {
    const id = window.setTimeout(() => setDrawn(true), DRAW_SECONDS * 1000 + 250);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (done.current || !drawn || pct < 100) return;
    done.current = true;
    const id = window.setTimeout(onDone, 250);
    return () => window.clearTimeout(id);
  }, [drawn, pct, onDone]);

  // The hole in the middle of the overlay grows until the overlay is gone.
  const exit: TargetAndTransition = {
    "--hole": "150vmax",
    transition: { duration: 1.1, ease: [0.7, 0, 0.2, 1] },
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center bg-bg text-fg"
      style={{
        ["--hole" as string]: "0vmax",
        maskImage: "radial-gradient(circle at 50% 50%, transparent var(--hole), #000 calc(var(--hole) + 1px))",
        WebkitMaskImage: "radial-gradient(circle at 50% 50%, transparent var(--hole), #000 calc(var(--hole) + 1px))",
      }}
      exit={exit}
    >
      <div className="flex flex-col items-center">
        <svg viewBox="0 0 420 170" className="w-[min(70vw,420px)]" aria-label={profile.brand} role="img">
          <defs>
            <linearGradient id="sig" x1="0" x2="1">
              <stop offset="0%" stopColor="var(--fg)" />
              <stop offset="100%" stopColor="var(--accent)" />
            </linearGradient>
          </defs>
          {/* Outline drawn first, then the letters fill in. */}
          <motion.text
            x="50%"
            y="118"
            textAnchor="middle"
            fontSize="132"
            fontWeight={800}
            letterSpacing="-6"
            fill="url(#sig)"
            stroke="url(#sig)"
            strokeWidth={1.6}
            strokeDasharray={900}
            initial={{ strokeDashoffset: 900, fillOpacity: 0 }}
            animate={{ strokeDashoffset: 0, fillOpacity: 1 }}
            transition={{
              strokeDashoffset: { duration: DRAW_SECONDS, ease: [0.65, 0, 0.35, 1] },
              fillOpacity: { duration: 0.6, delay: DRAW_SECONDS - 0.35, ease },
            }}
            style={{ fontFamily: "var(--font-body)" }}
          >
            {profile.brand}
          </motion.text>
          {/* A quick underline flourish, like the end of a signature. */}
          <motion.path
            d="M70 150 C 160 132, 260 132, 352 146"
            fill="none"
            stroke="var(--accent)"
            strokeWidth={3}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.7, delay: DRAW_SECONDS - 0.2, ease }}
          />
        </svg>

        <div className="mt-6 flex w-[min(60vw,280px)] items-center gap-4 text-xs font-bold tracking-[0.2em] text-muted uppercase">
          <span>{t(ui.intro.role)}</span>
          <span className="h-px flex-1 overflow-hidden bg-line">
            <span className="block h-full origin-left bg-accent" style={{ transform: `scaleX(${pct / 100})` }} />
          </span>
          <span className="w-10 text-right text-fg tabular-nums">{pct}%</span>
        </div>
      </div>
    </motion.div>
  );
}
