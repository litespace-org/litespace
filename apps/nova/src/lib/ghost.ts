export function getGhostToken(): string | null {
  const search = new URLSearchParams(location.search);
  const token = search.get("ghostToken");
  return token || null;
}

export function isGhost() {
  return !!getGhostToken();
}
