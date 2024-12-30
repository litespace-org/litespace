import { cache } from "@fixtures/cache";
import { genSessionId } from "@/lib/utils";
import { expect } from "chai";

describe("Testing cache/session functions", () => {
  beforeAll(async () => {
    await cache.connect();
  });

  afterAll(async () => {
    await cache.disconnect();
  });

  beforeEach(async () => {
    await cache.flush();
  });

  it("should add/retrieve members to/from the cache", async () => {
    const session1 = genSessionId("lesson");
    const session2 = genSessionId("lesson");

    await cache.session.addMember({ sessionId: session1, userId: 1 });
    await cache.session.addMember({ sessionId: session1, userId: 2 });
    await cache.session.addMember({ sessionId: session2, userId: 3 });

    const res1 = await cache.session.getMembers(session1);
    expect(res1).to.have.length(2);
    expect(res1).to.contains(1);
    expect(res1).to.contains(2);

    const res2 = await cache.session.getMembers(session2);
    expect(res2).to.have.length(1);
    expect(res2).to.contains(3);
  });

  it("should NOT add (duplicate) the same user to the same session twice", async () => {
    const sessionId = genSessionId("lesson");
    await cache.session.addMember({ sessionId, userId: 1 });
    await cache.session.addMember({ sessionId, userId: 1 });

    const res = await cache.session.getMembers(sessionId);
    expect(res).to.have.length(1);
  });

  it("should remove member from the cache", async () => {
    const sessionId = genSessionId("lesson");
    await cache.session.addMember({ sessionId, userId: 1 });
    await cache.session.addMember({ sessionId, userId: 2 });

    await cache.session.removeMemberByUserId(1);

    const res = await cache.session.getMembers(sessionId);
    expect(res).to.deep.eq([2]);
  });

  it("should check if a specific member exists in the cache", async () => {
    const sessionId = genSessionId("lesson");
    await cache.session.addMember({ sessionId, userId: 1 });
    await cache.session.addMember({ sessionId, userId: 2 });

    const res1 = await cache.session.isMember({ sessionId, userId: 1 });
    const res2 = await cache.session.isMember({ sessionId, userId: 3 });
    const res3 = await cache.session.isMember({ sessionId: genSessionId("lesson"), userId: 2 });

    expect(res1).to.true;
    expect(res2).to.false;
    expect(res3).to.false;
  });
});
