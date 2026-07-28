# Portfolio — Cherry Sebastian

A single-page portfolio site: React + TypeScript + Tailwind CSS + Framer Motion
+ Lucide React, built with Vite. Dark theme on `#0C0C0C`, Kanit throughout.

## Running

```bash
cd portfolio
npm install
npm run dev      # http://localhost:5173
npm run build    # static output in dist/
npm run preview  # serve the build
```

`vite.config.ts` sets `base: './'`, so `dist/` works from a domain root or from
a project sub-path (GitHub Pages, a nested static host) without further config.

## Adding the headshot

The hero expects an image at `public/portrait.png`. Drop the file in and it
appears automatically — no code change needed. A cut-out on a transparent
background works best, since the hero applies a glow behind the subject and
fades the base of the image into the page.

Until that file exists the hero falls back to a monogram card, so nothing
renders broken. To use a different filename or format, change `profile.portrait`
in `src/data/profile.ts`.

## Editing the content

All copy lives in `src/data/profile.ts` — contact details, the about paragraph,
capabilities, roles, education, projects, certifications and the skills
marquee. Components read from it, so content changes never require touching
JSX.

## Layout

- `src/App.tsx` — section order
- `src/sections/`
  - `HeroSection` — nav, fitted heading, tagline, magnetic portrait
  - `MarqueeSection` — two skill rows that scroll horizontally with the page
  - `AboutSection` — goals and aspirations, character-by-character reveal
  - `ExperienceSection` — roles and education
  - `CapabilitiesSection` — the white "What I Do" list
  - `ProjectsSection` — sticky cards that scale down as they stack
  - `CertificationsSection` — certification grid
  - `ContactSection` — contact links and footer
- `src/components/`
  - `FadeIn` — `whileInView` wrapper (delay / duration / x / y)
  - `FitText` — measures a line and scales it to span its container exactly
  - `Magnet` — cursor-following magnetic transform
  - `AnimatedText` — scroll-driven per-character opacity reveal
  - `Portrait` — hero image treatment with a monogram fallback
  - `DecorShape` — inline SVG decorative objects
  - `ContactButton`, `LiveProjectButton`

## Notes

- Kanit loads from Google Fonts. `FitText` re-measures on `document.fonts.ready`,
  so the hero heading stays flush once the webfont swaps in.
- `DecorShape` draws the About section's decorative objects as inline SVG rather
  than loading images, so the page has no third-party asset dependency beyond
  the font.
- Positioning and Framer Motion animation are kept on separate elements. Motion
  writes an inline `transform`, which would otherwise override Tailwind's
  `translate` utilities.
