---
name: Caleb Oke Portfolio
description: A light, professional service portfolio for practical automation work, grounded in real project evidence.
colors:
  canvas: "#f6f8fb"
  surface: "#ffffff"
  surface-quiet: "#eef3f8"
  ink: "#14213d"
  brand-navy: "#173a67"
  muted: "#526174"
  line: "#dbe3ec"
  line-strong: "#bdc9d8"
  action-blue: "#2f6fed"
  action-blue-hover: "#2458c7"
  action-blue-soft: "#eaf2ff"
  on-action: "#ffffff"
  success: "#137a4d"
  success-soft: "#e7f6ee"
  danger: "#b42318"
  danger-soft: "#fff0ee"
typography:
  family: "Segoe UI, Arial, sans-serif"
  hero:
    fontSize: "clamp(3rem, 5.2vw, 4rem)"
    lineHeight: 1.04
    letterSpacing: "-0.03em"
  section-title:
    fontSize: "clamp(2rem, 3.5vw, 3rem)"
    lineHeight: 1.06
    letterSpacing: "-0.03em"
  body:
    fontSize: "1rem"
    lineHeight: 1.7
rounded:
  control: "8px"
  panel: "12px"
  feature-card: "14px"
spacing:
  shell: "min(1120px, calc(100% - 48px))"
  section: "96px"
  section-mobile: "72px"
components:
  button:
    minHeight: "46px"
    padding: "0 18px"
    rounded: "8px"
  mobile-menu-control:
    minHeight: "44px"
  card:
    border: "1px solid #dfe4eb"
    rounded: "14px"
---

# Design System: Caleb Oke Portfolio

## Scope and intent

This document records the final shipped public portfolio in `components/Portfolio.tsx`, `components/ProjectDetail.tsx`, `src/index.css`, and `index.html`. It supersedes the earlier dark/mineral “commissioning dossier” direction for the public site, including its Archivo, Atkinson Hyperlegible, and Azeret Mono type roles, dark-mode palette, oversized editorial spacing, and single 8px container radius.

The shipped site is a straightforward professional portfolio. Its job is to explain what Caleb builds, show honest project evidence, describe his process, and make contact easy. It uses light neutral surfaces, ordinary system typography, one blue action color, compact sections, the unchanged portrait, and real project images. Copy is plain, specific, and careful about what has actually been built or tested.

## Public-site foundations

### Color

The public site is light-only (`color-scheme: light`). The palette is intentionally quiet:

- **Canvas — `#f6f8fb`:** the page background.
- **Surface — `#ffffff`:** cards, forms, the mobile menu, and alternating section bands.
- **Quiet surface — `#eef3f8`:** restrained supporting surfaces.
- **Ink — `#14213d`:** primary text.
- **Brand navy — `#173a67`:** section headings and primary actions.
- **Muted — `#526174`:** explanations, captions, labels, and metadata.
- **Line — `#dbe3ec`; strong line — `#bdc9d8`:** structure, separators, fields, and boundaries.
- **Action blue — `#2f6fed`:** links, process numbers, project status, focus, and active cues. Hover uses `#2458c7`; soft support uses `#eaf2ff` and `#f4f8ff`.
- **Success — `#137a4d`; danger — `#b42318`:** reserved for truthful form state, each with a pale supporting wash.

Blue communicates action or useful status. It is not a decorative wash, gradient, glow, or ambient brand effect. Success and danger colors are not category colors.

### Typography

All public typography uses the local system stack: `"Segoe UI", Arial, sans-serif`. There are no downloaded public-site fonts and no separate mono voice. Headings use the same family with weight, scale, tight leading, and `-0.03em` letter spacing to create hierarchy.

- **Hero:** `clamp(3rem, 5.2vw, 4rem)`, line-height `1.04`, held to about `14.5ch` on desktop. It becomes `clamp(2.45rem, 12vw, 3.2rem)` below 700px.
- **Section headings:** generally `clamp(2rem, 3.5vw, 3rem)` with line-height `1.06`.
- **Project-page title:** `clamp(2.5rem, 5vw, 4rem)` with line-height `1.03`.
- **Body:** normal system size with line-height `1.7`; supporting copy typically ranges from `0.84rem` to `0.94rem`.
- **Labels and metadata:** compact, usually `0.76rem` to `0.9rem`, and distinguished by weight rather than uppercase tracking or a specialist font.

