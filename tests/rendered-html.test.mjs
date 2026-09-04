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
  assert.match(html, /<h1[^>]*>I build the systems that stop work falling through the cracks\.<\/h1>/);
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

test("self-hosts one font family and preloads the subset that paints the hero", async () => {
  const html = await homepage();
  const css = html.match(/<style>([\s\S]*?)<\/style>/)?.[1] ?? "";

  assert.match(html, /rel="preload" as="font"[^>]*public-sans-latin\.woff2/);
  assert.doesNotMatch(html, /fonts\.googleapis\.com/);
  assert.doesNotMatch(html, /fonts\.gstatic\.com/);

  // The h1 is the LCP element, so the preloaded file must be the one that
  // paints it. A preload for a face no longer used is wasted bandwidth on
  // the critical path.
  const preloads = [...html.matchAll(/rel="preload" as="font"[^>]*href="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(preloads, ["/fonts/public-sans-latin.woff2"], "exactly one font is preloaded");
  assert.doesNotMatch(css, /Instrument Serif/, "the display face is no longer Instrument Serif");

  // base.css sets font-synthesis: none, so a face declared at a single
  // weight would make the 700 and 800 headings render at the nearest
  // declared weight instead - silently, with no error and no fallback.
  const faces = css.split("@font-face").slice(1);
  assert.ok(faces.length > 0, "fonts are declared with @font-face");
  for (const face of faces) {
    assert.match(face, /font-weight:\s*100 900/, "each face exposes the full variable weight axis");
  }
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

/* A visitor arriving on a case study from search has not seen the homepage.
   These four guarantees are what make that page stand on its own. */
test("case study pages carry the site header, footer and status badge", async () => {
  const dirs = await readdir(path.join(distDir, "projects"));
  assert.ok(dirs.length > 0, "there is at least one generated case study");

  for (const slug of dirs) {
    const body = await renderedBody(path.join(distDir, "projects", slug, "index.html"));
    assert.match(body, /class="siteHeader"/, `${slug} has the site header`);
    assert.match(body, /class="siteFooter"/, `${slug} has the site footer`);
    assert.match(body, /class="navAction"/, `${slug} offers the contact route`);

    const badge = body.match(/class="badge">([^<]+)</);
    assert.ok(badge && badge[1].trim(), `${slug} states its status above the title`);
  }
});

test("a case study shows at least the evidence its homepage card shows", async () => {
  const home = await renderedBody(path.join(distDir, "index.html"));
  // Each chunk must stop at the end of its card, or the last one runs on
  // into the about section and picks up the portrait.
  const cards = home
    .split('<article class="project"')
    .slice(1)
    .map((chunk) => chunk.split("Read the full case study")[0]);
  const dirs = await readdir(path.join(distDir, "projects"));
  assert.equal(cards.length, dirs.length);

  const images = (markup) =>
    new Set([
      ...[...markup.matchAll(/<img[^>]*src="(\/images\/[^"]*)"/g)].map((m) => m[1]),
      ...[...markup.matchAll(/--bg-fallback:url\(&quot;([^&]*)/g)].map((m) => m[1]),
    ]);

  for (const card of cards) {
    const slug = card.match(/\/projects\/([a-z0-9-]+)"/)?.[1];
    assert.ok(slug, "card links to its case study");
    const page = await renderedBody(path.join(distDir, "projects", slug, "index.html"));

    for (const src of images(card)) {
      assert.ok(images(page).has(src), `${slug} case study is missing ${src}, which its card shows`);
    }
    if (/class="funnel"/.test(card)) {
      assert.match(page, /class="funnel"/, `${slug} case study is missing the funnel its card shows`);
    }
  }
});

test("no page ships a heading with no content behind it", async () => {
  const dirs = await readdir(path.join(distDir, "projects"));
  for (const slug of dirs) {
    const body = await renderedBody(path.join(distDir, "projects", slug, "index.html"));
    assert.doesNotMatch(body, /Full write-up to follow/, `${slug} promises a write-up that does not exist`);
  }
});

/* Standalone link rows are not inline-in-a-sentence, so they do not get the
   inline exception to WCAG 2.5.8. Each was 17-19px tall before this padding. */
test("standalone link rows clear the 24px target size", async () => {
  const css = (await homepage()).match(/<style>([\s\S]*?)<\/style>/)?.[1] ?? "";
  const rows = [".navPanelSocial a", ".heroSocial a", ".contactDirect a", ".footerNav a", ".projectFoot a"];

  // Split into rules rather than building a regex per selector, so the
  // selector strings stay literal and need no escaping.
  const rules = css.split("}").map((chunk) => {
    const [selector, body = ""] = chunk.split("{");
    return { selector: selector.trim(), body };
  });

  for (const selector of rows) {
    const rule = rules.find(
      (r) => r.selector.split(",").some((part) => part.trim() === selector) && /padding-block:/.test(r.body),
    );
    assert.ok(rule, `${selector} declares padding-block so its target clears 24px`);
    const px = Number(rule.body.match(/padding-block:\s*(\d+)px/)[1]);
    assert.ok(px >= 4, `${selector} padding-block is ${px}px, too small to reach 24px`);
  }
});

/* This one was briefly shipped as a no-op: the cap was declared above an
   existing `max-width: none` in the same rule and lost to it. */
test("image captions are capped to the prose measure", async () => {
  const css = (await homepage()).match(/<style>([\s\S]*?)<\/style>/)?.[1] ?? "";
  const rule = css
    .split("}")
    .map((chunk) => chunk.split("{"))
    .find(([selector]) => selector.trim().endsWith(".mediaCaption") && !selector.includes("data-align"));

  assert.ok(rule, "the .mediaCaption rule exists");
  const widths = [...rule[1].matchAll(/max-width:\s*([^;]+)/g)].map((m) => m[1].trim());
  assert.ok(widths.length > 0, "captions declare a max-width");
  assert.equal(widths.at(-1), "var(--measure)", "the winning max-width caps captions to the prose measure");
});

/* The header and footer render on case study pages as well as the homepage,
   so a bare "#work" resolves against a page with no such id and the link
   silently does nothing. Four of them shipped that way. */
test("no page links to an anchor it does not contain", async () => {
  const pages = [path.join(distDir, "index.html")];
  for (const slug of await readdir(path.join(distDir, "projects"))) {
    pages.push(path.join(distDir, "projects", slug, "index.html"));
  }

  for (const page of pages) {
    const html = await readFile(page, "utf8");
    const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
    const anchors = [...new Set([...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]))];
    const dead = anchors.filter((a) => !ids.has(a));
    assert.deepEqual(dead, [], `${path.relative(distDir, page)} links to missing anchors: ${dead.join(", ")}`);
  }
});
