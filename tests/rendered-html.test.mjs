import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() { }, passThroughOnException() { } },
  );
}

test("renders Caleb Oke portfolio with real contact actions", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /Caleb Oke/);
  assert.match(html, /AI Automation Engineer/);
  assert.match(html, /mailto:okecaleb139@gmail\.com/);
  assert.match(html, /wa\.me\/2348065755296/);
});

test("renders genuine work, capabilities, navigation, and accessibility basics", async () => {
  const html = await (await render()).text();
  for (const expected of [
    "Mama Tee", "Automated job search engine", "n8n", "Make.com", "Zapier",
    "Vapi", "APIs", "JavaScript", "Python", "AI agents", "Webhooks",
    "Docker", "Telegram", "Google Sheets",
  ]) assert.match(html, new RegExp(expected.replace(".", "\\."), "i"));
  assert.match(html, /href="#work"/);
  assert.match(html, /href="#services"/);
  assert.match(html, /href="#about"/);
  assert.match(html, /href="#contact"/);
  assert.match(html, /Skip to main content/);
  assert.match(html, /aria-controls="site-navigation"/);
  assert.doesNotMatch(html, /portrait pending|identity preserved portrait|lorem ipsum/i);
  const textOnly = html.slice(html.indexOf("<body")).replace(/<[^>]*>/g, " ");
  assert.doesNotMatch(textOnly, /\b\d+%|\b\d+\+ (clients|projects|automations)/i);
});
