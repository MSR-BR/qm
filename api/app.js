import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderIndexResponse } from "../lib/qm-index-response.mjs";

const template = readFileSync(join(process.cwd(), "index.html"), "utf8");

export default function handler(req, res) {
  if (!["GET", "HEAD"].includes(req.method)) {
    res.setHeader("Allow", "GET, HEAD");
    return res.status(405).end();
  }
  const url = new URL(req.url, "https://quantummechanicsbook.app");
  const result = renderIndexResponse(template, url.search);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  // OAuth callback parameters and private routes must never enter shared caches.
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("X-Robots-Tag", result.robots);
  res.status(200).end(req.method === "HEAD" ? undefined : result.html);
}
