"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { profile, sections } from "@/content/site";
import { Download, Moon, Sun } from "./icons";
import { useSite, useT } from "./Providers";

type Props = {
  /** Index of the active section on the home page. */
  active?: number;
  /** When given, links switch sections in place instead of navigating. */
  onGo?: (index: number) => void;
};

export function Nav({ active, onGo }: Props) {
  const t = useT();
  const { lang, setLang, theme, toggleTheme } = useSite();

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <nav className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 md:px-10">
        <Link
          href="/"
          onClick={(e) => {
            if (!onGo) return;
            e.preventDefault();
            onGo(0);
          }}
          className="text-lg font-extrabold tracking-[-0.03em]"
        >
          {profile.brand}
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {sections.slice(1).map((s, i) => {
            const index = i + 1;
            const isActive = active === index;
            return (
              <li key={s.id}>
                <a
                  href={`/#${s.id}`}
                  onClick={(e) => {
                    if (!onGo) return;
                    e.preventDefault();
                    onGo(index);
                  }}
                  aria-current={isActive ? "true" : undefined}
                  className={`relative px-3 py-2 text-sm font-semibold transition-colors ${
                    isActive ? "text-fg" : "text-muted hover:text-fg"
                  }`}
                >
                  {t(s.label)}
                  {isActive && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute inset-x-3 -bottom-0.5 h-px bg-accent"
                      transition={{ type: "spring", stiffness: 420, damping: 36 }}
                    />
                  )}
                </a>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <div role="group" aria-label="Language" className="flex rounded-full border border-line p-0.5 text-xs font-bold">
            {(["en", "vi"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                aria-pressed={lang === l}
                className={`rounded-full px-2.5 py-1 uppercase transition-colors ${
                  lang === l ? "bg-fg text-bg" : "text-muted hover:text-fg"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            className="grid size-8 place-items-center rounded-full border border-line text-muted transition-colors hover:text-fg"
          >
            {theme === "dark" ? <Sun width={15} height={15} /> : <Moon width={15} height={15} />}
          </button>
          <a
            href={t(profile.cv)}
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-1.5 rounded-full bg-fg px-3.5 py-1.5 text-xs font-bold text-bg transition-opacity hover:opacity-85 sm:inline-flex"
          >
            <Download width={14} height={14} />
            CV
          </a>
        </div>
      </nav>
    </header>
  );
}
