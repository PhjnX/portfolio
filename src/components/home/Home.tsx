"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { projects } from "@/content/projects";
import { profile, sections, ui } from "@/content/site";
import { Nav } from "../Nav";
import { useSite, useT } from "../Providers";
import { GitHub, LinkedIn, Mail, Phone } from "../icons";
import { About, Contact, Experience, Intro, Skills, WhatIDo, Work, type SectionProps } from "./Sections";

// three.js only runs in the browser.
const Scene = dynamic(() => import("../scene/Scene"), { ssr: false });

const ease = [0.22, 1, 0.36, 1] as const;
// One move takes ~1.4 s (see DURATION in Scene.tsx); allow the next a little before it ends.
const COOLDOWN = 1250;

const SLIDES: React.ComponentType<SectionProps>[] = [Intro, About, WhatIDo, Experience, Work, Skills, Contact];

/** Which side of the screen the text takes, leaving the other side to the 3D character. */
const SIDES = ["full", "right", "right", "left", "left", "left", "left"] as const;
const sideClass = { full: "", right: "justify-end", left: "justify-start" };

/** The slide container moves with the scroll direction; its children stagger in. */
const slideVariants: Variants = {
  enter: (dir: number) => ({ opacity: 0, y: dir * 60 }),
  center: {
    opacity: 1,
    y: 0,
    transition: { duration: 1.0, ease, delay: 0.4, staggerChildren: 0.06, delayChildren: 0.45 },
  },
  exit: (dir: number) => ({
    opacity: 0,
    y: dir * -40,
    transition: { duration: 0.5, ease: [0.55, 0, 0.75, 0] },
  }),
};

/** Full-screen paging needs room and a mouse; small or touch screens scroll normally. */
function usePagerMode() {
  const [pager, setPager] = useState(false);
  useEffect(() => {
    const big = window.matchMedia("(min-width: 1024px) and (min-height: 620px)");
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPager(big.matches && !calm.matches);
    update();
    big.addEventListener("change", update);
    calm.addEventListener("change", update);
    return () => {
      big.removeEventListener("change", update);
      calm.removeEventListener("change", update);
    };
  }, []);
  return pager;
}

