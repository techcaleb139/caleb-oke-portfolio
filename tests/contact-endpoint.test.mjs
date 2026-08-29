import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const contactHandler = await readFile(new URL("../api/contact.ts", import.meta.url), "utf8");
const portfolioComponent = await readFile(new URL("../components/Portfolio.tsx", import.meta.url), "utf8");

test("api/contact uses .js extension for ES module relative imports", () => {
  assert.match(contactHandler, /from ['"]\.\/_lib\/http\.js['"]/);
  assert.doesNotMatch(contactHandler, /from ['"]\.\/_lib\/http['"]/);
});

test("api/contact enforces method, headers, and security controls", () => {
  assert.match(contactHandler, /setApiHeaders\(res\)/);
  assert.match(contactHandler, /req\.method !== ['"]POST['"]/);
  assert.match(contactHandler, /setHeader\(['"]Allow['"],\s*['"]POST['"]\)/);
  assert.match(contactHandler, /assertSameOriginMutation\(req\)/);
  assert.match(contactHandler, /websiteFilled/);
});

test("api/contact validates required contact and project fields", () => {
  assert.match(contactHandler, /!safeName\s*\|\|\s*!safeContact\s*\|\|\s*!safeWorkflow/);
  assert.match(contactHandler, /INSERT INTO contact_submissions/);
  assert.match(contactHandler, /workflowWithContact/);
});

test("Portfolio.tsx implements finalized copy and contact field labels", () => {
  assert.match(portfolioComponent, /Tell me what your team does manually today, and what you(?:&apos;|')d like automated instead\./);
  assert.match(portfolioComponent, /Tell me who you are and where I should reply\./);
  assert.match(portfolioComponent, /Preferred contact \(email or WhatsApp\)/);
  assert.match(portfolioComponent, /A short description is enough — I(?:&apos;|')ll figure out the right tools to build it\./);
  assert.match(portfolioComponent, /<strong>Initial Review:<\/strong> I reply using the email or WhatsApp you provide\./);
  assert.match(portfolioComponent, /<strong>Discovery & Scoping:<\/strong> We confirm the current steps, access needed, and what a useful result looks like\./);
  assert.match(portfolioComponent, /<strong>Pilot Proposal:<\/strong> If it(?:&apos;|')s a fit, I propose a small paid pilot before a larger build\./);
});
