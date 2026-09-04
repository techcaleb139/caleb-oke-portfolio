import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const distDir = path.resolve("dist");

async function homepage() {
  return readFile(path.join(distDir, "index.html"), "utf8");
}

async function renderedBody(file) {
  const html = await readFile(file, "utf8");
  return html.split('<div id="root">')[1] ?? "";
}

test("ships crawlable content before JavaScript runs", async () => {
  const html = await homepage();
  assert.match(html, /<h1[^>]*>I build the small systems that stop work falling through the cracks\.<\/h1>/);
  assert.match(html, /Voice AI restaurant ordering prototype/);
  assert.match(html, /Automated job search and alert pipeline/);
  assert.match(html, /What you can hire me for/);
  assert.match(html, /Tell me what you do manually/);
});

test("renders the projects section from the content directory", async () => {
  const body = await renderedBody(path.join(distDir, "index.html"));
  const cards = body.match(/<article class="project"/g) ?? [];
  const dirs = await readdir(path.join(distDir, "projects"));
  assert.equal(cards.length, dirs.length, "one card per generated case study route");
  assert.ok(cards.length >= 2, "at least the two documented projects render");
});

test("renders the three offer cards from content", async () => {
  const body = await renderedBody(path.join(distDir, "index.html"));
  assert.equal((body.match(/<article class="offer"/g) ?? []).length, 3);
  assert.match(body, /Workflow audit/);
  assert.match(body, /Automation quick win/);
  assert.match(body, /Care plan/);
});

test("the video thumbnail opens Loom in a new tab with rel=noopener", async () => {
  const body = await renderedBody(path.join(distDir, "index.html"));
  const anchor = body.match(/<a[^>]*loom\.com\/share\/c9cfbcbf81d74a678251b7c0fd5fa066[^>]*>/);
  assert.ok(anchor, "the Loom link is present");
  assert.match(anchor[0], /target="_blank"/);
  assert.match(anchor[0], /rel="noopener"/);
});

test("the funnel reports the recorded run without a chart library", async () => {
  const body = await renderedBody(path.join(distDir, "index.html"));
  for (const count of ["124", "7", "5"]) {
    assert.match(body, new RegExp(`funnelCount[^>]*>${count}<`), `stage count ${count} renders`);
  }
  assert.match(body, /Collected from 3 sources/);
  assert.match(body, /Sent to Telegram/);
});

test("heading levels run in order with no skipped levels", async () => {
  const files = [path.join(distDir, "index.html")];
  for (const dir of await readdir(path.join(distDir, "projects"))) {
    files.push(path.join(distDir, "projects", dir, "index.html"));
  }

  for (const file of files) {
    const body = await renderedBody(file);
    const levels = [...body.matchAll(/<h([1-6])[^>]*>/g)].map((match) => Number(match[1]));
    assert.equal(levels.filter((level) => level === 1).length, 1, `${file} has exactly one h1`);
    levels.reduce((previous, level) => {
      assert.ok(level <= previous + 1, `${file} skips from h${previous} to h${level}`);
      return level;
    }, 0);
  }
});

test("every rendered image carries real alt text and intrinsic dimensions", async () => {
  const body = await renderedBody(path.join(distDir, "index.html"));
  const images = [...body.matchAll(/<img\b[^>]*>/g)].map((match) => match[0]);
  assert.ok(images.length > 0, "the homepage renders images");

  for (const tag of images) {
    const alt = tag.match(/\balt="([^"]*)"/);
    assert.ok(alt, `image has an alt attribute: ${tag}`);
    assert.ok(alt[1].length > 15, `alt text is descriptive, not a label: ${alt[1]}`);
    assert.doesNotMatch(alt[1], /^screenshot$/i);
    assert.match(tag, /\bwidth="\d+"/, `image sets width: ${tag}`);
    assert.match(tag, /\bheight="\d+"/, `image sets height: ${tag}`);
  }
});

