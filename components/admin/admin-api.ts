import { upload } from "@vercel/blob/client";
import type { PortfolioProject } from "../../lib/project-types.ts";

export type AdminSessionState = {
  authenticated: boolean;
  email?: string;
  csrfToken?: string;
  expiresAt?: string;
};

export type DeploymentResult = { triggered: boolean; message: string };

export class AdminRequestError extends Error {
  constructor(message: string, public readonly status: number, public readonly code: string) {
    super(message);
  }
}

export function isAuthenticationError(error: unknown): boolean {
  return error instanceof AdminRequestError && error.status === 401;
}

async function readJson(response: Response): Promise<Record<string, unknown>> {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new AdminRequestError(
      typeof body.error === "string" ? body.error : "The request could not be completed.",
      response.status,
      typeof body.code === "string" ? body.code : "request_error",
    );
  }
  return body as Record<string, unknown>;
}

export async function getAdminSession(): Promise<AdminSessionState> {
  const response = await fetch("/api/admin/session", { credentials: "same-origin", headers: { Accept: "application/json" } });
  return await readJson(response) as AdminSessionState;
}

export async function loginAdmin(email: string, password: string): Promise<AdminSessionState> {
  const response = await fetch("/api/admin/session", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return await readJson(response) as AdminSessionState;
}

export async function logoutAdmin(csrfToken: string): Promise<void> {
  const response = await fetch("/api/admin/session", {
    method: "DELETE",
    credentials: "same-origin",
    headers: { Accept: "application/json", "X-CMS-CSRF": csrfToken },
  });
  await readJson(response);
}

export async function changeAdminPassword(csrfToken: string, currentPassword: string, nextPassword: string): Promise<AdminSessionState & { message?: string }> {
  const response = await fetch("/api/admin/session", {
    method: "PATCH",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", Accept: "application/json", "X-CMS-CSRF": csrfToken },
    body: JSON.stringify({ action: "change-password", currentPassword, nextPassword }),
  });
  return await readJson(response) as AdminSessionState & { message?: string };
}

export async function getAdminProjects(): Promise<PortfolioProject[]> {
  const response = await fetch("/api/admin/projects", { credentials: "same-origin", headers: { Accept: "application/json" } });
  const result = await readJson(response);
  return Array.isArray(result.projects) ? result.projects as PortfolioProject[] : [];
}

export async function mutateProject(
  csrfToken: string,
  action: "save" | "publish" | "unpublish" | "archive" | "restore" | "delete",
  project: PortfolioProject,
  confirmTitle?: string,
): Promise<{ project?: PortfolioProject; projects: PortfolioProject[]; deployment: DeploymentResult; deleted?: boolean }> {
  const response = await fetch("/api/admin/projects", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", Accept: "application/json", "X-CMS-CSRF": csrfToken },
    body: JSON.stringify({ action, project, confirmTitle }),
  });
  return await readJson(response) as { project?: PortfolioProject; projects: PortfolioProject[]; deployment: DeploymentResult; deleted?: boolean };
}

function safeFileName(name: string): string {
  const normalized = name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return normalized || "project-image.webp";
}

export async function uploadProjectImage(file: File, csrfToken: string, onProgress: (percentage: number) => void): Promise<string> {
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
    throw new Error("Upload a JPG, PNG, WebP, or GIF image.");
  }
  if (file.size > 8 * 1024 * 1024) throw new Error("Images must be 8 MB or smaller.");
  const blob = await upload(`portfolio/${Date.now()}-${safeFileName(file.name)}`, file, {
    access: "public",
    handleUploadUrl: "/api/admin/upload",
    clientPayload: JSON.stringify({ csrfToken }),
    contentType: file.type,
    onUploadProgress: ({ percentage }) => onProgress(Math.round(percentage)),
  });
  return blob.url;
}
