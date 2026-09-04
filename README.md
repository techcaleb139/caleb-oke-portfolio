# Caleb Oke — AI automation portfolio

An evidence-first portfolio. Each project is documented with what worked, what
the numbers were, and what is not yet proven.

- Production: `https://caleb-oke-portfolio.vercel.app/`
- Case studies: `/projects/<slug>`

## Stack

Vite 8 + React 19 + TypeScript. **Not Next.js** — there is no `next` dependency
and never has been, so `next/image`, `next/font` and the App Router do not
apply here.

A custom Vite plugin in `vite.config.vercel.ts` server-renders the homepage and
every case study to static HTML at build time and inlines the CSS. The site
therefore works with JavaScript disabled for everything except form submission.

One serverless function, `api/contact.ts`, handles the contact form.

## Projects are content files

Projects live in `src/content/projects/`, one TypeScript file per project.
There is no CMS and no database read at runtime.

### Adding a project

1. Copy an existing file in `src/content/projects/` and rename it to your slug.
2. Edit the fields. `slug` must match the filename and is the URL.
3. Drop images into `public/images/`.
4. Add the file to the array in `src/content/projects/index.ts`.
5. If an image needs resized webp, add it to `imageRecipes` in
   `lib/image-sizes.ts` with the width ladder for its slot.
6. `npm run build` to check, then commit.

The homepage maps over the directory, so the layout works with two projects or
six without touching layout code. The case study route, sitemap entry and
social metadata are generated from the same file.

Offer cards work the same way, in `src/content/offers.ts`.

## Images

Source images are committed to `public/images/`. Resized webp variants are
**generated at build time** by `scripts/generate-images.ts` using sharp, and
written to `public/images/generated/`.

**`public/images/generated/` is gitignored and must not be committed.** It is
rebuilt on every deploy. Encoding is skipped when a variant is already newer
than its source, so warm rebuilds cost nothing.

sharp is a devDependency and is imported only by the Vite config, so it never
reaches the client bundle. Two consequences worth knowing:

- Every Vercel build regenerates the variants and so depends on sharp
  installing its native binaries. **If a production build fails, check the
  install step for sharp before looking at application code.**
- Because sharp is a devDependency, this relies on Vercel installing
  devDependencies. It does by default, but setting `NODE_ENV=production` in the
  Vercel environment would skip them and break the build at config import.

Width ladders and the layout maths behind them are documented in
`lib/image-sizes.ts` and in `DESIGN.md`.

## Contact form

Three fields: name, contact (email or WhatsApp), and a description of the work.

`api/contact.ts` was deliberately left unmodified during the redesign. It
already treated `business` and `outcome` as optional, so the three-field form
needed no route change and the shape of what reaches Neon is unchanged.

The reply contact is **not** a column. It is prefixed into the `workflow`
column as `Reply contact: <value>\n\n<description>`, which is what the n8n
workflow parses. Do not change that format without checking n8n first.

Spam protection is a `website` honeypot field plus a same-origin check on the
request. Submissions land in the Neon `contact_submissions` table with
`status = 'pending'`; n8n watches the table and sends the Telegram alert. No
application code calls Telegram.

Three tests in `tests/contact-endpoint.test.mjs` guard the route's field names,
insert columns and honeypot behaviour.

## Local development

```bash
npm install
npm run dev
```

Use `vercel dev` to exercise the API route locally.

## Quality checks

```bash
npm run lint
npm test          # builds, then runs 35 tests
npx tsc --noEmit
```

## Required Vercel environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Neon connection string, used by the contact form |

That is the only one still in use. `CMS_ADMIN_EMAIL`,
`CMS_ADMIN_PASSWORD_HASH`, `CMS_DUMMY_PASSWORD_HASH`, `CMS_RATE_LIMIT_SECRET`,
`BLOB_READ_WRITE_TOKEN` and `VERCEL_DEPLOY_HOOK_URL` belonged to the removed
CMS and can be deleted from the Vercel project.

## Database

The contact form writes to the existing Neon `contact_submissions` table. Its
schema is not in this repository and is not managed here.

There is no other database use. The `projects` tables and their migration
scripts were removed in 07f98e5; projects are TypeScript content files.

## Hosting

Configured only for the existing Vercel project.
