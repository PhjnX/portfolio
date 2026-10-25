"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { projects } from "@/content/projects";
import { profile, sections, ui } from "@/content/site";
import { Nav } from "../Nav";
import { useSite, useT } from "../Providers";
import { GitHub, LinkedIn, Mail, Phone } from "../icons";
import { Loader } from "./Loader";
import { ScrollProgress } from "../ScrollProgress";
import { SceneGuard } from "../scene/SceneGuard";
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
  const { theme, themeOrigin, lang } = useSite();
  const pager = usePagerMode();
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [project, setProject] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sceneProgress, setSceneProgress] = useState(0);
  const [sceneReady, setSceneReady] = useState(false);

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

  // Opening screen: it waits for the 3D scene (its real progress, then its first frame) and
  // also hides the switch from the server layout to the pager. ?skip-loader skips it for checks.
  useEffect(() => {
    if (new URLSearchParams(location.search).has("skip-loader")) setLoading(false);
    // If WebGL never starts (old device, blocked GPU), open the page anyway.
    const id = window.setTimeout(() => setSceneReady(true), 8000);
    return () => window.clearTimeout(id);
  }, []);
  const loaderTarget = sceneReady ? 100 : Math.min(95, 30 + sceneProgress * 0.65);
  const finishLoading = useCallback(() => setLoading(false), []);
  const markSceneReady = useCallback(() => setSceneReady(true), []);

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
        <SceneGuard onUnavailable={markSceneReady}>
          <Scene section={id} screen={projects[project].screen} theme={theme}
          themeOrigin={themeOrigin}
          lang={lang}
          revealed={!loading}
          onProgress={setSceneProgress}
          onReady={markSceneReady}
          />
        </SceneGuard>
      </div>
      {/* Phones: the character is shown on the intro only; past it the scene pauses and is covered so text stays readable. */}

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
          <ScrollProgress />
          {SLIDES.map((Slide, i) => (
            <MobileSection key={sections[i].id} index={i} label={t(sections[i].label)}>
              <Slide {...props} />
            </MobileSection>
          ))}
        </main>
      )}

      <Socials />

      <AnimatePresence>{loading && <Loader key="loader" target={loaderTarget} onDone={finishLoading} />}</AnimatePresence>
    </>
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

/**
 * One section of the phone layout. The top of the screen is left open as a stage for the
 * 3D character (it changes pose per section); the content sits on a frosted card that rises
 * into place as it scrolls in, and its items stagger in after it.
 */
function MobileSection({ index, label, children }: { index: number; label: string; children: React.ReactNode }) {
  const intro = index === 0;
  return (
    <section
      id={sections[index].id}
      aria-label={label}
      className={`relative px-4 md:px-10 ${intro ? "flex min-h-dvh items-start pt-24 pb-[42vh]" : "pt-[40vh] pb-6"}`}
    >
      <motion.div
        initial="enter"
        whileInView="center"
        viewport={{ once: false, amount: 0.15 }}
        variants={cardVariants}
        className={
          intro
            ? "w-full"
            : "w-full rounded-3xl border border-line bg-bg/72 p-5 shadow-[0_-12px_40px_-20px_rgb(0_0_0/0.5)] backdrop-blur-xl md:p-8"
        }
      >
        {children}
      </motion.div>
    </section>
  );
}

const cardVariants: Variants = {
  enter: { opacity: 0, y: 90, scale: 0.94 },
  center: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 90, damping: 18, staggerChildren: 0.07, delayChildren: 0.15 },
  },
};
