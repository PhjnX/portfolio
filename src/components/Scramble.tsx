"use client";

import { useEffect, useRef, useState } from "react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#%&*+=<>/";

/**
 * Text that "decodes" when it changes, e.g. on a language switch: letters flicker through
 * random glyphs and settle left to right. The real text is laid out invisibly underneath,
 * so the scrambling never shifts the layout, and screen readers only get the final text.
 */
export function Scramble({ text, duration = 650 }: { text: string; duration?: number }) {
  const [shown, setShown] = useState(text);
  const previous = useRef(text);

  useEffect(() => {
    if (previous.current === text) return;
    previous.current = text;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(text);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      // Settle a little ahead of the scramble front so the end of the animation reads cleanly.
      const settled = Math.floor(p * p * text.length * 1.05);
      let out = "";
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        out += i < settled || ch === " " ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      setShown(out);
      if (p < 1) raf = requestAnimationFrame(tick);
      else setShown(text);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, duration]);

  return (
    <span data-scramble className="relative inline-block">
      <span className="invisible">{text}</span>
      <span aria-hidden className="absolute inset-0">
        {shown}
      </span>
      <span className="sr-only">{text}</span>
    </span>
  );
}
