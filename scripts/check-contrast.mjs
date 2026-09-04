// Verifies the palette against WCAG 2.1 contrast thresholds.
// Run: node scripts/check-contrast.mjs
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/styles/tokens.css", import.meta.url), "utf8");
const token = (name) => {
  const match = css.match(new RegExp(`--${name}:[ ]*(#[0-9A-Fa-f]{6})`));
  if (!match) throw new Error(`token --${name} not found in tokens.css`);
  return match[1];
};

const channel = (v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};
const ratio = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

const bg = token("bg");
const text = token("text");
const accent = token("accent");

// Every foreground/background pair the built page actually renders.
const required = [
  ["--text on --bg", text, bg, 4.5, "body copy"],
  ["--muted on --bg", token("muted"), bg, 4.5, "captions, metadata"],
  ["--accent on --bg", accent, bg, 4.5, "links, status badge, focus ring"],
  ["--bg on --accent", bg, accent, 4.5, "primary button label"],
  ["--bg on --text", bg, text, 4.5, "primary button label, hover"],
  ["--accent on --bg (3:1)", accent, bg, 3.0, "focus ring vs page, 1.4.11"],
];

// Reported but not gated: 1px rules and image outlines are decoration, and
// WCAG 1.4.11 exempts purely decorative boundaries. Listed so the number is
// never a surprise. See the Phase 1 note about input borders.
const informational = [
  ["--border on --bg", token("border"), bg, "hairline rules, card and image outlines"],
  ["--muted on --bg (as border)", token("muted"), bg, "suggested for input borders, meets 3:1"],
];

let failed = 0;
console.log("Required pairs\n");
for (const [label, fg, back, threshold, use] of required) {
  const value = ratio(fg, back);
  const pass = value >= threshold;
  if (!pass) failed += 1;
  const grade = value >= 7 ? "AAA" : value >= 4.5 ? "AA" : value >= 3 ? "AA-large" : "-";
  console.log(
    `  ${pass ? "PASS" : "FAIL"}  ${label.padEnd(24)} ${value.toFixed(2).padStart(6)}:1  ` +
    `needs ${String(threshold).padEnd(4)} ${grade.padEnd(9)} ${use}`,
  );
}

console.log("\nInformational, not gated\n");
for (const [label, fg, back, use] of informational) {
  console.log(`  ....  ${label.padEnd(24)} ${ratio(fg, back).toFixed(2).padStart(6)}:1  ${" ".repeat(19)}${use}`);
}

console.log(failed ? `\n${failed} required pair(s) below threshold.` : "\nAll required pairs pass.");
process.exit(failed ? 1 : 0);
