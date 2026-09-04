import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const contactHandler = await readFile(new URL("../api/contact.ts", import.meta.url), "utf8");
const contactForm = await readFile(new URL("../components/ContactForm.tsx", import.meta.url), "utf8");

/* ------------------------------------------------------------------ *
 * Guards on api/contact.ts.
 * This route writes to the Neon contact_submissions table, which an n8n
 * workflow polls to send a Telegram alert. The redesign must not change
 * the shape of what reaches that table. These tests are the safety net.
 * ------------------------------------------------------------------ */

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

test("the Neon insert keeps its exact column list", () => {
  const insert = contactHandler.match(/INSERT INTO contact_submissions \(([^)]*)\)/);
  assert.ok(insert, "the insert statement is present");
  const columns = insert[1].split(",").map((column) => column.trim());
  assert.deepEqual(columns, ["name", "business", "workflow", "outcome", "status"]);
});

test("the reply contact is still prefixed into the workflow column", () => {
  // n8n parses the reply address out of the workflow text. Changing this
  // prefix silently breaks the notification, so pin the exact format.
  assert.match(contactHandler, /Reply contact: \$\{safeContact\}/);
});

test("new rows are still written with the pending status n8n polls for", () => {
  assert.match(contactHandler, /'pending'/);
});

test("business and outcome remain optional at the route", () => {
  // The form no longer sends them. The route must not start requiring them.
  const required = contactHandler.match(/if \(!safeName[^)]*\)/);
  assert.ok(required, "the required-field check is present");
  assert.doesNotMatch(required[0], /safeBusiness/);
  assert.doesNotMatch(required[0], /safeOutcome/);
  assert.match(contactHandler, /clean\(outcome\) \|\| 'Not provided yet'/);
});

/* ------------------------------------------------------------------ *
 * Guards on the client, so the payload keys never drift from the route.
 * ------------------------------------------------------------------ */

test("the form posts every key the route reads, and no others", () => {
  const body = contactForm.match(/body: JSON\.stringify\(\{([\s\S]*?)\}\)/);
  assert.ok(body, "the request body is built with JSON.stringify");
  const keys = [...body[1].matchAll(/^\s*(\w+):/gm)].map((match) => match[1]).sort();
  assert.deepEqual(keys, ["business", "contact", "name", "outcome", "website", "workflow"]);
});

test("the form sends empty strings for the two removed fields", () => {
  assert.match(contactForm, /business: ""/);
  assert.match(contactForm, /outcome: ""/);
});

test("the form posts to the unchanged route path", () => {
  assert.match(contactForm, /fetch\("\/api\/contact"/);
  assert.match(contactForm, /method: "POST"/);
});

test("the honeypot field is still rendered and still short-circuits submit", () => {
  assert.match(contactForm, /name="website"/);
  // A filled decoy returns before anything is posted.
  assert.match(contactForm, /get\("website"\)\) return;/);
});

test("the form uses the three finalized visible labels", () => {
  assert.match(contactForm, /contact\.labels\.name/);
  assert.match(contactForm, /contact\.labels\.contact/);
  assert.match(contactForm, /contact\.labels\.workflow/);
});

test("submit is disabled while a request is in flight", () => {
  // Guards against a double tap creating two rows.
  assert.match(contactForm, /disabled=\{state === "submitting"\}/);
  assert.match(contactForm, /if \(state === "submitting" \|\| state === "success"\) return;/);
});

test("each error is linked to its field with aria-describedby", () => {
  assert.match(contactForm, /"aria-describedby": error \? errorId : undefined/);
  assert.match(contactForm, /"aria-invalid": error \? true : undefined/);
  assert.match(contactForm, /const errorId = `\$\{id\}-error`/);
  assert.match(contactForm, /<span className="fieldError" id=\{errorId\}>/);
});

test("success replaces the form instead of showing a toast", () => {
  assert.match(contactForm, /if \(state === "success"\) \{[\s\S]*?return \([\s\S]*?formSuccess/);
  assert.doesNotMatch(contactForm, /toast/i);
});

test("all three fields are validated before anything is posted", () => {
  const validate = contactForm.match(/function validate\([\s\S]*?\n\}/);
  assert.ok(validate, "a validate function exists");
  for (const field of ["name", "contact", "workflow"]) {
    assert.match(validate[0], new RegExp(`errors\\.${field}`), `${field} is validated`);
  }
  assert.match(contactForm, /if \(firstInvalid\) \{[\s\S]*?focus\(\);\s*return;/);
});

