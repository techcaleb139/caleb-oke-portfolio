import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

async function builtPortfolio() {
  const distDir = path.resolve("dist");
  const html = await readFile(path.join(distDir, "index.html"), "utf8");
  const assetDir = path.join(distDir, "assets");
  const assetNames = await readdir(assetDir);
  const javascript = await Promise.all(
    assetNames
      .filter((name) => name.endsWith(".js"))
      .map((name) => readFile(path.join(assetDir, name), "utf8")),
  );

  return `${html}\n${javascript.join("\n")}`;
}

test("builds the professional identity and real contact actions", async () => {
  const output = await builtPortfolio();
  assert.match(output, /Caleb Oke/);
  assert.match(output, /AI Automation Builder/);
  assert.match(output, /mailto:okecaleb139@gmail\.com/);
  assert.match(output, /wa\.me\/2348065755296/);
  assert.match(output, /tech_caleb_/);
});

test("labels portfolio evidence honestly", async () => {
  const output = await builtPortfolio();
  for (const expected of [
    "Voice AI Restaurant Ordering Prototype",
    "TS Academy Final Project",
    "fictional Nigerian restaurant",
    "Working Personal System",
    "Automated Job Search Engine",
  ]) {
    assert.match(output, new RegExp(expected, "i"));
  }

  assert.match(output, /has not yet been validated in live restaurant operations/i);
  assert.doesNotMatch(
    output,
    /Documented production workflows|zero operational headaches|built and deployed for a live business/i,
  );
});

test("keeps the project-brief handoff explicit", async () => {
  const output = await builtPortfolio();
  assert.match(output, /Prepare Project Brief/);
  assert.match(output, /Nothing is sent automatically/);
  assert.match(output, /Send on WhatsApp/);
  assert.match(output, /Send via Gmail/);
});