Keep language direct and familiar: “View my projects,” “Contact me,” “What happened in testing,” and “What still needs work.” Claims must match the evidence. The restaurant voice assistant is described as an academy prototype; the job alert pipeline is described as a personal system run from Caleb’s computer.

### Layout and spacing

The main shell is `1120px` wide with 24px gutters (`calc(100% - 48px)`). At widths below 700px, gutters become 16px (`calc(100% - 32px)`). Standard sections use 96px vertical padding and reduce to 72px below 700px.

The home page follows a compact sequence:

1. Sticky navigation.
2. Two-column hero with direct service copy and portrait.
3. Automation services in an intro-and-table layout.
4. Two-column selected-project grid.
5. Four-step working process.
6. About section.
7. Contact methods and a review-before-submit brief form.
8. Compact footer.

The visual rhythm comes from grid alignment, one-pixel rules, controlled gaps, and alternating neutral surfaces. Do not reintroduce the previous 96–152px editorial section rhythm or broad dossier-style fields.

### Shape, borders, and depth

The shipped interface uses a small family of practical radii:

- **8px:** buttons, menu control, form fields, error summaries, code blocks, and skeletons.
- **12px:** project-page evidence panels and supporting project surfaces.
- **14px:** portrait, home project cards, and contact form.

Most separation is flat: a one-pixel line or a surface change. The shared shadow, `0 16px 42px rgba(26, 39, 63, .08)`, is limited to the mobile navigation panel and contact form. The sticky header uses a nearly opaque canvas with a 12px backdrop blur.

## Public components

### Navigation

The sticky desktop header is 70px high, with Caleb’s name and role on the left, plain section links, and a dark “Discuss a project” action. The project page uses the same shell with a “Start a project” action.

Below 700px, the role label is hidden and a bordered menu control appears. The control and every revealed navigation row have a minimum height of 44px. The menu opens as a full-width white panel directly below the 64px header. Preserve visible focus outlines and `aria-expanded`/`aria-controls` behavior.

### Buttons and links

Standard buttons are at least 46px high, use 18px horizontal padding, and have an 8px radius. Primary buttons and the compact header action use brand navy with white text, moving to action blue on hover. Secondary buttons use a white surface and strong neutral border, then a soft blue wash on hover. Active press scales to `0.98`; disabled actions retain their label and reduce opacity. All interactive elements use a visible three-pixel blue focus outline with three-pixel offset.

### Hero and portrait

The desktop hero is a weighted two-column grid: service statement and actions on the left, the real 4:5 portrait on the right. Its first sentence names the outcome—reducing repetitive work—before naming tools. The portrait caption confirms Caleb’s name, Nigeria location, and remote availability. Below 700px, the hero becomes one column and keeps the portrait after the copy.

### Services

Services are presented as three ruled rows rather than promotional cards. Each row names the service, explains who it fits, states the practical outcome, and lists relevant tools in blue. The structure is two columns on desktop and one column below 700px.

### Selected projects

The home page shows actual built and published projects in a two-column card grid. Each card includes a real project image, status, title, summary, what happened in testing, the next improvement Caleb would make, category, and a case-study link. The detailed case-study page still documents the current boundary beside the result and next improvement. Below 700px, the grid and evidence pair become single-column reading sequences.

### Working process

The process is a four-step ordered track: map the task, plan the rules, build a pilot, then test and hand over. It is a two-column ruled grid on larger screens and one column below 700px. Small blue counters support order without creating a separate decorative visual system.

### About

The About section pairs a short statement with the longer factual biography. A restrained 4:5 portrait sits directly below the statement rather than becoming a separate feature card: it is capped at 360px on larger screens, uses a quiet one-pixel border and 12px radius, and carries no caption or decorative treatment. The portrait may widen to 420px when the section stacks on smaller screens, while remaining subordinate to the written evidence.

### Contact and project brief

Direct email, WhatsApp, and LinkedIn options sit beside a structured brief form. Beneath those methods, “What happens next” is a plain three-item ordered list with compact outlined number markers; it explains the reply, scope confirmation, and paid-pilot sequence without turning the steps into cards or promotional milestones.

