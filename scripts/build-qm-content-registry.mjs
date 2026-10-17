import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { getBrowserContentRegistry, getLockedChapterIds } from "../lib/qm-content-registry.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const browserAssetPath = path.join(rootDir, "assets/qm-content-registry.js");
const vercelConfigPath = path.join(rootDir, "vercel.json");
const registry = getBrowserContentRegistry();
const lockedChapterIds = getLockedChapterIds();

const browserAsset = `/* Generated from data/qm-content-registry.json. Do not edit directly. */\n(() => {\n  window.QMContentRegistry = Object.freeze(${JSON.stringify(registry, null, 2)});\n})();\n`;
export function withChapterRedirects(config, lockedIds) {
  return {
    ...config,
    redirects: [
      ...(config.redirects || []).filter(route => !/^\/slides\/chapter-\d{2}\/:path\*$/.test(route.source)),
      ...lockedIds.map(chapterId => ({
        source: `/slides/chapter-${chapterId}/:path*`,
        destination: `/?view=chapters&chapter=${chapterId}`,
        permanent: false
      }))
    ]
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const config = JSON.parse(await readFile(vercelConfigPath, "utf8"));
  await writeFile(browserAssetPath, browserAsset, "utf8");
  await writeFile(vercelConfigPath, `${JSON.stringify(withChapterRedirects(config, lockedChapterIds), null, 2)}\n`, "utf8");
  console.log(`Content registry built: ${lockedChapterIds.length} chapters unavailable; unrelated hosting rules preserved.`);
}
