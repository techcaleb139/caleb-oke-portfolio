/* Build-time webp generation with sharp.
   Imported only by vite.config.vercel.ts, so sharp never enters the client
   module graph and never reaches the browser bundle.

   Output goes to public/images/generated/, which is gitignored. Writing into
   public/ rather than straight into dist/ means the variants also exist under
   `vite dev`: a <source> that 404s does not fall back to the <img>, so a
   dev-only gap would show as a broken image rather than a missing
   optimisation.

   Encoding is skipped when an up-to-date variant already exists, so repeat
   builds cost close to nothing. */
import { mkdir, readdir, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import type { Plugin } from "vite";
import { imageRecipes, variantPath } from "../lib/image-sizes.ts";

const SOURCE_DIR = "public/images";
const OUTPUT_DIR = "public/images/generated";
const QUALITY = 78;

async function mtime(file: string): Promise<number> {
  try {
    return (await stat(file)).mtimeMs;
  } catch {
    return 0;
  }
}

export async function generateImages(log: (message: string) => void = console.log) {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const expected = new Set<string>();
  let encoded = 0;
  let reused = 0;
  let sourceBytes = 0;
  let outputBytes = 0;

  for (const [key, recipe] of Object.entries(imageRecipes)) {
    const source = path.join(SOURCE_DIR, key);
    const sourceStat = await stat(source).catch(() => null);
    if (!sourceStat) {
      throw new Error(`generate-images: ${source} is listed in imageRecipes but does not exist.`);
    }

    const native = await sharp(source).metadata();
    const nativeWidth = native.width ?? 0;
    sourceBytes += sourceStat.size;

    /* Never upscale. Drop any width at or above the native width, then put
       the native width back as the top of the ladder so the largest variant
       is still webp rather than falling through to the source file. */
    const widths = recipe.widths.filter((width) => width < nativeWidth);
    if (widths.length < recipe.widths.length) widths.push(nativeWidth);

    for (const width of widths) {
      const target = path.join("public", variantPath(key, width).slice(1));
      expected.add(path.basename(target));

      if ((await mtime(target)) > sourceStat.mtimeMs) {
        outputBytes += (await stat(target)).size;
        reused += 1;
        continue;
      }

      const buffer = await sharp(source)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toBuffer();
      await writeFile(target, buffer);
      outputBytes += buffer.length;
      encoded += 1;
    }
  }

  /* Clear out variants left behind by an earlier width ladder. */
  let removed = 0;
  for (const name of await readdir(OUTPUT_DIR)) {
    if (expected.has(name)) continue;
    await unlink(path.join(OUTPUT_DIR, name));
    removed += 1;
  }

  log(
    `images: ${encoded} encoded, ${reused} reused${removed ? `, ${removed} stale removed` : ""}. ` +
      `${(sourceBytes / 1024).toFixed(0)}KB of sources -> ${(outputBytes / 1024).toFixed(0)}KB across ${expected.size} variants.`,
  );
}

/* buildStart runs before the public directory is copied into dist, and
   before the dev server starts serving it. */
export function generateImagesPlugin(): Plugin {
  return {
    name: "generate-webp-variants",
    async buildStart() {
      await generateImages((message) => this.info(message));
    },
  };
}
