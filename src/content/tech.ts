import {
  siAngular,
  siCss,
  siDocker,
  siDotnet,
  siElementor,
  siExpo,
  siFigma,
  siGit,
  siGithub,
  siGithubactions,
  siGitlab,
  siGoogleplay,
  siHtml5,
  siJavascript,
  siJest,
  siLighthouse,
  siNextdotjs,
  siPagespeedinsights,
  siPhp,
  siPostman,
  siPuppeteer,
  siReact,
  siRedux,
  siSass,
  siTailwindcss,
  siTestinglibrary,
  siTypescript,
  siVercel,
  siVite,
  siWoocommerce,
  siWordpress,
  type SimpleIcon,
} from "simple-icons";

export type Tech = {
  name: string;
  /** SVG path on a 24×24 viewBox, from simple-icons. Missing = text-only badge. */
  path?: string;
  /** Brand colour. Very dark brands (Next.js, Vercel…) fall back to the text colour in dark mode. */
  hex?: string;
};

const from = (icon: SimpleIcon, name = icon.title): Tech => ({ name, path: icon.path, hex: `#${icon.hex}` });

/** Every technology mentioned on the site, keyed by the label used in content files. */
export const tech: Record<string, Tech> = {
  TypeScript: from(siTypescript),
  JavaScript: from(siJavascript),
  PHP: from(siPhp),
  HTML5: from(siHtml5),
  CSS: from(siCss),
  SCSS: from(siSass, "SCSS"),
  React: from(siReact),
  "React 18": from(siReact, "React 18"),
  "React Native": from(siReact, "React Native"),
  "Next.js": from(siNextdotjs),
  "Tailwind CSS": from(siTailwindcss),
  NativeWind: from(siTailwindcss, "NativeWind"),
  "Redux Toolkit": from(siRedux, "Redux Toolkit"),
  Vite: from(siVite),
  Expo: from(siExpo),
  "EAS Build": from(siExpo, "EAS Build"),
  "Google Play": from(siGoogleplay, "Google Play"),
  WordPress: from(siWordpress),
  WooCommerce: from(siWoocommerce),
  Elementor: from(siElementor),
  Lighthouse: from(siLighthouse),
  PageSpeed: from(siPagespeedinsights, "PageSpeed"),
  Puppeteer: from(siPuppeteer),
  Git: from(siGit),
  GitHub: from(siGithub),
  GitLab: from(siGitlab),
  "GitHub Actions": from(siGithubactions),
  Docker: from(siDocker),
  Figma: from(siFigma),
  Postman: from(siPostman),
  Vercel: from(siVercel),
  Angular: from(siAngular),
  Jest: from(siJest),
  "React Testing Library": from(siTestinglibrary, "React Testing Library"),
  ".NET": from(siDotnet, ".NET"),
};

export function getTech(name: string): Tech {
  return tech[name] ?? { name };
}

/** True when a brand colour would disappear on the dark background. */
export function isDarkBrand(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.08;
}
