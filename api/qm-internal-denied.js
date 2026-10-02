export default function handler(req, res) {
  res.setHeader("Cache-Control", "private, no-store");
  return res.status(404).json({ error: "Not found." });
}
