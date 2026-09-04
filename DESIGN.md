---
name: Caleb Oke Portfolio
description: A quiet, evidence-first portfolio for practical automation work. Five colours, two typefaces, no ornament.
colors:
  bg: "#FAF8F4"
  text: "#1A1917"
  muted: "#6B6A64"
  border: "#E5E2DA"
  accent: "#14584A"
fonts:
  display: Instrument Serif
  body: Public Sans
---

# Design system: Caleb Oke portfolio

This documents the **locked** system. The source of truth for every value is
`design-reference/homepage-full.html`, the design export. It is gitignored
because it is a 6MB bundle; Caleb holds it locally.

Where this document and the code disagree, the code in `src/styles/tokens.css`
wins, and this document is out of date.

## The five colours

These five are the entire palette. **No other colour value appears anywhere in
the codebase** — not in CSS, not in JSON, not in an SVG.

| Token | Value | Use |
| --- | --- | --- |
| `--bg` | `#FAF8F4` | Page background. Nothing else. |
| `--text` | `#1A1917` | All body text, all headings, always. |
| `--muted` | `#6B6A64` | Captions and metadata only. Never a sentence. |
| `--border` | `#E5E2DA` | Hairlines and image outlines. |
| `--accent` | `#14584A` | Anchors, buttons, the status badge, focus rings. |

### Rules that are enforced by tests

- **Body text is always `var(--text)`.** A global rule sets it. If you find
  yourself colouring a word inside a sentence, that is a bug.
- **The accent is permitted only** on anchors, buttons, the status badge and
  focus rings.
- `--muted` is for captions and metadata, never for prose. It is the token
  most likely to be misused as "quieter body text".

Two tests guard this, both in `tests/rendered-html.test.mjs`:

- `the inlined stylesheet uses only the five palette colours` — parses every
  hex and functional colour out of the inlined CSS.
- `manifest.json uses only the five palette colours` — the stylesheet check
  cannot see JSON. This one exists because `manifest.json` kept `#05080d`
  from the previous design long after everything else had changed, and it
  paints Android browser chrome and the install splash screen.

**Contrast against `--bg`**, all passing WCAG AA for normal text:

| Pair | Ratio |
| --- | --- |
| `--text` on `--bg` | 16.6:1 |
| `--accent` on `--bg` | 7.8:1 |
| `--muted` on `--bg` | 5.1:1 |

`--muted` is the one to re-check if it ever moves. It has the least headroom,
and it is used at 13px where AA still only requires 4.5:1.

## Typography

**Instrument Serif** for headings, **Public Sans** for body and UI. Both are
self-hosted from `public/fonts/` as woff2 subsets.

Self-hosting is not a preference here, it is a requirement: `vercel.json` sets
a Content Security Policy of `font-src 'self' data:`, so Google Fonts is
blocked at the browser level. A `<link>` to `fonts.googleapis.com` would fail
silently in production.

Both latin subsets are preloaded in `index.html` and declared
`font-display: swap`.

Base body text is **17px / 1.6**, with prose capped at **66ch** (`--measure`).
The 66ch cap comes from the reference; the original brief said roughly 68.

The full scale lives in `src/styles/tokens.css` with a mobile override at
`max-width: 720px`. Headings run `60 / 40 / 34 / 22` on desktop and
`38 / 30 / 24 / 19` on mobile.

## Layout

| Token | Desktop | ≤720px |
| --- | --- | --- |
| `--page` | 1120px | — |
| `--col` | 900px | — |
| `--col-narrow` | 640px | — |
| `--gutter` | 64px | 20px |
| `--section-y` | 80px | 40px |
| `--card-pad` | 40px | 20px |

## Image slots and the width maths

**This is the part most likely to rot.** The webp width ladders in
`lib/image-sizes.ts` are derived from `--col`, `--gutter` and `--card-pad`.
Change any of those three and the ladders are silently wrong — the images will
still render, they will just be the wrong size, and nothing will fail.

The derivation, with `box-sizing: border-box` throughout:

```
card inner width  = --col − 2 × --card-pad   = 900 − 80  = 820px   (desktop, capped)
                  = viewport − 2×64 − 2×40   = vw − 208            (720–1028px band)
                  = viewport − 2×20 − 2×20   = vw − 80             (≤720px)
```

**820px is the widest any full-width slot ever renders.** Every ladder is built
from that number.

| Slot | Rendered width | Widths generated |
| --- | --- | --- |
| Video thumbnail, order sheet, job pipeline canvas | 820px | 400, 820, 1232, 1640 |
| Restaurant canvas (`2.37fr` of the evidence grid) | 560px desktop, 640px mobile | 320, 640, 960, 1280 |
| Telegram alert (pinned by `maxWidth: 270px`) | 270px | 270, 591 |
| Vapi transcript | 236px slot × 3.7 zoom = 874px drawn | 960, 1919 |

Two notes on the last two rows:

- The **restaurant canvas gets wider on mobile**, not narrower: the evidence
  grid collapses to one column below 720px, so 640 is the worst case, not 560.
- The **transcript** renders as a zoomed CSS background, which cannot use
  `sizes`. It uses `image-set()` at 1x and 2x behind an `@supports` guard, with
  the original PNG as the declared fallback. It is the only image where mobile
  downloads more than desktop.

Fixed aspect ratios, so a screenshot can never letterbox or crop badly:

| Ratio token | Value | Used by |
| --- | --- | --- |
| `--ratio-wide` | 16 / 9 | n8n canvases, video thumbnail |
| `--ratio-sheet` | 1917 / 937 | order sheet, its native ratio |
| `--ratio-transcript` | 3 / 4 | Vapi transcript |
| `--ratio-phone` | 9 / 16 | Telegram alert |
| `--ratio-portrait` | 4 / 5 | portrait |

Every image slot carries a thin `--border` outline, a `--muted` caption
underneath, and explicit `width`/`height` so nothing shifts as it loads.

## Constraints

**Do not add:**

- **Gradients.** Anywhere.
- **Shadows.** No `box-shadow`, no `text-shadow`, no elevation.
- **Icon grids.** No icon sets, no decorative glyphs. The funnel diagram is
  explicitly icon-free.
- **Generated imagery.** No illustrations, no stock photography, no AI images.
  Every image on the site is a screenshot of something that actually ran, or a
  photograph of Caleb.
- **Chart libraries.** The funnel is four numbers in a CSS grid with hairline
  borders. No bars, no SVG chart, no dependency.
- **A sixth colour.** Including in JSON, SVG or an inline style.
- **Border radius.** Every corner on the site is square.

**Do:**

- Reach for a hairline `--border` rule before reaching for a container.
- Let whitespace do the separating.
- Set numbers in Instrument Serif and their labels in muted Public Sans.
- Keep the accent rare. It should read as a signal, not as decoration.

## Accessibility

- Every interactive element has a visible focus ring in `--accent`. Default
  outlines are never removed without a replacement.
- Heading levels run in order, no skipped levels. Tested.
- Every image has alt text describing what the screenshot shows, never
  "screenshot". Tested.
- The mobile menu is a `<details>` element, so it opens without JavaScript.
- The site works with JavaScript disabled for everything except form
  submission. Pages are prerendered to static HTML at build time.
