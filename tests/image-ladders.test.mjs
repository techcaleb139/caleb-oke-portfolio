import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { LAYOUT, cardInner, cardCapViewport, imageRecipes } from "../lib/image-sizes.ts";

const read = (rel) => readFile(new URL(rel, import.meta.url), "utf8");

/* TypeScript cannot read a CSS custom property, so lib/image-sizes.ts mirrors
   a handful of layout values and computes every ladder from them. This is the
   seam where the two can drift, and it did drift once: --col 900 became
   --w-wide 1240 and the ladders silently kept their old numbers. Nothing
   failed, because wrong-sized images still render. */

/** Read a custom property from a stylesheet, optionally from inside the one
    max-width media block rather than :root. */
function token(css, name, { mobile = false } = {}) {
  const scope = mobile ? css.slice(css.indexOf("@media (max-width: 720px)")) : css.split("@media")[0];
  const found = scope.match(new RegExp(`--${name}:\\s*([^;]+);`));
  assert.ok(found, `--${name} is declared${mobile ? " in the mobile block" : ""}`);
  return found[1].trim();
}

test("LAYOUT matches the width tokens in tokens.css", async () => {
  const css = await read("../src/styles/tokens.css");

  assert.equal(token(css, "w-wide"), `${LAYOUT.wide}px`);
  assert.equal(token(css, "gutter"), `${LAYOUT.gutter}px`);
  assert.equal(token(css, "card-pad"), `${LAYOUT.cardPad}px`);
  assert.equal(token(css, "gutter", { mobile: true }), `${LAYOUT.gutterSmall}px`);
  assert.equal(token(css, "card-pad", { mobile: true }), `${LAYOUT.cardPadSmall}px`);
});

test("LAYOUT matches the evidence grid in components.css", async () => {
  const css = await read("../src/styles/components.css");

  const gap = css.match(/\.evidence\s*\{[^}]*gap:\s*(\d+)px/);
  assert.ok(gap, ".evidence declares a gap");
  assert.equal(Number(gap[1]), LAYOUT.evidenceGap);

  const cols = css.match(/\.evidence\[data-count="2"\]\s*\{[^}]*grid-template-columns:\s*([\d.]+)fr\s+1fr/);
  assert.ok(cols, '.evidence[data-count="2"] declares two fr columns');
  assert.equal(Number(cols[1]), LAYOUT.evidenceMajor);
});

test("LAYOUT matches the slot constraints in the project content", async () => {
  const jobs = await read("../src/content/projects/automated-job-search-alert-pipeline.ts");
  const voice = await read("../src/content/projects/voice-ai-restaurant-ordering-prototype.ts");

  const maxWidth = jobs.match(/maxWidth:\s*"(\d+)px"/);
  assert.ok(maxWidth, "the Telegram slot pins a maxWidth");
  assert.equal(Number(maxWidth[1]), LAYOUT.telegramSlot);

  const zoom = voice.match(/zoom:\s*(\d+)/);
  assert.ok(zoom, "the transcript slot declares a zoom");
  assert.equal(Number(zoom[1]) / 100, LAYOUT.transcriptZoom);
});

test("the mobile breakpoint in LAYOUT is the only one in the stylesheets", async () => {
  for (const file of ["tokens.css", "base.css", "components.css", "layout.css"]) {
    const css = await read(`../src/styles/${file}`);
    for (const [, px] of css.matchAll(/@media\s*\(max-width:\s*(\d+)px\)/g)) {
      assert.equal(
        Number(px),
        LAYOUT.mobileBreakpoint,
        `${file} uses a ${px}px breakpoint, but the ladders assume ${LAYOUT.mobileBreakpoint}px`,
      );
    }
  }
});

test("every recipe is derived, so no ladder can be edited into disagreement", () => {
  // cardInner and cardCapViewport are the two numbers the sizes strings are
  // built from. If either is wrong, every full-width slot is wrong.
  assert.equal(cardInner, LAYOUT.wide - 2 * LAYOUT.cardPad);
  assert.equal(cardCapViewport, LAYOUT.wide + 2 * LAYOUT.gutter);

  const full = imageRecipes["test-call-thumbnail.png"];
  assert.deepEqual(full.widths, [0.5, 1, 1.5, 2].map((m) => Math.round(cardInner * m)));
  assert.match(full.sizes, new RegExp(`${cardInner}px$`));
  assert.match(full.sizes, new RegExp(`max-width: ${cardCapViewport}px`));
  assert.match(full.sizes, new RegExp(`max-width: ${LAYOUT.mobileBreakpoint}px`));

  // Every slot that is not a background must tell the browser its width.
  for (const [name, recipe] of Object.entries(imageRecipes)) {
    assert.ok(recipe.widths.length > 0, `${name} has a ladder`);
    assert.ok(recipe.widths.every((w) => Number.isInteger(w) && w > 0), `${name} has whole-pixel widths`);
    if (!recipe.background) assert.ok(recipe.sizes.length > 0, `${name} declares sizes`);
  }
});
