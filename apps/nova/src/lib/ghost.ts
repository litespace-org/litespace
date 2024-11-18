// todo: move logic into provider
const search = new URLSearchParams(location.search);

export const ghostToken = search.get("ghost-token");
export const isGhost = !!ghostToken;
