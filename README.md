# Portfolio — Bùi Hoàng Phi

Personal site of a front-end developer in Ho Chi Minh City. A one-page site: on desktop each scroll switches to the next full-screen section while a 3D cartoon of me (built from primitives in `src/components/scene/Character.tsx`, no model file) follows the cursor, then moves to a desk and types; the monitor shows the selected project. Small and touch screens, and reduced-motion users, get normal scrolling. Bilingual (English / Tiếng Việt), dark and light themes, a case study page per project.

**Stack:** Next.js (App Router) · TypeScript · Tailwind CSS v4 · Motion · three.js (react-three-fiber, drei)

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Edit the content

All text lives in two files, so you never need to touch the components to update the site:

| File | What it holds |
| --- | --- |
| `src/content/site.ts` | Name, email, links, UI strings, experience, education, stack |
| `src/content/projects.ts` | Projects and their case studies |

Every string has an `en` and a `vi` version. To add a project, append an object to `projects` in `projects.ts`; its page at `/work/<slug>` is generated automatically.

The CV is served from `public/cv.pdf`. The 3D scene lives in `src/components/scene/` (`Scene.tsx` for layouts per section, `textures.ts` for the screens and logos).

## Structure

```
src/
  app/
    layout.tsx           fonts, metadata, theme/language boot script
    page.tsx             home: hero, work, experience, stack, contact
    work/[slug]/page.tsx case study pages (statically generated)
    sitemap.ts, robots.ts
  components/            one file per section, plus small shared pieces
  content/               site.ts and projects.ts
```

## Details

- Theme and language are saved in `localStorage` and applied by a small inline script before the first paint, so there is no flash of the wrong theme.
- Animations respect `prefers-reduced-motion`.
- Project illustrations are drawn with HTML and SVG, so there are no screenshots to keep up to date.
- Every page is static (`next build` prerenders them all).

## Deploy

Push to GitHub, then import the repo on [Vercel](https://vercel.com/new). No environment variables are needed. After the first deploy, update `siteUrl` in `src/content/site.ts` to the real domain.
