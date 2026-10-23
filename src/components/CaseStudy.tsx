"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { getProject, projects } from "@/content/projects";
import { ui } from "@/content/site";
import { ArrowLeft, ArrowUpRight } from "./icons";
import { ProjectVisual } from "./ProjectVisual";
import { Reveal } from "./Reveal";
import { TechBadge } from "./TechBadge";
import { useT } from "./Providers";

const ease = [0.22, 1, 0.36, 1] as const;

export function CaseStudy({ slug }: { slug: string }) {
  const t = useT();
  const project = getProject(slug);
  if (!project) return null;

  const index = projects.findIndex((p) => p.slug === slug);
  const next = projects[(index + 1) % projects.length];

  return (
    <article className="relative px-5 pt-32 pb-24 md:px-10 md:pt-40">
      <div className="mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, ease }}>
          <Link href="/#work" className="inline-flex items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-fg">
            <ArrowLeft width={15} height={15} />
            {t(ui.caseStudy.back)}
          </Link>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.9, delay: 0.05, ease }}
          className="mt-8 font-display text-[clamp(2.5rem,6vw,5rem)] leading-[0.98] font-bold tracking-[-0.03em]"
        >
          {project.title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease }}
          className="mt-6 max-w-2xl text-lg leading-relaxed text-muted"
        >
          {t(project.summary)}
        </motion.p>

        <motion.dl
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.3 }}
          className="mt-10 grid gap-3 sm:grid-cols-3"
        >
          {[
            { k: t(ui.caseStudy.role), v: <span className="font-semibold">{t(project.role)}</span> },
            { k: t(ui.caseStudy.year), v: <span className="font-semibold tabular-nums">{typeof project.period === "string" ? project.period : t(project.period)}</span> },
            {
              k: t(ui.caseStudy.stack),
              v: (
                <span className="flex flex-wrap gap-1.5">
                  {project.stack.map((s) => (
                    <TechBadge key={s} name={s} size="sm" />
                  ))}
                </span>
              ),
            },
          ].map((row) => (
            <div key={row.k} className="rounded-2xl border border-line bg-bg-elev/50 p-4 backdrop-blur-sm">
              <dt className="text-xs font-bold tracking-wider text-muted uppercase">{row.k}</dt>
              <dd className="mt-2">{row.v}</dd>
            </div>
          ))}
        </motion.dl>

        {project.links.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-3">
            {project.links.map((l, i) => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className={`group inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition-transform hover:-translate-y-0.5 ${
                  i === 0 ? "bg-fg text-bg" : "border border-line-strong"
                }`}
              >
                {t(l.label)}
                <ArrowUpRight width={16} height={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.35, ease }}
          className="group relative mt-14 aspect-16/10 overflow-hidden rounded-3xl border border-line bg-[#0c0c12] md:aspect-21/9"
        >
          <div
            aria-hidden
            className="absolute inset-0"
            style={{ background: `radial-gradient(70% 70% at 50% 110%, ${project.accent}55, transparent 70%)` }}
          />
          <div className="relative h-full">
            <ProjectVisual project={project} />
          </div>
        </motion.div>

        <div className="mt-20 grid gap-14 md:mt-28">
          <Section label={t(ui.caseStudy.problem)}>
            <p className="font-display text-xl leading-snug font-medium text-balance md:text-3xl">{t(project.problem)}</p>
          </Section>

          <Section label={t(ui.caseStudy.built)}>
            <ol className="space-y-5">
              {project.built.map((b, i) => (
                <li key={b.en}>
                  <Reveal delay={i * 0.05} className="flex gap-5 border-t border-line pt-5">
                    <span className="pt-0.5 text-sm font-bold text-accent tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                    <p className="leading-relaxed md:text-lg">{t(b)}</p>
                  </Reveal>
                </li>
              ))}
            </ol>
          </Section>

          <Section label={t(ui.caseStudy.learned)}>
            <p className="leading-relaxed text-muted md:text-lg">{t(project.learned)}</p>
          </Section>
        </div>

        <Link href={`/work/${next.slug}`} className="group mt-24 block border-t border-line pt-8">
          <p className="text-sm font-semibold text-muted">{t(ui.caseStudy.next)}</p>
          <p className="mt-3 flex items-center justify-between gap-6 font-display text-3xl font-bold tracking-tight transition-colors group-hover:text-accent md:text-6xl">
            {next.title}
            <ArrowUpRight width={44} height={44} className="shrink-0 transition-transform duration-500 group-hover:rotate-45" />
          </p>
        </Link>
      </div>
    </article>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Reveal>
      <section className="grid gap-5 md:grid-cols-12 md:gap-8">
        <h2 className="text-xs font-bold tracking-widest text-muted uppercase md:col-span-3 md:pt-2">{label}</h2>
        <div className="md:col-span-9">{children}</div>
      </section>
    </Reveal>
  );
}
