import path from "node:path";
import { fileURLToPath } from "node:url";
import { readdir, readFile, access } from "node:fs/promises";
import { constants } from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const dataDir = path.join(rootDir, "data");

let hasErrors = false;

async function exists(filePath) {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function fail(message) {
  hasErrors = true;
  console.error(`ERROR: ${message}`);
}

function warn(message) {
  console.warn(`WARNING: ${message}`);
}

async function validateChapterFile(fileName) {
  const filePath = path.join(dataDir, fileName);
  const raw = await readFile(filePath, "utf8");
  let parsed;

  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    fail(`${fileName} does not contain valid JSON: ${error}`);
    return;
  }

  if (!Array.isArray(parsed.topics)) {
    fail(`${fileName} must contain an array "topics".`);
    return;
  }

  if (typeof parsed.description !== "string") {
    warn(`${fileName} does not have "description" as text.`);
  }

  for (const [index, topic] of parsed.topics.entries()) {
    const label = `${fileName} -> topic ${index + 1}`;

    if (!topic || typeof topic !== "object") {
      fail(`${label} is not a valid object.`);
      continue;
    }

    if (typeof topic.id !== "string" || !topic.id.trim()) {
      fail(`${label} is missing "id".`);
    }

    if (typeof topic.title !== "string" || !topic.title.trim()) {
      fail(`${label} is missing "title".`);
    }

    if (typeof topic.url !== "string" || !topic.url.trim()) {
      fail(`${label} is missing "url".`);
      continue;
    }

    const isPlanned = topic.status === "planned";
    const targetPath = path.join(rootDir, topic.url);
    if (!isPlanned && !(await exists(targetPath))) {
      fail(`${label} points to a missing file: ${topic.url}`);
    }
  }
}

const entries = await readdir(dataDir);
const chapterFiles = entries
  .filter((fileName) => /^chapter-\d+\.json$/.test(fileName))
  .sort();

if (chapterFiles.length === 0) {
  fail("No chapter file was found in /data.");
}

for (const fileName of chapterFiles) {
  await validateChapterFile(fileName);
}

if (hasErrors) {
  process.exitCode = 1;
} else {
  console.log(`Structure validated successfully: ${chapterFiles.length} chapter files checked.`);
}
