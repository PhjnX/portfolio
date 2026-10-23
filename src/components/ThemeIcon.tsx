"use client";

import { motion } from "motion/react";
import { useId } from "react";

const spring = { type: "spring", stiffness: 260, damping: 22 } as const;

/**
 * One icon that morphs between a sun and a crescent moon: the rays fold in while the disc
 * grows and a second circle slides over it to cut the crescent.
 * Shows the sun in the dark theme (press for day) and the moon in the light theme.
 */
export function ThemeIcon({ dark, size = 16 }: { dark: boolean; size?: number }) {
  const mask = useId();
  const sun = dark;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <mask id={mask}>
        <rect width="24" height="24" fill="#fff" />
        <motion.circle
          fill="#000"
          r={7}
          initial={false}
          animate={sun ? { cx: 30, cy: -6 } : { cx: 17, cy: 7 }}
          transition={spring}
        />
      </mask>
      <motion.circle
        cx={12}
        cy={12}
        fill="currentColor"
        mask={`url(#${mask})`}
        initial={false}
        animate={{ r: sun ? 4.6 : 8.6 }}
        transition={spring}
      />
      <motion.g
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        initial={false}
        animate={sun ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0, scale: 0.4, rotate: -90 }}
        transition={spring}
        style={{ originX: "12px", originY: "12px" }}
      >
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i * Math.PI) / 4;
          return (
            <line
              key={i}
              x1={12 + Math.cos(a) * 7.5}
              y1={12 + Math.sin(a) * 7.5}
              x2={12 + Math.cos(a) * 9.8}
              y2={12 + Math.sin(a) * 9.8}
            />
          );
        })}
      </motion.g>
    </svg>
  );
}
