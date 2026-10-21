"use client";

import { profile, ui } from "@/content/site";
import { LocalTime } from "./LocalTime";
import { useT } from "./Providers";

export function Footer() {
  const t = useT();
  return (
    <footer className="border-t border-line px-4 py-8 md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <span>
          © {new Date().getFullYear()} {profile.nickname}
        </span>
        <span>{t(ui.footer.built)}</span>
        <span className="flex items-center gap-4">
          <LocalTime />
          <a
            href={`${profile.github}/portfolio`}
            target="_blank"
            rel="noreferrer"
            className="underline-offset-4 hover:text-fg hover:underline"
          >
            {t(ui.footer.source)}
          </a>
        </span>
      </div>
    </footer>
  );
}
