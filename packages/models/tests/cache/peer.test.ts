import { cache } from "@fixtures/cache";
import { genSessionRowId } from "@litespace/sol";
import { expect } from "chai";

describe("Testing cache/peer functions", () => {
  beforeAll(async () => {
    await cache.connect();
  });

  afterAll(async () => {
    await cache.disconnect();
  });

  beforeEach(async () => {
    await cache.flush();
  });

  it("should set/retrieve user peer id in/from the cache", async () => {
    await cache.peer.setUserPeerId(1, "testing");
    const res = await cache.peer.getUserPeerId(1);
    expect(res).to.eq("testing");
  });

  it("should set/retrieve ghost peer id in/from the cache", async () => {
    const sessId = genSessionRowId("lesson");
    await cache.peer.setGhostPeerId(sessId, "testing");
    const res = await cache.peer.getGhostPeerId(sessId);
    expect(res).to.eq("testing");
  });

  it("should NOT exist overridding between the ghost and the user", async () => {
    const sessId = genSessionRowId("lesson");
    await cache.peer.setGhostPeerId(sessId, "dump");
    // checking if user overrides the ghost or vice versa
    await cache.peer.setUserPeerId(1, "user testing");
    await cache.peer.setGhostPeerId(sessId, "ghost testing");

    const res1 = await cache.peer.getUserPeerId(1);
    const res2 = await cache.peer.getGhostPeerId(sessId);

    expect(res1).to.eq("user testing");
    expect(res2).to.eq("ghost testing");
  });

  it("should remove user peer id from the cache", async () => {
    await cache.peer.setUserPeerId(1, "testing");
    await cache.peer.removeUserPeerId(1);
    const res = await cache.peer.getUserPeerId(1);
    expect(res).to.eq(null);
  });

  it("should remove ghost peer id from the cache", async () => {
    const sessId = genSessionRowId("lesson");
    await cache.peer.setGhostPeerId(sessId, "testing");
    await cache.peer.removeGhostPeerId(sessId);
    const res = await cache.peer.getGhostPeerId(sessId);
    expect(res).to.eq(null);
  });
});
