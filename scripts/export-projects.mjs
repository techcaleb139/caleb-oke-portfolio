// Read-only backup of the CMS tables before the reading code is removed.
// Reads DATABASE_URL from the environment; never prints it.
// Run:  node --env-file=.env.local scripts/export-projects.mjs
// Writes: project-backup-<date>.json in the repo root.
import { neon } from "@neondatabase/serverless";
import { writeFile } from "node:fs/promises";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Try: node --env-file=.env.local scripts/export-projects.mjs");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const backup = {};

for (const table of ["projects", "projects_legacy_001"]) {
  try {
    // Identifier is from the fixed list above, never from input.
    const rows = await sql.query(`SELECT * FROM ${table}`);
    backup[table] = rows;
    const byStatus = {};
    for (const row of rows) {
      const key = row.publication_status ?? row.status ?? "(no status column)";
      byStatus[key] = (byStatus[key] ?? 0) + 1;
    }
    const detail = Object.entries(byStatus).map(([k, v]) => `${k}: ${v}`).join(", ");
    console.log(`${table}: ${rows.length} row(s)${rows.length ? ` (${detail})` : ""}`);
    for (const row of rows) console.log(`   - ${row.slug ?? "(no slug)"}  ${row.title ?? ""}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    backup[table] = { error: message };
    console.log(`${table}: not readable (${message})`);
  }
}

const stamp = new Date().toISOString().slice(0, 10);
const file = `project-backup-${stamp}.json`;
await writeFile(file, `${JSON.stringify(backup, null, 2)}\n`, "utf8");
console.log(`\nWrote ${file}. Keep it somewhere outside the repo before Phase 2 deletes the CMS.`);
