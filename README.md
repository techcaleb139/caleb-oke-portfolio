# Caleb Oke — AI Automation Portfolio

An evidence-first portfolio and private publishing system for Caleb Oke. The public site presents practical automation work with observed results, known limits, and next tests. The private CMS manages project cards and full Markdown case studies.

## Public site

- Production homepage: `https://caleb-oke-portfolio.vercel.app/`
- Case studies: `/projects/<project-slug>`
- Project data API: `/api/projects`
- Contact form submissions continue to use the existing Neon `contact_submissions` table.

## Private publishing desk

Open `/admin` on the deployed Vercel site. The admin area supports:

- private drafts, publishing, unpublishing, archiving, and confirmed permanent deletion;
- all homepage card fields and full Markdown case-study content;
- project image uploads through Vercel Blob, with an HTTPS URL fallback;
- search metadata, display order, and homepage visibility;
- a publish checklist, optimistic version checks, and an audit trail;
- password rotation and eight-hour secure sessions.

When published content changes, existing public pages read the update from Neon immediately. A Vercel Deploy Hook is still required to automatically rebuild crawler-ready HTML, the sitemap, and a route for a brand-new project slug. Until that hook is configured, run a production Vercel deployment after publishing a new project.

### Using the CMS

1. Open `https://caleb-oke-portfolio.vercel.app/admin` and sign in with the private access details generated in `.cms-private/CMS_ADMIN_ACCESS.txt`.
2. Select an existing project or choose **New project**.
3. Save incomplete work as a private draft. Drafts never appear on the public portfolio.
4. Complete the publish checklist, review the Markdown preview, and choose **Publish project**.
5. Use **Move back to draft** to hide a published project or **Move to archive** before permanent deletion.
6. Change the temporary administrator password from the **Security** page after the first sign-in.

## Local development

```bash
npm install
npm run dev
```

Use `vercel dev` when testing the API routes locally.

## Required Vercel environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Neon connection string used by the CMS and contact form |
| `CMS_ADMIN_EMAIL` | Lowercase administrator email |
| `CMS_ADMIN_PASSWORD_HASH` | Scrypt password hash; never store a plain password here |
| `CMS_DUMMY_PASSWORD_HASH` | Hash used to keep failed-login timing consistent |
| `CMS_RATE_LIMIT_SECRET` | Random secret used to hash login identities |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token for project image uploads |
| `VERCEL_DEPLOY_HOOK_URL` | Vercel Deploy Hook used after publishing changes |

Generate the CMS secrets locally with `npm run cms:credentials`. The output directory is ignored by Git. Move the generated environment values into Vercel, keep the temporary password private, and delete the local access file after changing the password in `/admin`.

## Database migration

`migrations/001_create_projects.sql` is the historical, incomplete migration Antigravity applied before the requested review pause. It is preserved exactly for traceability and must not be run again.

`migrations/002_upgrade_projects_cms.sql` is the reviewed corrective migration. It renames the incomplete table to `projects_legacy_001`, creates the complete project, administrator, session, rate-limit, and audit schema, and imports any legacy rows as private drafts for manual review. It runs inside one transaction through `scripts/migrate-cms.mjs`, so a failed step rolls the whole upgrade back. The normal website and `/admin` never create or alter database tables.

The corrective migration was approved and applied to the configured Neon database on 28 August 2026. The legacy table was empty and remains preserved as `projects_legacy_001`. The reviewed schema, one administrator account, and two published project records were verified after migration.

The migration runner is idempotent for the reviewed schema: it inspects the current columns before doing anything and skips schema changes when the upgrade is already present.

## Quality checks

```bash
npm run lint
npm test
```

The build generates static HTML for the homepage and every published case study, then creates the current sitemap. Admin pages are marked `noindex`.

## Hosting

This repository is configured only for the existing Vercel project. It contains no ChatGPT, OpenAI Sites, Cloudflare Worker, or Next.js hosting scaffold.
