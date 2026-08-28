import { neon } from "@neondatabase/serverless";
import type { PortfolioProject, ProjectInput } from "../../lib/project-types.js";
import { ApiError } from "./http.js";

type SqlClient = ReturnType<typeof neon>;

export function database(): SqlClient {
  if (!process.env.DATABASE_URL) {
    throw new ApiError(503, "The content database is not configured.", "database_unavailable");
  }
  return neon(process.env.DATABASE_URL);
}

function projectValues(project: ProjectInput | PortfolioProject): unknown[] {
  return [
    project.slug,
    project.title,
    project.summary,
    project.statusLabel,
    project.category,
    project.publicationStatus,
    project.layoutVariant,
    project.imageUrl,
    project.imageAlt,
    project.imageCaption,
    project.repositoryUrl,
    project.liveUrl,
    project.observedResult,
    project.knownLimit,
    project.nextTest,
    JSON.stringify(project.tools),
    JSON.stringify(project.stages),
    project.contentMarkdown,
    project.seoTitle,
    project.seoDescription,
    project.sortOrder,
    project.featured,
  ];
}

type ProjectRow = Record<string, unknown>;

export function rowToProject(row: ProjectRow): PortfolioProject {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    summary: String(row.summary),
    statusLabel: String(row.status_label),
    category: String(row.category),
    publicationStatus: row.publication_status as PortfolioProject['publicationStatus'],
    layoutVariant: row.layout_variant as PortfolioProject['layoutVariant'],
    imageUrl: String(row.image_url || ""),
    imageAlt: String(row.image_alt || ""),
    imageCaption: String(row.image_caption || ""),
    repositoryUrl: String(row.repository_url || ""),
    liveUrl: String(row.live_url || ""),
    observedResult: String(row.observed_result),
    knownLimit: String(row.known_limit),
    nextTest: String(row.next_test),
    tools: Array.isArray(row.tools) ? row.tools.map(String) : [],
    stages: Array.isArray(row.stages)
      ? row.stages.map((stage) => {
          const value = stage as Record<string, unknown>;
          return { title: String(value.title || ""), detail: String(value.detail || "") };
        })
      : [],
    contentMarkdown: String(row.content_markdown),
    seoTitle: String(row.seo_title || ""),
    seoDescription: String(row.seo_description || ""),
    sortOrder: Number(row.sort_order),
    featured: Boolean(row.featured),
    version: Number(row.version),
    createdAt: row.created_at ? new Date(String(row.created_at)).toISOString() : null,
    updatedAt: row.updated_at ? new Date(String(row.updated_at)).toISOString() : null,
    publishedAt: row.published_at ? new Date(String(row.published_at)).toISOString() : null,
  };
}

export async function listProjects(includeArchived = false): Promise<PortfolioProject[]> {
  const sql = database();
  const rows = includeArchived
    ? await sql.query(`SELECT * FROM projects ORDER BY sort_order, updated_at DESC`)
    : await sql.query(`SELECT * FROM projects WHERE publication_status <> 'archived' ORDER BY sort_order, updated_at DESC`);
  return (rows as ProjectRow[]).map(rowToProject);
}

export async function listPublishedProjects(slug?: string): Promise<PortfolioProject[]> {
  const sql = database();
  const rows = slug
    ? await sql.query(`SELECT * FROM projects WHERE publication_status = 'published' AND slug = $1 LIMIT 1`, [slug])
    : await sql.query(`SELECT * FROM projects WHERE publication_status = 'published' ORDER BY sort_order, published_at DESC NULLS LAST`);
  return (rows as ProjectRow[]).map(rowToProject);
}

export async function getProjectById(id: string): Promise<PortfolioProject | null> {
  const rows = await database().query(`SELECT * FROM projects WHERE id = $1::uuid LIMIT 1`, [id]);
  const row = (rows as ProjectRow[])[0];
  return row ? rowToProject(row) : null;
}

export async function createProject(project: ProjectInput): Promise<PortfolioProject> {
  const sql = database();
  try {
    const rows = await sql.query(
      `INSERT INTO projects (
        slug, title, summary, status_label, category, publication_status, layout_variant,
        image_url, image_alt, image_caption, repository_url, live_url, observed_result,
        known_limit, next_test, tools, stages, content_markdown, seo_title, seo_description,
        sort_order, featured, published_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
        $16::jsonb, $17::jsonb, $18, $19, $20, $21, $22,
        CASE WHEN $6 = 'published' THEN now() ELSE NULL END
      ) RETURNING *`,
      projectValues(project),
    );
    return rowToProject((rows as ProjectRow[])[0]);
  } catch (error) {
    if (String(error).includes("projects_slug_key")) {
      throw new ApiError(409, "Another project already uses this slug.", "slug_conflict");
    }
    throw error;
  }
}

export async function updateProject(project: ProjectInput & { id: string; version: number }): Promise<PortfolioProject> {
  const sql = database();
  try {
    const values = projectValues(project);
    const rows = await sql.query(
      `UPDATE projects SET
        slug = $1, title = $2, summary = $3, status_label = $4, category = $5,
        publication_status = $6, layout_variant = $7, image_url = $8, image_alt = $9,
        image_caption = $10, repository_url = $11, live_url = $12, observed_result = $13,
        known_limit = $14, next_test = $15, tools = $16::jsonb, stages = $17::jsonb,
        content_markdown = $18, seo_title = $19, seo_description = $20, sort_order = $21,
        featured = $22, published_at = CASE WHEN $6 = 'published' AND published_at IS NULL THEN now() ELSE published_at END,
        updated_at = now(), version = version + 1
      WHERE id = $23::uuid AND version = $24
      RETURNING *`,
      [...values, project.id, project.version],
    );
    if (!(rows as ProjectRow[]).length) {
      throw new ApiError(409, "This project changed in another session. Reload it before saving again.", "version_conflict");
    }
    return rowToProject((rows as ProjectRow[])[0]);
  } catch (error) {
    if (String(error).includes("projects_slug_key")) {
      throw new ApiError(409, "Another project already uses this slug.", "slug_conflict");
    }
    throw error;
  }
}

export async function deleteProject(id: string, version: number): Promise<boolean> {
  const sql = database();
  const rows = await sql.query(`DELETE FROM projects WHERE id = $1::uuid AND version = $2 RETURNING id`, [id, version]);
  return (rows as ProjectRow[]).length > 0;
}

export async function writeAuditLog(userId: string, action: string, project?: Pick<PortfolioProject, 'id' | 'slug'>, detail: Record<string, unknown> = {}): Promise<void> {
  const sql = database();
  await sql.query(
    `INSERT INTO cms_audit_log (user_id, action, project_id, project_slug, detail)
     VALUES ($1::uuid, $2, $3::uuid, $4, $5::jsonb)`,
    [userId, action, project?.id || null, project?.slug || null, JSON.stringify(detail)],
  );
}
