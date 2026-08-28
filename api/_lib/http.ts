import type { IncomingHttpHeaders } from "node:http";

export type ApiRequest = {
  method?: string;
  url?: string;
  headers: IncomingHttpHeaders;
  body?: unknown;
  socket?: { remoteAddress?: string | null };
};

export type ApiResponse = {
  setHeader(name: string, value: string | string[]): void;
  status(code: number): ApiResponse;
  json(body: unknown): void;
  end(body?: string): void;
};

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code = "request_error",
  ) {
    super(message);
  }
}

export function getHeader(req: ApiRequest, name: string): string {
  const value = req.headers[name.toLowerCase()];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export function setApiHeaders(res: ApiResponse): void {
  res.setHeader("Cache-Control", "private, no-store, max-age=0");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Vary", "Sec-Fetch-Site, Origin, Cookie");
}

export function parseJsonBody<T>(req: ApiRequest): T {
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body) as T;
    } catch {
      throw new ApiError(400, "The request body is not valid JSON.", "invalid_json");
    }
  }
  if (!req.body || typeof req.body !== "object") {
    throw new ApiError(400, "A JSON request body is required.", "missing_body");
  }
  return req.body as T;
}

export function clientAddress(req: ApiRequest): string {
  const forwarded = getHeader(req, "x-forwarded-for").split(",")[0]?.trim();
  return forwarded || req.socket?.remoteAddress || "unknown";
}

function requestTargetOrigin(req: ApiRequest): string {
  const forwardedHost = getHeader(req, "x-forwarded-host").split(",")[0]?.trim();
  const host = forwardedHost || getHeader(req, "host");
  const forwardedProto = getHeader(req, "x-forwarded-proto").split(",")[0]?.trim();
  const protocol = forwardedProto || (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
  return `${protocol}://${host}`;
}

export function assertSameOriginMutation(req: ApiRequest): void {
  const method = (req.method || "GET").toUpperCase();
  if (["GET", "HEAD", "OPTIONS"].includes(method)) return;

  const fetchSite = getHeader(req, "sec-fetch-site");
  if (fetchSite === "cross-site" || fetchSite === "same-site") {
    throw new ApiError(403, "Cross-site requests are not allowed.", "cross_site_request");
  }

  const origin = getHeader(req, "origin");
  const referer = getHeader(req, "referer");
  const source = origin || (referer ? new URL(referer).origin : "");
  if (!source || source !== requestTargetOrigin(req)) {
    throw new ApiError(403, "The request origin could not be verified.", "origin_mismatch");
  }
}

export function methodNotAllowed(res: ApiResponse, allowed: string[]): void {
  res.setHeader("Allow", allowed.join(", "));
  res.status(405).json({ error: "Method not allowed.", code: "method_not_allowed" });
}

export function sendError(res: ApiResponse, error: unknown, context: string): void {
  if (error instanceof ApiError) {
    res.status(error.statusCode).json({ error: error.message, code: error.code });
    return;
  }
  console.error(context, error);
  res.status(500).json({ error: "An unexpected server error occurred.", code: "server_error" });
}
