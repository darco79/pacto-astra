import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const manifestPath = "vendor-assets/manifest.json";

if (!existsSync(manifestPath)) {
  console.log("Sin manifiesto de assets; se usan los archivos ya presentes.");
  process.exit(0);
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
let restored = 0;

for (const item of manifest) {
  const joined = item.parts
    .map((part) => readFileSync(`vendor-assets/parts/${item.path}/${part}`, "utf8").replace(/\s+/g, ""))
    .join("");
  const bytes = Buffer.from(joined, "base64");
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  if (sha256 !== item.sha256) {
    console.error(`SHA256 distinto en ${item.path}`);
    process.exit(1);
  }
  if (existsSync(item.path)) {
    const current = createHash("sha256").update(readFileSync(item.path)).digest("hex");
    if (current === sha256) continue;
  }
  mkdirSync(dirname(item.path), { recursive: true });
  writeFileSync(item.path, bytes);
  restored += 1;
}

console.log(`Assets restaurados: ${restored}/${manifest.length}`);
