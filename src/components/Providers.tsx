"use client";

import { MotionConfig } from "motion/react";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Lang, Localized } from "@/content/site";

type Theme = "light" | "dark";

/** Where the theme toggle was pressed, in screen 0..1 coordinates with y going up (as in the sky shader). */
export type Point = { x: number; y: number };

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  theme: Theme;
  /** Pass the toggle's position so the new theme can spread out from it. */
  toggleTheme: (origin?: Point) => void;
  themeOrigin: Point;
};

/** Briefly add a class to <html> so CSS can animate the switch, then remove it. */
function flashClass(name: string, ms: number) {
  const root = document.documentElement;
  root.classList.add(name);
  window.setTimeout(() => root.classList.remove(name), ms);
}

const SiteContext = createContext<Ctx | null>(null);

const LANG_KEY = "lang";
const THEME_KEY = "theme";

function save(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Private mode or blocked storage: the choice just won't persist.
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [theme, setTheme] = useState<Theme>("dark");
  const [themeOrigin, setThemeOrigin] = useState<Point>({ x: 0.9, y: 0.95 });

  // The inline script in layout.tsx already applied the saved values to <html>.
  useEffect(() => {
    const root = document.documentElement;
    setTheme(root.classList.contains("dark") ? "dark" : "light");
    setLangState(root.lang === "vi" ? "vi" : "en");
  }, []);

  const setLang = useCallback((l: Lang) => {
    flashClass("lang-switching", 700);
    setLangState(l);
    document.documentElement.lang = l;
    save(LANG_KEY, l);
  }, []);

  const toggleTheme = useCallback((origin?: Point) => {
    if (origin) setThemeOrigin(origin);
    flashClass("theme-switching", 1200);
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      document.documentElement.classList.toggle("dark", next === "dark");
      document.documentElement.style.colorScheme = next;
      save(THEME_KEY, next);
      return next;
    });
  }, []);

  return (
    <SiteContext.Provider value={{ lang, setLang, theme, toggleTheme, themeOrigin }}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </SiteContext.Provider>
  );
}

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used inside <Providers>");
  return ctx;
}

/** Returns a translator for the current language: t(ui.hero.intro). */
export function useT() {
  const { lang } = useSite();
  return useCallback((s: Localized) => s[lang], [lang]);
}

/** Runs before React hydrates so there is no flash of the wrong theme or language. */
export const bootScript = `(function(){try{var d=document.documentElement;var t=localStorage.getItem('${THEME_KEY}');if(!t){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}d.classList.toggle('dark',t==='dark');d.style.colorScheme=t;var l=localStorage.getItem('${LANG_KEY}');if(l==='vi'||l==='en'){d.lang=l}}catch(e){document.documentElement.classList.add('dark')}})();`;
