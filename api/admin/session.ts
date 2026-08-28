import {
  assertCsrf,
  assertLoginAllowed,
  authenticateAdmin,
  changeAdminPassword,
  clearLoginFailures,
  getAdminSession,
  issueSession,
  recordLoginFailure,
  requireAdminSession,
  revokeSession,
} from "../_lib/auth.js";
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

type SessionBody = {
  email?: unknown;
  password?: unknown;
  action?: unknown;
  currentPassword?: unknown;
  nextPassword?: unknown;
};

export default async function handler(req: ApiRequest, res: ApiResponse) {
  setApiHeaders(res);
  try {
    if (req.method === "GET") {
      const session = await getAdminSession(req);
      return res.status(200).json(session
        ? { authenticated: true, email: session.email, csrfToken: session.csrfToken, expiresAt: session.expiresAt }
        : { authenticated: false });
    }

    if (req.method === "POST") {
      assertSameOriginMutation(req);
      const body = parseJsonBody<SessionBody>(req);
      const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
      const password = typeof body.password === "string" ? body.password : "";
      if (!email || email.length > 320 || !password || password.length > 128) {
        throw new ApiError(400, "Enter a valid email address and password.", "invalid_credentials");
      }
      await assertLoginAllowed(req, email);
      const user = await authenticateAdmin(email, password);
      if (!user) {
        await recordLoginFailure(req, email);
        throw new ApiError(401, "The email address or password is incorrect.", "invalid_credentials");
      }
      await clearLoginFailures(req, email);
      const session = await issueSession(req, res, user);
      return res.status(200).json({ authenticated: true, email: session.email, csrfToken: session.csrfToken, expiresAt: session.expiresAt });
    }

    if (req.method === "PATCH") {
      assertSameOriginMutation(req);
      const session = await requireAdminSession(req);
      assertCsrf(req, session);
      const body = parseJsonBody<SessionBody>(req);
      if (body.action !== "change-password") throw new ApiError(400, "Unknown session action.", "invalid_action");
      const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : "";
      const nextPassword = typeof body.nextPassword === "string" ? body.nextPassword : "";
      await changeAdminPassword(session.userId, currentPassword, nextPassword);
      const nextSession = await issueSession(req, res, { id: session.userId, email: session.email });
      return res.status(200).json({ authenticated: true, email: nextSession.email, csrfToken: nextSession.csrfToken, expiresAt: nextSession.expiresAt, message: "Password updated. Other sessions have been signed out." });
    }

    if (req.method === "DELETE") {
      assertSameOriginMutation(req);
      const session = await requireAdminSession(req);
      assertCsrf(req, session);
      await revokeSession(req, res);
      return res.status(200).json({ authenticated: false });
    }

    return methodNotAllowed(res, ["GET", "POST", "PATCH", "DELETE"]);
  } catch (error) {
    return sendError(res, error, "CMS session error");
  }
}
