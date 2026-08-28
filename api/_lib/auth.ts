import { createHash, createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual, type ScryptOptions } from "node:crypto";
import { database } from "./database.js";
import { ApiError, type ApiRequest, type ApiResponse, clientAddress, getHeader } from "./http.js";

const PRODUCTION_COOKIE = "__Host-caleb_cms_session";
const DEVELOPMENT_COOKIE = "caleb_cms_session";
const SESSION_HOURS = 8;
const SCRYPT_N = 131072;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const SCRYPT_KEY_LENGTH = 32;
const SCRYPT_MAX_MEMORY = 256 * 1024 * 1024;

function deriveKey(password: string, salt: Buffer, length: number, options: ScryptOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(password, salt, length, options, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey);
    });
  });
}

export type AdminSession = {
  userId: string;
  email: string;
  csrfToken: string;
  expiresAt: string;
};

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function isProductionRequest(req: ApiRequest): boolean {
  const proto = getHeader(req, "x-forwarded-proto");
  return Boolean(process.env.VERCEL) || proto === "https";
}

function cookieName(req: ApiRequest): string {
  return isProductionRequest(req) ? PRODUCTION_COOKIE : DEVELOPMENT_COOKIE;
}

function readCookies(req: ApiRequest): Record<string, string> {
  return getHeader(req, "cookie").split(";").reduce<Record<string, string>>((cookies, pair) => {
    const [rawName, ...rest] = pair.trim().split("=");
    if (rawName && rest.length) cookies[rawName] = decodeURIComponent(rest.join("="));
    return cookies;
  }, {});
}

