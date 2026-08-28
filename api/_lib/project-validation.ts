import type { PortfolioProject, ProjectInput, ProjectStage } from "../../lib/project-types.js";
import { ApiError } from "./http.js";

function cleanText(value: unknown, label: string, max: number, required = true): string {
  const text = typeof value === "string" ? stripControlCharacters(value).trim() : "";
  if (required && !text) throw new ApiError(400, `${label} is required.`, "validation_error");
  if (text.length > max) throw new ApiError(400, `${label} must be ${max} characters or fewer.`, "validation_error");
  return text;
}

function stripControlCharacters(value: string): string {
  return [...value].filter((character) => {
    const code = character.charCodeAt(0);
    return code === 9 || code === 10 || code === 13 || (code >= 32 && code !== 127);
  }).join("");
}

function cleanUrl(value: unknown, label: string, required = false, allowRelative = false): string {
  const text = cleanText(value, label, 1500, required);
  if (!text) return "";
  if (allowRelative && /^\/[a-zA-Z0-9/_.,+%()@-]+$/.test(text)) return text;
  let url: URL;
  try {
    url = new URL(text);
  } catch {
    throw new ApiError(400, `${label} must be a valid URL.`, "validation_error");
  }
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new ApiError(400, `${label} must use HTTP or HTTPS.`, "validation_error");
  }
  return url.toString();
}

function cleanStages(value: unknown): ProjectStage[] {
  if (!Array.isArray(value)) throw new ApiError(400, "System stages must be a list.", "validation_error");
  if (value.length > 8) throw new ApiError(400, "Use no more than 8 system stages.", "validation_error");
  return value.map((stage, index) => {
    const record = stage && typeof stage === "object" ? stage as Record<string, unknown> : {};
    return {
      title: cleanText(record.title, `Stage ${index + 1} title`, 60),
      detail: cleanText(record.detail, `Stage ${index + 1} detail`, 280),
    };
  });
}

function cleanTools(value: unknown): string[] {
  if (!Array.isArray(value)) throw new ApiError(400, "Tools must be a list.", "validation_error");
  if (value.length > 20) throw new ApiError(400, "Use no more than 20 tools.", "validation_error");
  return [...new Set(value.map((tool) => cleanText(tool, "Tool name", 60)).filter(Boolean))];
}

export function normalizeProjectInput(value: unknown, intent: "save" | "publish"): ProjectInput {
  const input = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const slug = cleanText(input.slug, "Slug", 120).toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new ApiError(400, "Slug can contain lowercase letters, numbers, and single hyphens only.", "validation_error");
  }

  const status = input.publicationStatus;
  if (!['draft', 'published', 'archived'].includes(String(status))) {
    throw new ApiError(400, "Publication status is invalid.", "validation_error");
  }
  const layout = input.layoutVariant;
  if (!['split', 'wide'].includes(String(layout))) {
    throw new ApiError(400, "Project layout is invalid.", "validation_error");
  }

  const tools = cleanTools(input.tools);
  const stages = cleanStages(input.stages);
  const project: ProjectInput = {
    id: typeof input.id === "string" ? input.id : undefined,
    version: Number.isInteger(input.version) && Number(input.version) >= 0 ? Number(input.version) : undefined,
    slug,
    title: cleanText(input.title, "Title", 160),
    summary: cleanText(input.summary, "Summary", 600),
    statusLabel: cleanText(input.statusLabel, "Project status label", 100),
    category: cleanText(input.category, "Category", 100),
    publicationStatus: status as PortfolioProject['publicationStatus'],
    layoutVariant: layout as PortfolioProject['layoutVariant'],
    imageUrl: cleanUrl(input.imageUrl, "Project image", false, true),
    imageAlt: cleanText(input.imageAlt, "Image alternative text", 240, false),
    imageCaption: cleanText(input.imageCaption, "Image caption", 240, false),
    repositoryUrl: cleanUrl(input.repositoryUrl, "Repository URL"),
    liveUrl: cleanUrl(input.liveUrl, "Live project URL"),
    observedResult: cleanText(input.observedResult, "Observed result", 1200),
    knownLimit: cleanText(input.knownLimit, "Known limit", 1200),
    nextTest: cleanText(input.nextTest, "Next test", 1200),
    tools,
    stages,
    contentMarkdown: cleanText(input.contentMarkdown, "Case study content", 60000),
    seoTitle: cleanText(input.seoTitle, "SEO title", 70, false),
    seoDescription: cleanText(input.seoDescription, "SEO description", 170, false),
    sortOrder: Math.min(9999, Math.max(0, Number.isFinite(Number(input.sortOrder)) ? Math.round(Number(input.sortOrder)) : 100)),
    featured: Boolean(input.featured),
  };

  if (intent === "publish") {
    const missing: string[] = [];
    if (!project.imageUrl) missing.push("project image");
    if (!project.imageAlt) missing.push("image alternative text");
    if (!project.repositoryUrl && !project.liveUrl) missing.push("repository or live project link");
    if (project.stages.length < 2) missing.push("at least 2 system stages");
    if (project.tools.length < 1) missing.push("at least 1 tool");
    if (project.contentMarkdown.length < 120) missing.push("a fuller case study");
    if (missing.length) {
      throw new ApiError(400, `Complete these fields before publishing: ${missing.join(", ")}.`, "incomplete_project");
    }
    project.publicationStatus = "published";
  }

  return project;
}
