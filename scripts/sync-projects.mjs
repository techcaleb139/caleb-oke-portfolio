import { neon } from "@neondatabase/serverless";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const target = path.resolve("src/content/projects.generated.json");

if (!process.env.DATABASE_URL) {
  console.log("CMS sync: DATABASE_URL is not available, using the committed project snapshot.");
  process.exit(0);
}

try {
  const sql = neon(process.env.DATABASE_URL);
  const rows = await sql.query(`
    SELECT * FROM projects
    WHERE publication_status = 'published'
    ORDER BY sort_order, published_at DESC NULLS LAST
  `);
  if (!rows.length) {
    console.log("CMS sync: no published database projects found, using the committed project snapshot.");
    process.exit(0);
  }
  const projects = rows.map((row) => ({
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    summary: String(row.summary),
    statusLabel: String(row.status_label),
    category: String(row.category),
    publicationStatus: row.publication_status,
    layoutVariant: row.layout_variant,
    imageUrl: String(row.image_url || ""),
    imageAlt: String(row.image_alt || ""),
    imageCaption: String(row.image_caption || ""),
    repositoryUrl: String(row.repository_url || ""),
    liveUrl: String(row.live_url || ""),
    observedResult: String(row.observed_result),
    knownLimit: String(row.known_limit),
    nextTest: String(row.next_test),
    tools: Array.isArray(row.tools) ? row.tools : [],
    stages: Array.isArray(row.stages) ? row.stages : [],
    contentMarkdown: String(row.content_markdown),
    seoTitle: String(row.seo_title || ""),
    seoDescription: String(row.seo_description || ""),
    sortOrder: Number(row.sort_order),
    featured: Boolean(row.featured),
    version: Number(row.version),
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
    publishedAt: row.published_at ? new Date(row.published_at).toISOString() : null,
  }));
  await writeFile(target, `${JSON.stringify(projects, null, 2)}\n`, "utf8");
  console.log(`CMS sync: wrote ${projects.length} published project${projects.length === 1 ? "" : "s"}.`);
} catch (error) {
  console.warn(`CMS sync: database snapshot unavailable (${error instanceof Error ? error.message : "unknown error"}). Using the committed snapshot.`);
}
