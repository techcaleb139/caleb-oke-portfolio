import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const projectHandler = await readFile(new URL("../api/admin/projects.ts", import.meta.url), "utf8");

test("logs deleted projects without retaining a broken foreign-key reference", () => {
  assert.match(projectHandler, /writeAuditLog\(session\.userId, "project\.deleted", undefined/);
  assert.match(projectHandler, /deletedProjectId: existing\.id/);
  assert.match(projectHandler, /deletedProjectSlug: existing\.slug/);
});
