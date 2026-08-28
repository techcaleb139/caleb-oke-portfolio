import { listPublishedProjects } from "./_lib/database.js";
import { ApiError, type ApiRequest, type ApiResponse, methodNotAllowed, sendError } from "./_lib/http.js";

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);

  try {
    const requestUrl = new URL(req.url || "/api/projects", "https://portfolio.local");
    const slug = requestUrl.searchParams.get("slug")?.trim();
    if (slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      throw new ApiError(400, "Project slug is invalid.", "invalid_slug");
    }
    const projects = await listPublishedProjects(slug || undefined);
    res.setHeader("ETag", `W/"projects-${Buffer.from(projects.map((project) => `${project.id}:${project.version}`).join("|")).toString("base64url")}"`);
    return res.status(200).json({ projects });
  } catch (error) {
    return sendError(res, error, "Public projects error");
  }
}
