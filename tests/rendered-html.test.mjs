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

async function builtHtml() {
  return readFile(path.resolve("dist", "index.html"), "utf8");
}

test("ships crawlable content before JavaScript runs", async () => {
  const html = await builtHtml();
  assert.match(html, /<h1[^>]*>I build practical automations for real work\.<\/h1>/);
  assert.match(html, /Voice AI Restaurant Ordering Prototype/);
  assert.match(html, /Automated Job Search Engine and Alert Pipeline/);
  assert.match(html, /Tell me what is taking too much manual effort\./);
});

test("publishes complete search and social metadata", async () => {
  const html = await builtHtml();
  assert.match(html, /rel="canonical" href="https:\/\/caleb-oke-portfolio\.vercel\.app\/"/);
  assert.match(html, /name="robots" content="index, follow/);
  assert.match(html, /property="og:title" content="Caleb Oke \| AI Automation Builder"/);
  assert.match(html, /name="twitter:card" content="summary_large_image"/);
  assert.match(html, /type="application\/ld\+json"/);
  assert.match(html, /"@type": "ProfilePage"/);
});

test("builds the professional identity and real contact actions", async () => {
  const output = await builtPortfolio();
  assert.match(output, /Caleb Oke/);
  assert.match(output, /AI Automation Builder/);
  assert.match(output, /mailto:/);
  assert.match(output, /okecaleb139@gmail\.com/);
  assert.match(output, /wa\.me\//);
  assert.match(output, /2348065755296/);
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
  assert.match(output, /Review my brief/);
  assert.match(output, /Nothing is sent until you review/);
  assert.match(output, /Send on WhatsApp/);
  assert.match(output, /Send by email/);
  assert.match(output, /Submit project brief/);
  assert.match(output, /\/api\/contact/);
  assert.match(output, /Reply email or WhatsApp/);
  assert.match(output, /stored only after you explicitly submit it/);
});
