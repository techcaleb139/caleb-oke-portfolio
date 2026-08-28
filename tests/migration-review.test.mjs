import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const historical = await readFile(new URL("../migrations/001_create_projects.sql", import.meta.url), "utf8");
const corrective = await readFile(new URL("../migrations/002_upgrade_projects_cms.sql", import.meta.url), "utf8");
const runner = await readFile(new URL("../scripts/migrate-cms.mjs", import.meta.url), "utf8");

test("keeps Antigravity's applied migration as a historical record", () => {
  assert.match(historical, /Applied to Neon by Antigravity/);
  assert.match(historical, /CREATE TABLE projects/);
  assert.doesNotMatch(historical, /cms_admin_users/);
  assert.doesNotMatch(historical, /publication_status/);
});

test("preserves the incomplete table before creating the reviewed CMS schema", () => {
  assert.match(corrective, /RENAME TO projects_legacy_001/);
  assert.match(corrective, /RENAME CONSTRAINT projects_pkey TO projects_legacy_001_pkey/);
  assert.match(corrective, /RENAME CONSTRAINT projects_slug_key TO projects_legacy_001_slug_key/);
  assert.match(corrective, /publication_status text NOT NULL/);
  assert.match(corrective, /CREATE TABLE cms_admin_users/);
  assert.match(corrective, /CREATE TABLE cms_sessions/);
  assert.match(corrective, /CREATE TABLE cms_login_attempts/);
  assert.match(corrective, /CREATE TABLE cms_audit_log/);
  assert.match(corrective, /'draft'/);
});

test("runs only the corrective migration and verifies the result", () => {
  assert.match(runner, /002_upgrade_projects_cms\.sql/);
  assert.doesNotMatch(runner, /001_create_projects\.sql/);
  assert.match(runner, /sql\.transaction/);
  assert.match(runner, /projects_legacy_001/);
  assert.match(runner, /Migration verification failed/);
});