test("every id on a rendered page is unique", async () => {
  // A section id and a form field id collided once. Duplicate ids are invalid
  // HTML and quietly break in-page anchors and label associations.
  const files = [path.join(distDir, "index.html")];
  for (const dir of await readdir(path.join(distDir, "projects"))) {
    files.push(path.join(distDir, "projects", dir, "index.html"));
  }

  for (const file of files) {
    const body = await renderedBody(file);
    const ids = [...body.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    assert.deepEqual([...new Set(duplicates)], [], `duplicate ids in ${file}`);
  }
});

test("every label points at a field that exists", async () => {
  const body = await renderedBody(path.join(distDir, "index.html"));
  const ids = new Set([...body.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
  const targets = [...body.matchAll(/\bfor="([^"]+)"/g)].map((match) => match[1]);
  assert.ok(targets.length >= 3, "the contact form renders visible labels");
  for (const target of targets) {
    assert.ok(ids.has(target), `label for="${target}" has no matching element`);
  }
});

test("the contact form uses visible labels, not placeholder-only labels", async () => {
  const body = await renderedBody(path.join(distDir, "index.html"));
  const form = body.match(/<form class="contactForm"[\s\S]*?<\/form>/)?.[0] ?? "";
  assert.ok(form, "the contact form renders server-side");

  const labels = [...form.matchAll(/<label for="([^"]+)">([^<]+)<\/label>/g)];
  assert.equal(labels.length, 3, "three visible labels");
  for (const [, , text] of labels) assert.ok(text.trim().length > 0, "the label has visible text");

  // A placeholder is not a label.
  const visible = form.replace(/<input class="honeypot"[^>]*>/, "");
  assert.doesNotMatch(visible, /\bplaceholder=/);
});

test("the honeypot stays hidden from assistive technology and the tab order", async () => {
  const body = await renderedBody(path.join(distDir, "index.html"));
  const honeypot = body.match(/<input class="honeypot"[^>]*>/)?.[0] ?? "";
  assert.ok(honeypot, "the honeypot renders");
  assert.match(honeypot, /aria-hidden="true"/);
  assert.match(honeypot, /tabindex="-1"/i);
});

test("publishes complete search and social metadata", async () => {
  const html = await homepage();
  assert.match(html, /rel="canonical" href="https:\/\/caleb-oke-portfolio\.vercel\.app\/"/);
  assert.match(html, /name="robots" content="index, follow/);
  assert.match(html, /property="og:title"/);
  assert.match(html, /name="twitter:card" content="summary_large_image"/);
  assert.match(html, /type="application\/ld\+json"/);
  assert.match(html, /"@type": "ProfilePage"/);
});

test("self-hosts both fonts and preloads the latin subsets", async () => {
  const html = await homepage();
  assert.match(html, /rel="preload" as="font"[^>]*instrument-serif-latin\.woff2/);
  assert.match(html, /rel="preload" as="font"[^>]*public-sans-latin\.woff2/);
  assert.doesNotMatch(html, /fonts\.googleapis\.com/);
  assert.doesNotMatch(html, /fonts\.gstatic\.com/);
});

test("the inlined stylesheet uses only the five palette colours", async () => {
  const html = await homepage();
  const css = html.match(/<style>([\s\S]*?)<\/style>/)?.[1] ?? "";
  assert.ok(css.length > 0, "CSS is inlined into the page");

  // #0000 is `transparent` after minification. It reserves space for a hover
  // underline so the layout does not shift, and paints nothing, so it is the
  // absence of a colour rather than a sixth one.
  const palette = new Set(["#faf8f4", "#1a1917", "#6b6a64", "#e5e2da", "#14584a", "#0000"]);
  const found = new Set((css.match(/#[0-9a-fA-F]{3,8}\b/g) ?? []).map((hex) => hex.toLowerCase()));
  const strays = [...found].filter((hex) => !palette.has(hex));
  assert.deepEqual(strays, [], `non-palette colours in the stylesheet: ${strays.join(", ")}`);

  const functional = css.match(/\b(rgba?|hsla?)\([^)]*\)/g) ?? [];
  assert.deepEqual(functional, [], `functional colour values in the stylesheet: ${functional.join(", ")}`);
});

// The stylesheet is not the only place a colour reaches a screen.
// manifest.json paints Android browser chrome and the installed splash
// screen, and it is JSON, so the stylesheet check above cannot see it.
// This caught #05080d, the dark navy left behind by the previous design.
test("manifest.json uses only the five palette colours", async () => {
  const manifest = JSON.parse(await readFile(new URL("../public/manifest.json", import.meta.url), "utf8"));

  const palette = new Set(["#faf8f4", "#1a1917", "#6b6a64", "#e5e2da", "#14584a"]);
  const colourKeys = ["theme_color", "background_color"];

  for (const key of colourKeys) {
    const value = manifest[key];
    assert.ok(value, `manifest.json is missing ${key}`);
    assert.ok(
      palette.has(String(value).toLowerCase()),
      `manifest.json ${key} is ${value}, which is not one of the five palette colours`,
    );
  }

  // Catch a colour added under a key this test does not yet know about.
  const strays = Object.entries(manifest)
    .filter(([key, value]) => typeof value === "string" && /^#[0-9a-fA-F]{3,8}$/.test(value) && !colourKeys.includes(key))
    .map(([key, value]) => `${key}: ${value}`);
  assert.deepEqual(strays, [], `unchecked colour values in manifest.json: ${strays.join(", ")}`);
});

// The manifest is also user-visible copy, and drifted from the site once
// already: it described an "AI Automation Engineer" long after the site
// settled on "builder".
test("manifest.json copy matches the site", async () => {
  const manifest = JSON.parse(await readFile(new URL("../public/manifest.json", import.meta.url), "utf8"));

  assert.match(manifest.name, /AI automation builder/, "manifest name should use the site's own role wording");
  assert.doesNotMatch(
    `${manifest.name} ${manifest.description}`,
    /Engineer|Production|intelligent/i,
    "manifest still carries pre-redesign marketing copy",
  );
});
