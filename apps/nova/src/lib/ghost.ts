// todo: move logic into provider
function getGhostParams() {
  const search = new URLSearchParams(location.search);
  const token = search.get("ghostToken");
  const call = search.get("call");

  return {
    call: call ? Number(call) : null, // todo: add validation
    token, // todo: valid token
  };
}

const { call, token } = getGhostParams();

export const ghostToken = token;
export const ghostCall = call;
export const isGhost = !!token && !!call;