The initial form asks only for a name, a reply route, and a short description of the task or process. Name and reply route share a balanced desktop row. Business or team and desired result remain available inside one clearly labelled optional disclosure. Below 700px all fields use one-column document order. The form validates inline and provides an error summary linked to affected fields. Before submission, the user reviews the entered details and can edit, submit securely, copy the message, or send it through WhatsApp or email. Success and failure messages are live text, not color alone. The hidden honeypot and explicit review step are functional parts of the experience and should remain visually unobtrusive.

### Case-study pages

Each case-study page starts with a back link, factual summary, status/category/tools, optional repository or live-project links, and a real project image. The next section presents three equal desktop columns: result, current boundary, and next improvement.

The “How information moves” rail is the signature evidence structure. It is five equal columns on full desktop when a project provides five stages. At 900px it becomes two columns, and below 700px it becomes one stacked sequence. It is never a carousel. The narrative follows in a wide reading column with a sticky contact card; below 900px both become a single column and the contact card stops sticking.

## Responsive behavior

- **Above 900px:** retain the full desktop grids, including the five-column verification rail.
- **900px and below:** services, process, about, and the outer contact layout collapse to one column where specified; the contact form keeps its internal two-column field grid; the project hero and project narrative collapse; the verification rail becomes two columns; the project contact card becomes static.
- **700px and below:** use 16px shell gutters and 64px section padding; expose the mobile navigation; stack the hero, work grid, process, contact form fields, evidence structures, and project rail; keep menu rows at least 44px high.
- **430px and below:** make hero and project action buttons full width, simplify contact-method rows, stack card footers, and reduce the project title to `2.35rem`.

Responsive collapse must preserve the document order: explanation before proof, result before limitation, and system stages in sequence.

## Accessibility and motion

- Keep the skip link, semantic landmarks, ordered process and stage lists, useful alternative text, form labels, error summary, and live submission status.
- Preserve visible focus treatment across links, buttons, inputs, and textareas.
- Maintain 44px minimum mobile menu controls and navigation rows.
- Images use explicit dimensions; the portrait has responsive sources and high loading priority, while home project images lazy-load.
- Motion is limited to short color, border, press, menu, and loading-state transitions. When reduced motion is requested, smooth scrolling is removed and animation/transition duration is effectively disabled.

## Private CMS note

The private publishing interface inherits the same current color, typography, radius, and state tokens from `src/index.css`, but uses a deliberately tighter operator scale defined in `src/admin.css`. This admin guidance remains separate from the public page hierarchy:

- **Micro:** `0.7rem`.
- **Control:** `0.82rem`.
- **Body:** `0.95rem`.
- **Title:** `1.1rem`.
- **Mark:** `1.35rem`.
- **Page title:** `2.35rem`.
- **Display:** `2.85rem`.

Use these variables for dense revision, status, checklist, filter, form, editor, and security views. Do not apply the public hero scale to the publishing desk, and do not revive the obsolete Archivo/Atkinson/Azeret or dark-mineral public system in CMS documentation.

## Do and do not

### Do

- Use the light neutral palette, Segoe UI/Arial system stack, and `#2f6fed` action blue.
- Lead with plain descriptions of the work and outcome.
- Show real project images and state what testing demonstrated, what remains limited, and what should improve next.
- Keep sections compact, grids orderly, and dividers quiet.
- Keep the About portrait restrained beneath the statement, and keep the Contact follow-up sequence as a plain numbered list.
- Preserve the five-column desktop verification rail and its ordered responsive collapse.
- Keep focus visibility, reduced-motion support, semantic structure, and minimum mobile target sizes.

### Do not

- Reintroduce dark mode, mineral-themed naming, Archivo display type, Atkinson body type, or mono evidence labels on the public site.
- Present prototypes or personal systems as client deployments or production results.
- Replace evidence with generic AI imagery, decorative dashboards, gradients, glows, or pill badges.
- Separate a project result from the limitation that qualifies it.
- Turn the About portrait or “What happens next” sequence into promotional feature cards.
- Add ornamental animation or enlarge the section rhythm beyond the compact shipped layout.
