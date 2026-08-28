import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const outputDirectory = path.resolve(process.argv[2] || ".cms-private");
const email = (process.argv[3] || "okecaleb139@gmail.com").trim().toLowerCase();
const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
const random = randomBytes(28);
const password = [...random].map((byte) => alphabet[byte % alphabet.length]).join("");
const salt = randomBytes(24);
const N = 131072;
const r = 8;
const p = 1;
const derived = await scrypt(password, salt, 32, { N, r, p, maxmem: 256 * 1024 * 1024 });
const passwordHash = `$scrypt$${N}$${r}$${p}$${salt.toString("base64url")}$${Buffer.from(derived).toString("base64url")}$v1`;
const rateLimitSecret = randomBytes(32).toString("base64url");

await mkdir(outputDirectory, { recursive: true });
await writeFile(path.join(outputDirectory, "cms-admin.env"), [
  `CMS_ADMIN_EMAIL=${email}`,
  `CMS_ADMIN_PASSWORD_HASH=${passwordHash}`,
  `CMS_DUMMY_PASSWORD_HASH=${passwordHash}`,
  `CMS_RATE_LIMIT_SECRET=${rateLimitSecret}`,
  "",
].join("\n"), { mode: 0o600 });
await writeFile(path.join(outputDirectory, "CMS_ADMIN_ACCESS.txt"), [
  "Caleb Oke Portfolio CMS",
  "",
  `Admin URL: https://caleb-oke-portfolio.vercel.app/admin`,
  `Email: ${email}`,
  `Temporary password: ${password}`,
  "",
  "Sign in, open Security, and replace this temporary password. Delete this file after changing it.",
  "",
].join("\n"), { mode: 0o600 });
console.log(`Credential files created in ${outputDirectory}. The password was not printed to the terminal.`);
