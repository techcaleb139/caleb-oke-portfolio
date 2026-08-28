import type { PortfolioProject } from "../../lib/project-types.js";
import { assertCsrf, requireAdminSession } from "../_lib/auth.js";
import {
  createProject,
  deleteProject,
  getProjectById,
  listProjects,
  updateProject,
  writeAuditLog,
} from "../_lib/database.js";
import { triggerContentDeployment } from "../_lib/deploy.js";
import {
  ApiError,
  type ApiRequest,
  type ApiResponse,
  assertSameOriginMutation,
  methodNotAllowed,
  parseJsonBody,
  sendError,
  setApiHeaders,
} from "../_lib/http.js";
import { normalizeProjectInput } from "../_lib/project-validation.js";

type ProjectAction = "save" | "publish" | "unpublish" | "archive" | "restore" | "delete";
type ProjectRequestBody = {
  action?: unknown;
  project?: unknown;
  confirmTitle?: unknown;
};

function actionFrom(value: unknown): ProjectAction {
  const action = String(value || "save");
  if (!['save', 'publish', 'unpublish', 'archive', 'restore', 'delete'].includes(action)) {
    throw new ApiError(400, "Unknown project action.", "invalid_action");
  }
  return action as ProjectAction;
}

function projectIdentity(value: unknown): { id: string; version: number } {
  const project = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const id = typeof project.id === "string" ? project.id : "";
  const version = Number(project.version);
  if (!/^[0-9a-f-]{36}$/i.test(id) || !Number.isInteger(version) || version < 1) {
    throw new ApiError(400, "Project identity is invalid. Reload the editor.", "invalid_project_identity");
  }
  return { id, version };
}

function withStatus(project: unknown, status: PortfolioProject['publicationStatus']): unknown {
  return project && typeof project === "object" ? { ...(project as Record<string, unknown>), publicationStatus: status } : project;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  setApiHeaders(res);
  try {
    const session = await requireAdminSession(req);

    if (req.method === "GET") {
      const projects = await listProjects(true);
      return res.status(200).json({ projects });
    }

    if (req.method !== "POST") return methodNotAllowed(res, ["GET", "POST"]);
    assertSameOriginMutation(req);
    assertCsrf(req, session);
    const body = parseJsonBody<ProjectRequestBody>(req);
    const action = actionFrom(body.action);

    if (action === "delete") {
      const identity = projectIdentity(body.project);
      const existing = await getProjectById(identity.id);
      if (!existing) throw new ApiError(404, "Project not found.", "not_found");
      if (existing.publicationStatus !== "archived") {
        throw new ApiError(409, "Archive the project before permanently deleting it.", "archive_required");
      }
      if (body.confirmTitle !== existing.title) {
        throw new ApiError(400, "Type the complete project title to permanently delete it.", "delete_confirmation_failed");
      }
      const deleted = await deleteProject(existing.id, identity.version);
      if (!deleted) throw new ApiError(409, "The project changed before it could be deleted. Reload and try again.", "version_conflict");
      await writeAuditLog(session.userId, "project.deleted", undefined, {
        deletedProjectId: existing.id,
        deletedProjectSlug: existing.slug,
        previousStatus: existing.publicationStatus,
      });
      const deployment = await triggerContentDeployment();
      return res.status(200).json({ deleted: true, deployment, projects: await listProjects(true) });
    }

    const rawProject = action === "publish"
      ? withStatus(body.project, "published")
      : action === "unpublish"
        ? withStatus(body.project, "draft")
        : action === "archive"
          ? withStatus(body.project, "archived")
          : action === "restore"
            ? withStatus(body.project, "draft")
            : body.project;
    const normalized = normalizeProjectInput(rawProject, action === "publish" ? "publish" : "save");
    const existing = normalized.id ? await getProjectById(normalized.id) : null;
    let saved: PortfolioProject;

    if (normalized.id) {
      if (!existing) throw new ApiError(404, "Project not found.", "not_found");
      if (!Number.isInteger(normalized.version)) throw new ApiError(400, "Project version is missing.", "invalid_project_identity");
      saved = await updateProject({ ...normalized, id: normalized.id, version: normalized.version as number });
    } else {
      saved = await createProject(normalized);
    }

    await writeAuditLog(session.userId, `project.${action}`, saved, {
      previousStatus: existing?.publicationStatus || null,
      nextStatus: saved.publicationStatus,
      version: saved.version,
    });

    const affectsPublicSite = saved.publicationStatus === "published" || existing?.publicationStatus === "published";
    const deployment = affectsPublicSite
      ? await triggerContentDeployment()
      : { triggered: false, message: action === "archive" ? "The project was moved to the archive." : "The project was saved as a private draft." };

    return res.status(existing ? 200 : 201).json({ project: saved, deployment, projects: await listProjects(true) });
  } catch (error) {
    return sendError(res, error, "CMS projects error");
  }
}
