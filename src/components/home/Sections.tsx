"use client";

import Link from "next/link";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { useEffect, useState } from "react";
import { projects } from "@/content/projects";
import {
  certifications,
  education,
  experience,
  languages,
  learning,
  profile,
  services,
  skillGroups,
  ui,
} from "@/content/site";
import { ArrowDown, ArrowUpRight, Check, Copy, Download, GitHub, LinkedIn, MapPin, Phone } from "../icons";
import { LocalTime } from "../LocalTime";
import { useT } from "../Providers";
import { TechBadge } from "../TechBadge";

const ease = [0.22, 1, 0.36, 1] as const;

/** Children of a slide animate in one after another; the slide sets the stagger. */
export const itemVariants: Variants = {
  enter: { opacity: 0, y: 24, filter: "blur(8px)" },
  center: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.9, ease } },
  exit: { opacity: 0, y: -10, filter: "blur(6px)", transition: { duration: 0.35, ease: [0.55, 0, 0.75, 0] } },
};

function Item({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}

/**
 * The one heading pattern every section uses: a small label, the title, and a short
 * subtitle. Keeping sizes and gaps identical everywhere is what makes the pages read as a set.
 */
function Heading({ kicker, title, lead }: { kicker: string; title: string; lead?: string }) {
  return (
    <>
      <Item>
        <p className="flex items-center gap-2.5 text-xs font-bold tracking-[0.18em] text-accent uppercase">
          <span aria-hidden className="h-px w-6 bg-accent" />
          {kicker}
        </p>
      </Item>
      <Item>
        <h2 className="mt-4 text-[clamp(2rem,3.1vw,2.85rem)] leading-[1.1] font-extrabold tracking-[-0.025em] text-balance">
          {title}
        </h2>
      </Item>
      {lead && (
        <Item>
          <p className="mt-4 max-w-md text-base leading-relaxed text-muted">{lead}</p>
        </Item>
      )}
    </>
  );
}

export type SectionProps = {
  go: (index: number) => void;
  project: number;
  setProject: (index: number) => void;
};

/* ---------- Intro ---------- */

/** Swaps between words letter by letter, like the reference hero. */
function CyclingWord({ words }: { words: string[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setI((n) => (n + 1) % words.length), 2800);
    return () => window.clearInterval(id);
  }, [words.length]);
  const word = words[i];
  return (
    <span className="relative block overflow-hidden pb-[0.1em]" aria-live="polite">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={word} className="flex" aria-label={word}>
          {word.split("").map((ch, j) => (
            <motion.span
              key={j}
              aria-hidden
              initial={{ y: "105%", opacity: 0 }}
              animate={{ y: 0, opacity: 1, transition: { duration: 0.5, delay: j * 0.035, ease } }}
              exit={{ y: "-105%", opacity: 0, transition: { duration: 0.3, delay: j * 0.02, ease } }}
              className="inline-block bg-linear-to-b from-accent to-fg bg-clip-text text-transparent"
            >
              {ch}
            </motion.span>
          ))}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function Intro({ go }: SectionProps) {
  const t = useT();
  return (
    <div className="grid w-full items-center gap-10 lg:grid-cols-[1fr_26vw_1fr]">
      <div>
        <Item>
          <p className="text-base font-semibold text-muted md:text-lg">{t(ui.intro.hello)}</p>
        </Item>
        <Item>
          <h1 className="mt-2 text-[clamp(3rem,5.6vw,5.25rem)] leading-[0.98] font-extrabold tracking-[-0.04em]">
            Phjn
            <br />
            <span className="text-accent">Hoàng</span>
          </h1>
        </Item>
        <Item>
          <p className="mt-5 text-sm font-semibold text-muted">
            {t(ui.intro.role)} · {t(profile.location)}
          </p>
        </Item>
        <Item className="mt-8 flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => go(4)}
            className="group inline-flex items-center gap-2 rounded-full bg-fg px-5 py-2.5 text-sm font-bold text-bg transition-transform hover:-translate-y-0.5"
          >
            {t(ui.intro.ctaWork)}
            <ArrowDown width={15} height={15} className="transition-transform group-hover:translate-y-0.5" />
          </button>
          <a
            href={profile.cvUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-bg/40 px-5 py-2.5 text-sm font-bold backdrop-blur transition-colors hover:bg-fg/5"
          >
            <Download width={15} height={15} />
            {t(ui.intro.ctaCv)}
          </a>
        </Item>
      </div>

      <div aria-hidden className="hidden lg:block" />

      <div className="lg:justify-self-end">
        <Item>
          <p className="text-base font-semibold text-muted md:text-lg">{t(ui.intro.lead)}</p>
        </Item>
        <Item>
          <p className="mt-2 text-[clamp(2.4rem,4.2vw,4rem)] leading-[0.98] font-extrabold tracking-[-0.04em]">
            <CyclingWord words={ui.intro.words} />
          </p>
        </Item>
        <Item>
          <p className="mt-5 max-w-[19rem] text-sm leading-relaxed text-muted">{t(ui.intro.tagline)}</p>
        </Item>
      </div>
    </div>
  );
}

/* ---------- About ---------- */

export function About() {
  const t = useT();
  return (
    <div className="max-w-xl">
      <Heading kicker={t(ui.about.kicker)} title={t(ui.about.title)} />
      <Item>
        <p className="mt-5 text-base leading-relaxed text-muted">{t(ui.about.text)}</p>
        <p className="mt-3 text-sm font-semibold text-fg/80">{t(ui.about.realName)}</p>
      </Item>
      <Item className="mt-8 grid grid-cols-3 gap-3">
        {ui.stats.map((s) => (
          <div key={s.label.en} className="rounded-2xl border border-line bg-bg-elev/50 p-4 backdrop-blur-sm">
            <p className="text-3xl font-extrabold tracking-tight">{s.value}</p>
            <p className="mt-1 text-xs leading-snug text-muted">{t(s.label)}</p>
          </div>
        ))}
      </Item>
      <Item className="mt-8 grid gap-6 border-t border-line pt-6 text-sm sm:grid-cols-3">
        <div>
          <p className="text-xs font-bold tracking-[0.14em] text-muted uppercase">{t(ui.about.facts.education)}</p>
          <p className="mt-2.5 font-bold">{t(education.school)}</p>
          <p className="mt-1 leading-snug text-muted">{t(education.degree)}</p>
          <p className="mt-1 text-muted">{education.period}</p>
        </div>
        <div>
          <p className="text-xs font-bold tracking-[0.14em] text-muted uppercase">{t(ui.about.facts.languages)}</p>
          {languages.map((l) => (
            <p key={l.en} className="mt-2.5 font-bold">
              {t(l)}
            </p>
          ))}
        </div>
        <div>
          <p className="text-xs font-bold tracking-[0.14em] text-muted uppercase">{t(ui.about.facts.certs)}</p>
          {certifications.map((c) => (
            <div key={c.name} className="mt-2.5">
              <p className="font-bold">{c.name}</p>
              <p className="mt-0.5 text-muted">{c.date}</p>
            </div>
          ))}
        </div>
      </Item>
    </div>
  );
}

/* ---------- What I do ---------- */

/** Dashed cards with corner marks; hovering one opens it, like the reference site. */
export function WhatIDo() {
  const t = useT();
  const [open, setOpen] = useState(0);
  return (
    <div className="w-full max-w-xl">
      <Heading kicker={t(ui.whatido.kicker)} title={t(ui.whatido.title)} lead={t(ui.whatido.lead)} />
      <div className="mt-8 space-y-3">
        {services.map((s, i) => {
          const isOpen = i === open;
          return (
            <Item key={s.title.en}>
              <button
                type="button"
                onMouseEnter={() => setOpen(i)}
                onFocus={() => setOpen(i)}
                onClick={() => setOpen(i)}
                aria-expanded={isOpen}
                className="relative block w-full border border-dashed border-line-strong p-5 text-left transition-colors hover:border-fg/40"
              >
                {[
                  "-top-1 -left-1",
                  "-top-1 -right-1",
                  "-bottom-1 -left-1",
                  "-bottom-1 -right-1",
                ].map((c) => (
                  <span key={c} aria-hidden className={`absolute size-2 bg-fg/70 ${c}`} />
                ))}
                <span className="flex items-baseline justify-between gap-4">
                  <span className="font-display text-xl font-semibold tracking-tight md:text-2xl">{t(s.title)}</span>
                  <span className="text-xs font-bold text-muted tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                </span>
                <motion.span
                  initial={false}
                  animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                  transition={{ duration: 0.45, ease }}
                  className="block overflow-hidden"
                >
                  <span className="block pt-3 text-sm leading-relaxed text-muted">{t(s.text)}</span>
                  <span className="mt-4 flex flex-wrap gap-1.5">
                    {s.stack.map((name) => (
                      <TechBadge key={name} name={name} size="sm" />
                    ))}
                  </span>
                </motion.span>
              </button>
            </Item>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- 03 Experience ---------- */

export function Experience() {
  const t = useT();
  return (
    <div className="max-w-xl">
      <Heading kicker={t(ui.experience.kicker)} title={t(ui.experience.title)} lead={t(ui.experience.lead)} />
      <ol className="mt-8 space-y-8 border-l border-line-strong pl-6">
        {experience.map((job) => (
          <li key={job.period} className="relative">
            <Item>
              <span aria-hidden className="absolute top-2 -left-[29px] size-2.5 rotate-45 bg-accent" />
              <p className="text-sm font-semibold text-muted tabular-nums">{job.period}</p>
              <h3 className="mt-1 font-display text-xl font-semibold">
                {t(job.role)} <span className="text-accent">· {job.company}</span>
              </h3>
              <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-muted">
                {job.points.map((p) => (
                  <li key={p.en} className="flex gap-2.5">
                    <span aria-hidden className="mt-2.5 h-px w-3 shrink-0 bg-line-strong" />
                    {t(p)}
                  </li>
                ))}
              </ul>
            </Item>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ---------- 04 Projects ---------- */

export function Work({ project, setProject }: SectionProps) {
  const t = useT();
  const active = projects[project];

  return (
    <div className="max-w-xl">
      <Heading kicker={t(ui.work.kicker)} title={t(ui.work.title)} lead={t(ui.work.lead)} />
      <Item>
        <ul className="mt-8 border-t border-line">
          {projects.map((p, i) => {
            const isActive = i === project;
            return (
              <li key={p.slug} className="border-b border-line">
                <button
                  type="button"
                  onClick={() => setProject(i)}
                  onMouseEnter={() => setProject(i)}
                  onFocus={() => setProject(i)}
                  aria-pressed={isActive}
                  className={`group flex w-full items-center gap-4 py-3.5 text-left transition-colors ${
                    isActive ? "text-fg" : "text-muted hover:text-fg"
                  }`}
                >
                  <span className="w-6 text-xs font-bold tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  <span className="flex-1 font-display text-lg font-semibold tracking-tight md:text-xl">{p.title}</span>
                  <span className="hidden text-xs font-semibold sm:inline">
                    {t(p.kind === "personal" ? ui.work.personal : ui.work.client)}
                  </span>
                  <span
                    aria-hidden
                    className={`h-px bg-accent transition-all duration-500 ${isActive ? "w-8" : "w-0"}`}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </Item>

      <Item className="mt-6 min-h-[200px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active.slug}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3, ease }}
          >
            <p className="text-xs font-bold tracking-wider text-muted uppercase tabular-nums">{active.period}</p>
            <p className="mt-2 leading-relaxed text-muted">{t(active.summary)}</p>
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {active.stack.map((s) => (
                <li key={s}>
                  <TechBadge name={s} size="sm" />
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href={`/work/${active.slug}`}
                className="group inline-flex items-center gap-1.5 rounded-full bg-fg px-4 py-2 text-sm font-bold text-bg transition-opacity hover:opacity-85"
              >
                {t(ui.work.caseStudy)}
                <ArrowUpRight width={15} height={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              {active.links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-line-strong px-4 py-2 text-sm font-bold transition-colors hover:bg-fg/5"
                >
                  {t(l.label)}
                  <ArrowUpRight width={15} height={15} />
                </a>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </Item>

      <Item>
        <a
          href={profile.github}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-fg"
        >
          <GitHub width={15} height={15} />
          {t(ui.work.more)}
        </a>
      </Item>
    </div>
  );
}

/* ---------- 05 Skills ---------- */

export function Skills() {
  const t = useT();
  return (
    <div className="max-w-2xl">
      <Heading kicker={t(ui.skills.kicker)} title={t(ui.skills.title)} lead={t(ui.skills.lead)} />
      <div className="mt-8 grid gap-x-8 gap-y-6 sm:grid-cols-2">
        {skillGroups.map((g) => (
          <Item key={g.title.en}>
            <p className="text-xs font-bold tracking-wider text-muted uppercase">{t(g.title)}</p>
            <ul className="mt-2.5 flex flex-wrap gap-1.5">
              {g.items.map((s) => (
                <li key={s}>
                  <TechBadge name={s} size="sm" />
                </li>
              ))}
            </ul>
          </Item>
        ))}
        <Item className="sm:col-span-2">
          <p className="text-xs font-bold tracking-wider text-accent uppercase">{t(ui.skills.learning)}</p>
          <ul className="mt-2.5 flex flex-wrap gap-1.5">
            {learning.map((s) => (
              <li key={s} className="opacity-75">
                <TechBadge name={s} size="sm" />
              </li>
            ))}
          </ul>
        </Item>
      </div>
    </div>
  );
}

/* ---------- 06 Contact ---------- */

export function Contact() {
  const t = useT();
  const [copied, setCopied] = useState(false);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  }

  const rows = [
    { icon: <Phone width={16} height={16} />, label: t(ui.contact.phone), value: profile.phone, href: profile.phoneHref },
    { icon: <MapPin width={16} height={16} />, label: t(ui.contact.location), value: t(profile.location) },
    { icon: <LinkedIn width={16} height={16} />, label: "LinkedIn", value: profile.linkedinLabel, href: profile.linkedin },
    { icon: <GitHub width={16} height={16} />, label: "GitHub", value: `github.com/${profile.githubHandle}`, href: profile.github },
  ];

  return (
    <div className="flex w-full max-w-xl flex-col">
      <Heading kicker={t(ui.contact.kicker)} title={t(ui.contact.title)} lead={t(ui.contact.text)} />
      <Item className="mt-8 flex flex-wrap items-center gap-3">
        <a
          href={`mailto:${profile.email}`}
          className="font-display text-[clamp(1.15rem,2.2vw,1.75rem)] font-semibold tracking-tight break-all underline decoration-line-strong decoration-2 underline-offset-8 transition-colors hover:text-accent hover:decoration-accent"
        >
          {profile.email}
        </a>
        <button
          type="button"
          onClick={copyEmail}
          className="inline-flex items-center gap-1.5 rounded-full border border-line-strong px-3 py-1.5 text-xs font-bold transition-colors hover:bg-fg/5"
        >
          {copied ? <Check width={14} height={14} className="text-accent" /> : <Copy width={14} height={14} />}
          {t(copied ? ui.contact.copied : ui.contact.copy)}
        </button>
      </Item>
      <Item className="mt-9 grid gap-3 sm:grid-cols-2">
        {rows.map((r) => {
          const body = (
            <>
              <span className="grid size-9 shrink-0 place-items-center rounded-full border border-line text-muted">{r.icon}</span>
              <span className="min-w-0">
                <span className="block text-xs font-bold tracking-wider text-muted uppercase">{r.label}</span>
                <span className="block truncate text-sm font-semibold">{r.value}</span>
              </span>
            </>
          );
          const cls = "flex items-center gap-3 rounded-2xl border border-line bg-bg-elev/40 p-3 backdrop-blur-sm";
          return r.href ? (
            <a key={r.label} href={r.href} target={r.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className={`${cls} transition-colors hover:border-line-strong`}>
              {body}
            </a>
          ) : (
            <div key={r.label} className={cls}>
              {body}
            </div>
          );
        })}
      </Item>
      <Item className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line pt-5 text-xs text-muted">
        <span>
          © {new Date().getFullYear()} {profile.nickname}
        </span>
        <LocalTime />
        <span>{t(ui.footer.built)}</span>
      </Item>
    </div>
  );
}
