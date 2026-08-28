import { neon } from "@neondatabase/serverless";
import { readFile } from "node:fs/promises";
import path from "node:path";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required to migrate the CMS.");
const sql = neon(process.env.DATABASE_URL);

async function tableExists(tableName) {
  const rows = await sql.query(
    `SELECT EXISTS (
       SELECT 1 FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = $1
     ) AS exists`,
    [tableName],
  );
  return Boolean(rows[0]?.exists);
}

async function projectColumns() {
  return await sql.query(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'projects'`,
  );
}

async function applyCorrectiveMigration() {
  const columns = new Set((await projectColumns()).map((row) => String(row.column_name)));
  if (columns.has("publication_status") && columns.has("version")) {
    console.log("Reviewed CMS schema already present; schema migration skipped.");
    return;
  }

  if (!columns.size) {
    throw new Error(
      "The projects table is missing. Stop and inspect the intended Neon database before applying any migration.",
    );
  }

  if (!columns.has("status") || !columns.has("workflow_image_url")) {
    throw new Error(
      "The projects table does not match either the historical or reviewed schema. No changes were made.",
    );
  }

  if (await tableExists("projects_legacy_001")) {
    throw new Error(
      "projects_legacy_001 already exists while projects still has the historical schema. No changes were made; inspect the database manually.",
    );
  }

  const migration = await readFile(path.resolve("migrations/002_upgrade_projects_cms.sql"), "utf8");
  const statements = migration
    .split(/^-- statement\s*$/m)
    .map((statement) => statement.replace(/^--.*$/gm, "").trim())
    .filter(Boolean);

  await sql.transaction(statements.map((statement) => sql.query(statement)));
  console.log("Corrective CMS migration applied; historical projects preserved as projects_legacy_001.");
}

await applyCorrectiveMigration();

const expectedTables = ["projects", "projects_legacy_001", "cms_admin_users", "cms_sessions", "cms_login_attempts", "cms_audit_log"];
for (const tableName of expectedTables) {
  if (!(await tableExists(tableName))) {
    throw new Error(`Migration verification failed: ${tableName} is missing.`);
  }
}

const projects = JSON.parse(await readFile(path.resolve("src/content/projects.generated.json"), "utf8"));
for (const project of projects) {
  await sql.query(
    `INSERT INTO projects (
      slug, title, summary, status_label, category, publication_status, layout_variant,
      image_url, image_alt, image_caption, repository_url, live_url, observed_result, known_limit,
      next_test, tools, stages, content_markdown, seo_title, seo_description, sort_order, featured, published_at
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16::jsonb,$17::jsonb,$18,$19,$20,$21,$22,
      CASE WHEN $6 = 'published' THEN now() ELSE NULL END)
    ON CONFLICT (slug) DO NOTHING`,
    [project.slug, project.title, project.summary, project.statusLabel, project.category, project.publicationStatus,
      project.layoutVariant, project.imageUrl, project.imageAlt, project.imageCaption, project.repositoryUrl,
      project.liveUrl, project.observedResult, project.knownLimit, project.nextTest, JSON.stringify(project.tools),
      JSON.stringify(project.stages), project.contentMarkdown, project.seoTitle, project.seoDescription,
      project.sortOrder, project.featured],
  );
}

if (process.env.CMS_ADMIN_EMAIL && process.env.CMS_ADMIN_PASSWORD_HASH) {
  await sql.query(
    `INSERT INTO cms_admin_users (email, password_hash) VALUES ($1, $2)
     ON CONFLICT (email) DO NOTHING`,
    [process.env.CMS_ADMIN_EMAIL.trim().toLowerCase(), process.env.CMS_ADMIN_PASSWORD_HASH],
  );
}

console.log(`CMS setup verified. Seeded ${projects.length} project snapshots without overwriting existing records.`);