function setSessionCookie(req: ApiRequest, res: ApiResponse, token: string, maxAgeSeconds: number): void {
  const secure = isProductionRequest(req) ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${cookieName(req)}=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAgeSeconds}; HttpOnly; SameSite=Strict${secure}; Priority=High`,
  );
}

export async function verifyPassword(password: string, encoded: string): Promise<boolean> {
  const parts = encoded.split("$");
  if (parts.length !== 8 || parts[1] !== "scrypt") return false;
  const n = Number(parts[2]);
  const r = Number(parts[3]);
  const p = Number(parts[4]);
  if (!Number.isInteger(n) || !Number.isInteger(r) || !Number.isInteger(p) || n < 16384 || r < 8 || p < 1) return false;
  const salt = Buffer.from(parts[5], "base64url");
  const expected = Buffer.from(parts[6], "base64url");
  const marker = parts[7];
  if (marker !== "v1" || salt.length < 16 || expected.length !== SCRYPT_KEY_LENGTH) return false;
  const actual = await deriveKey(password, salt, expected.length, { N: n, r, p, maxmem: SCRYPT_MAX_MEMORY });
  return timingSafeEqual(actual, expected);
}

export async function hashPassword(password: string): Promise<string> {
  if (password.length < 14 || password.length > 128) {
    throw new ApiError(400, "Use a password between 14 and 128 characters.", "weak_password");
  }
  const salt = randomBytes(24);
  const derived = await deriveKey(password, salt, SCRYPT_KEY_LENGTH, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
    maxmem: SCRYPT_MAX_MEMORY,
  });
  return `$scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt.toString("base64url")}$${derived.toString("base64url")}$v1`;
}

export async function ensureAdminUser(): Promise<void> {
  const email = process.env.CMS_ADMIN_EMAIL?.trim().toLowerCase();
  const passwordHash = process.env.CMS_ADMIN_PASSWORD_HASH?.trim();
  if (!email || !passwordHash) return;
  const sql = database();
  await sql.query(
    `INSERT INTO cms_admin_users (email, password_hash)
     VALUES ($1, $2)
     ON CONFLICT (email) DO NOTHING`,
    [email, passwordHash],
  );
}

export async function authenticateAdmin(email: string, password: string): Promise<{ id: string; email: string } | null> {
  await ensureAdminUser();
  const sql = database();
  const rows = await sql.query(`SELECT id, email, password_hash FROM cms_admin_users WHERE email = $1 LIMIT 1`, [email.trim().toLowerCase()]);
  const row = (rows as Array<Record<string, unknown>>)[0];
  const fallbackHash = process.env.CMS_DUMMY_PASSWORD_HASH || process.env.CMS_ADMIN_PASSWORD_HASH;
  if (!row) {
    if (fallbackHash) await verifyPassword(password, fallbackHash);
    return null;
  }
  if (!await verifyPassword(password, String(row.password_hash))) return null;
  await sql.query(`UPDATE cms_admin_users SET last_login_at = now() WHERE id = $1::uuid`, [row.id]);
  return { id: String(row.id), email: String(row.email) };
}

export async function issueSession(req: ApiRequest, res: ApiResponse, user: { id: string; email: string }): Promise<AdminSession> {
  const token = randomBytes(32).toString("base64url");
  const tokenHash = sha256(token);
  const csrfToken = randomBytes(24).toString("base64url");
  const userAgentHash = sha256(getHeader(req, "user-agent"));
  const expiresAt = new Date(Date.now() + SESSION_HOURS * 60 * 60 * 1000);
  const sql = database();
  await sql.query(`DELETE FROM cms_sessions WHERE expires_at <= now()`);
  await sql.query(
    `INSERT INTO cms_sessions (token_hash, user_id, csrf_token, user_agent_hash, expires_at)
     VALUES ($1, $2::uuid, $3, $4, $5::timestamptz)`,
    [tokenHash, user.id, csrfToken, userAgentHash, expiresAt.toISOString()],
  );
  setSessionCookie(req, res, token, SESSION_HOURS * 60 * 60);
  return { userId: user.id, email: user.email, csrfToken, expiresAt: expiresAt.toISOString() };
}

export async function getAdminSession(req: ApiRequest): Promise<AdminSession | null> {
  const cookies = readCookies(req);
  const token = cookies[PRODUCTION_COOKIE] || cookies[DEVELOPMENT_COOKIE];
  if (!token || token.length < 32) return null;
  const sql = database();
  const rows = await sql.query(
    `SELECT s.user_id, s.csrf_token, s.expires_at, s.user_agent_hash, u.email
     FROM cms_sessions s
     JOIN cms_admin_users u ON u.id = s.user_id
     WHERE s.token_hash = $1 AND s.expires_at > now()
     LIMIT 1`,
    [sha256(token)],
  );
  const row = (rows as Array<Record<string, unknown>>)[0];
  if (!row) return null;
  const expectedAgent = String(row.user_agent_hash || "");
  const currentAgent = sha256(getHeader(req, "user-agent"));
  if (expectedAgent && expectedAgent !== currentAgent) return null;
  await sql.query(`UPDATE cms_sessions SET last_seen_at = now() WHERE token_hash = $1`, [sha256(token)]);
  return {
    userId: String(row.user_id),
    email: String(row.email),
    csrfToken: String(row.csrf_token),
    expiresAt: new Date(String(row.expires_at)).toISOString(),
  };
}

export async function requireAdminSession(req: ApiRequest): Promise<AdminSession> {
  const session = await getAdminSession(req);
  if (!session) throw new ApiError(401, "Your admin session has expired. Sign in again.", "unauthorized");
  return session;
}

export function assertCsrf(req: ApiRequest, session: AdminSession, tokenOverride?: string): void {
  const token = tokenOverride || getHeader(req, "x-cms-csrf");
  if (!token || token.length !== session.csrfToken.length) {
    throw new ApiError(403, "The security token is missing or invalid. Reload the admin page.", "csrf_failed");
  }
  const given = Buffer.from(token);
  const expected = Buffer.from(session.csrfToken);
  if (!timingSafeEqual(given, expected)) {
    throw new ApiError(403, "The security token is missing or invalid. Reload the admin page.", "csrf_failed");
  }
}

export async function revokeSession(req: ApiRequest, res: ApiResponse): Promise<void> {
  const cookies = readCookies(req);
  const token = cookies[PRODUCTION_COOKIE] || cookies[DEVELOPMENT_COOKIE];
  if (token) await database().query(`DELETE FROM cms_sessions WHERE token_hash = $1`, [sha256(token)]);
  setSessionCookie(req, res, "", 0);
}

function loginIdentity(req: ApiRequest, email: string): string {
  const secret = process.env.CMS_RATE_LIMIT_SECRET || process.env.CMS_ADMIN_PASSWORD_HASH || "missing-secret";
  return createHmac("sha256", secret).update(`${clientAddress(req)}|${email.trim().toLowerCase()}`).digest("hex");
}

export async function assertLoginAllowed(req: ApiRequest, email: string): Promise<void> {
  const sql = database();
  await sql.query(`DELETE FROM cms_login_attempts WHERE attempted_at < now() - interval '24 hours'`);
  const rows = await sql.query(
    `SELECT count(*)::int AS count FROM cms_login_attempts
     WHERE identity_hash = $1 AND attempted_at > now() - interval '15 minutes'`,
    [loginIdentity(req, email)],
  );
  const count = Number((rows as Array<Record<string, unknown>>)[0]?.count || 0);
  if (count >= 5) throw new ApiError(429, "Too many sign-in attempts. Wait 15 minutes and try again.", "rate_limited");
}

export async function recordLoginFailure(req: ApiRequest, email: string): Promise<void> {
  await database().query(`INSERT INTO cms_login_attempts (identity_hash) VALUES ($1)`, [loginIdentity(req, email)]);
}

export async function clearLoginFailures(req: ApiRequest, email: string): Promise<void> {
  await database().query(`DELETE FROM cms_login_attempts WHERE identity_hash = $1`, [loginIdentity(req, email)]);
}

export async function changeAdminPassword(userId: string, currentPassword: string, nextPassword: string): Promise<void> {
  const sql = database();
  const rows = await sql.query(`SELECT password_hash FROM cms_admin_users WHERE id = $1::uuid LIMIT 1`, [userId]);
  const row = (rows as Array<Record<string, unknown>>)[0];
  if (!row || !await verifyPassword(currentPassword, String(row.password_hash))) {
    throw new ApiError(400, "The current password is incorrect.", "invalid_password");
  }
  const nextHash = await hashPassword(nextPassword);
  await sql.query(`UPDATE cms_admin_users SET password_hash = $1, updated_at = now() WHERE id = $2::uuid`, [nextHash, userId]);
  await sql.query(`DELETE FROM cms_sessions WHERE user_id = $1::uuid`, [userId]);
}
