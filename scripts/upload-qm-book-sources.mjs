import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const BUCKET = "qm-book-sources";
const SOURCES = [
  ["chapter-01-theory", "01", "theory", "/Users/marioreis/Desktop/qm/c1 Reis Quantum Mechanics copy 2.pdf", "chapters/01/theory.pdf"],
  ["chapter-01-solutions", "01", "solutions", "/Users/marioreis/Desktop/qm/c1_Reis QM solutions copy 3.pdf", "chapters/01/solutions.pdf"],
  ["chapter-02-theory", "02", "theory", "/Users/marioreis/Desktop/qm/c2 Reis Quantum Mechanics copy 3.pdf", "chapters/02/theory.pdf"],
  ["chapter-02-solutions", "02", "solutions", "/Users/marioreis/Desktop/qm/c2_Reis QM solutions copy 3.pdf", "chapters/02/solutions.pdf"],
  ["chapter-03-theory", "03", "theory", "/Users/marioreis/Desktop/qm/c3 Reis Quantum Mechanics copy 4.pdf", "chapters/03/theory.pdf"],
  ["chapter-03-solutions", "03", "solutions", "/Users/marioreis/Desktop/qm/c3_Reis QM solutions copy 3.pdf", "chapters/03/solutions.pdf"]
];

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
  }
}

function pdfPageCount(path) {
  const result = spawnSync("pdfinfo", [path], { encoding: "utf8" });
  const match = String(result.stdout || "").match(/^Pages:\s+(\d+)/m);
  return match ? Number(match[1]) : null;
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const url = String(process.env.PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY;
if (!url || !serviceKey) {
  throw new Error("Set PUBLIC_SUPABASE_URL and a server-only SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY) before uploading.");
}

for (const [sourceKey, chapterId, sourceKind, localPath, storagePath] of SOURCES) {
  if (!existsSync(localPath)) throw new Error(`Missing PDF: ${localPath}`);
  const bytes = readFileSync(localPath);
  const response = await fetch(`${url}/storage/v1/object/${BUCKET}/${storagePath}`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/pdf",
      "x-upsert": "true"
    },
    body: bytes
  });
  if (!response.ok) throw new Error(`Storage upload failed for ${sourceKey}: ${response.status} ${await response.text()}`);

  const metadata = {
    source_key: sourceKey,
    chapter_id: chapterId,
    source_kind: sourceKind,
    storage_bucket: BUCKET,
    storage_path: storagePath,
    original_filename: localPath.split("/").at(-1),
    sha256: createHash("sha256").update(bytes).digest("hex"),
    byte_size: bytes.length,
    pdf_page_count: pdfPageCount(localPath),
    is_active: true,
    uploaded_at: new Date().toISOString()
  };
  const metadataResponse = await fetch(`${url}/rest/v1/qm_book_sources?on_conflict=source_key`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal"
    },
    body: JSON.stringify(metadata)
  });
  if (!metadataResponse.ok) throw new Error(`Metadata upsert failed for ${sourceKey}: ${metadataResponse.status} ${await metadataResponse.text()}`);
  console.log(`Uploaded ${sourceKey} (${bytes.length} bytes)`);
}
