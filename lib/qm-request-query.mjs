export function queryFromRequestUrl(value = "") {
  const url = new URL(String(value || "/"), "http://localhost");
  return Object.fromEntries(url.searchParams.entries());
}