export function Home() {
  const t = useT();
  const { theme, themeOrigin } = useSite();
  const pager = usePagerMode();
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [project, setProject] = useState(0);
  const [loading, setLoading] = useState(true);

  const indexRef = useRef(0);
  const lastTrigger = useRef(0);
  const lastWheel = useRef(0);

  const go = useCallback(
    (next: number) => {
      const n = Math.max(0, Math.min(sections.length - 1, next));
      const cur = indexRef.current;
      if (pager) {
        if (n === cur) return;
        setDir(n > cur ? 1 : -1);
        indexRef.current = n;
        setIndex(n);
        lastTrigger.current = performance.now();
      } else {
        document.getElementById(sections[n].id)?.scrollIntoView({ behavior: "smooth" });
      }
      history.replaceState(null, "", n === 0 ? location.pathname : `#${sections[n].id}`);
    },
    [pager],
  );

  // Short intro screen; it also hides the switch from the server layout to the pager.
  useEffect(() => {
    // ?skip-loader is handy for screenshots and quick checks.
    const skip = new URLSearchParams(location.search).has("skip-loader");
    const id = window.setTimeout(() => setLoading(false), skip ? 0 : 1500);
    return () => window.clearTimeout(id);
  }, []);

  // Open the section named in the URL, e.g. /#work from a case study's back link.
  useEffect(() => {
    const i = sections.findIndex((s) => `#${s.id}` === location.hash);
    if (i > 0 && pager) {
      indexRef.current = i;
      setIndex(i);
    }
  }, [pager]);

  // In scroll mode, track which section fills the middle of the screen.
  useEffect(() => {
    if (pager) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const i = sections.findIndex((s) => s.id === e.target.id);
          indexRef.current = i;
          setIndex(i);
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [pager]);

  // Wheel, keys and swipes switch slides in pager mode.
  useEffect(() => {
    if (!pager) return;
    const root = document.documentElement;
    root.style.overflow = "hidden";

    /** Lets a tall slide scroll its own content before the page moves on. */
    const canScrollInside = (down: boolean) => {
      const el = document.querySelector<HTMLElement>(`[data-scroller="${sections[indexRef.current].id}"]`);
      if (!el) return false;
      return down ? el.scrollTop + el.clientHeight < el.scrollHeight - 2 : el.scrollTop > 2;
    };

    const step = (down: boolean) => {
      const now = performance.now();
      if (now - lastTrigger.current < COOLDOWN) return;
      go(indexRef.current + (down ? 1 : -1));
    };

    const onWheel = (e: WheelEvent) => {
      const down = e.deltaY > 0;
      if (canScrollInside(down)) return;
      e.preventDefault();
      const now = performance.now();
      const gap = now - lastWheel.current;
      lastWheel.current = now;
      // A trackpad keeps firing wheel events after a flick; ignore that tail until it pauses.
      if (gap < 160 && now - lastTrigger.current < COOLDOWN * 1.8) return;
      if (Math.abs(e.deltaY) < 12) return;
      step(down);
    };

    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("input, textarea, select")) return;
      if (["ArrowDown", "PageDown"].includes(e.key) || (e.key === " " && !target.closest("button, a"))) {
        if (canScrollInside(true)) return;
        e.preventDefault();
        step(true);
      } else if (["ArrowUp", "PageUp"].includes(e.key)) {
        if (canScrollInside(false)) return;
        e.preventDefault();
        step(false);
      } else if (e.key === "Home") {
        go(0);
      } else if (e.key === "End") {
        go(sections.length - 1);
      }
    };

    let startY = 0;
    const onTouchStart = (e: TouchEvent) => (startY = e.touches[0].clientY);
    const onTouchEnd = (e: TouchEvent) => {
      const dy = startY - e.changedTouches[0].clientY;
      if (Math.abs(dy) < 60 || canScrollInside(dy > 0)) return;
      step(dy > 0);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      root.style.overflow = "";
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [pager, go]);

  const props: SectionProps = { go, project, setProject };
  const id = sections[index].id;

  return (
    <>
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <Scene section={id} screen={projects[project].screen} theme={theme} themeOrigin={themeOrigin} />
      </div>
      {/* Keeps text readable where the scene sits behind it on narrow screens. */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 bg-bg/70 lg:hidden" />

      <Nav active={index} onGo={go} />

      {pager ? (
        <main className="fixed inset-0 z-10 overflow-hidden">
          <AnimatePresence custom={dir} initial={false}>
            <motion.section
              key={id}
              id={id}
              aria-label={t(sections[index].label)}
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0"
            >
              <div data-scroller={id} className="slide-scroll h-full overflow-y-auto">
                <div className={`mx-auto flex min-h-full max-w-7xl items-center px-16 pt-24 pb-20 ${sideClass[SIDES[index]]}`}>
                  {(() => {
                    const Slide = SLIDES[index];
                    return <Slide {...props} />;
                  })()}
                </div>
              </div>
            </motion.section>
          </AnimatePresence>
          <Pager index={index} go={go} />
        </main>
      ) : (
        <main className="relative z-10">
          {SLIDES.map((Slide, i) => (
            <motion.section
              key={sections[i].id}
              id={sections[i].id}
              aria-label={t(sections[i].label)}
              initial="enter"
              whileInView="center"
              viewport={{ once: true, amount: 0.2 }}
              variants={slideVariants}
              custom={1}
              className="flex min-h-dvh scroll-mt-0 items-center px-5 pt-24 pb-16 md:px-10"
            >
              <Slide {...props} />
            </motion.section>
          ))}
        </main>
      )}

      <Socials />

      <AnimatePresence>{loading && <Loader key="loader" />}</AnimatePresence>
    </>
  );
}

/** Light loading screen with a running line of text and a progress pill, like the reference. */
function Loader() {
  const t = useT();
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = () => {
      const p = Math.min(1, (performance.now() - start) / 1100);
      setPct(Math.round(100 * (1 - (1 - p) ** 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const line = `${t(ui.intro.role).toUpperCase()} · ${profile.nickname.toUpperCase()} · `;
  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center overflow-hidden bg-[#ececf1] text-[#0b0a10]"
      exit={{ clipPath: "inset(0 0 100% 0)", transition: { duration: 0.9, ease: [0.76, 0, 0.24, 1] } }}
      style={{ clipPath: "inset(0 0 0% 0)" }}
    >
      <motion.div
        aria-hidden
        className="absolute top-1/2 flex -translate-y-1/2 whitespace-nowrap font-display text-[clamp(3rem,9vw,8rem)] leading-none font-bold tracking-tight text-[#0b0a10]/10"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 14, ease: "linear", repeat: Infinity }}
      >
        <span>{line.repeat(3)}</span>
        <span>{line.repeat(3)}</span>
      </motion.div>
      <div className="relative flex items-center gap-3 rounded-full bg-[#0b0a10] px-5 py-2.5 text-xs font-bold tracking-widest text-white uppercase">
        <span>Loading</span>
        <span className="w-9 text-right tabular-nums">{pct}%</span>
      </div>
    </motion.div>
  );
}

/** Vertical social links on the left edge. */
function Socials() {
  const links = [
    { href: profile.github, label: "GitHub", icon: <GitHub width={17} height={17} /> },
    { href: profile.linkedin, label: "LinkedIn", icon: <LinkedIn width={17} height={17} /> },
    { href: `mailto:${profile.email}`, label: "Email", icon: <Mail width={17} height={17} /> },
    { href: profile.phoneHref, label: "Phone", icon: <Phone width={17} height={17} /> },
  ];
  return (
    <ul className="fixed top-1/2 left-6 z-20 hidden -translate-y-1/2 flex-col gap-5 lg:flex">
      {links.map((l) => (
        <li key={l.label}>
          <a
            href={l.href}
            target={l.href.startsWith("http") ? "_blank" : undefined}
            rel="noreferrer"
            aria-label={l.label}
            className="grid size-8 place-items-center text-muted transition-colors hover:text-fg"
          >
            {l.icon}
          </a>
        </li>
      ))}
    </ul>
  );
}

/** Section counter and jump links on the right edge, plus a scroll hint on the first slide. */
function Pager({ index, go }: { index: number; go: (i: number) => void }) {
  const t = useT();
  return (
    <>
      <nav aria-label="Sections" className="fixed top-1/2 right-8 z-20 -translate-y-1/2">
        <ol className="flex flex-col items-end gap-3">
          {sections.map((s, i) => {
            const active = i === index;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => go(i)}
                  aria-label={t(s.label)}
                  aria-current={active ? "true" : undefined}
                  className="group flex items-center gap-3 py-1"
                >
                  <span
                    className={`translate-x-2 text-xs font-bold opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100 ${
                      active ? "text-fg" : "text-muted"
                    }`}
                  >
                    {t(s.label)}
                  </span>
                  <span
                    className={`h-px transition-all duration-500 ${active ? "w-10 bg-accent" : "w-4 bg-line-strong group-hover:w-6 group-hover:bg-muted"}`}
                  />
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="pointer-events-none fixed right-10 bottom-8 z-20 flex items-center gap-4 text-xs font-bold text-muted tabular-nums">
        <span className="text-fg">{String(index + 1).padStart(2, "0")}</span>
        <span className="h-px w-10 bg-line-strong">
          <motion.span
            className="block h-full bg-fg"
            animate={{ scaleX: (index + 1) / sections.length }}
            transition={{ duration: 0.8, ease }}
            style={{ originX: 0 }}
          />
        </span>
        <span>{String(sections.length).padStart(2, "0")}</span>
      </div>

      <AnimatePresence>
        {index === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 1.6 } }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 text-xs font-semibold text-muted"
          >
            <span className="relative h-9 w-5.5 rounded-full border border-line-strong">
              <motion.span
                className="absolute top-2 left-1/2 h-2 w-px -translate-x-1/2 bg-fg"
                animate={{ y: [0, 8, 0], opacity: [1, 0, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              />
            </span>
            {t(ui.intro.scroll)}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
