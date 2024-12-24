import { cache } from "@fixtures/cache";
import { expect } from "chai";

describe("Testing cache/call functions", () => {
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
    await cache.call.addMember({ callId: 1, userId: 1 });
    await cache.call.addMember({ callId: 1, userId: 2 });
    await cache.call.addMember({ callId: 2, userId: 3 });

    const res1 = await cache.call.getMembers(1);
    expect(res1).to.have.length(2);
    expect(res1).to.contains(1);
    expect(res1).to.contains(2);

    const res2 = await cache.call.getMembers(2);
    expect(res2).to.have.length(1);
    expect(res2).to.contains(3);
  });

  it("should NOT add (duplicate) the same user to the same call twice", async () => {
    await cache.call.addMember({ callId: 1, userId: 1 });
    await cache.call.addMember({ callId: 1, userId: 1 });

    const res = await cache.call.getMembers(1);
    expect(res).to.have.length(1);
  });

  it("should remove member from the cache", async () => {
    await cache.call.addMember({ callId: 1, userId: 1 });
    await cache.call.addMember({ callId: 1, userId: 2 });

    await cache.call.removeMemberByUserId(1);

    const res = await cache.call.getMembers(1);
    expect(res).to.deep.eq([2]);
  });

  it("should check if a specific member exists in the cache", async () => {
    await cache.call.addMember({ callId: 1, userId: 1 });
    await cache.call.addMember({ callId: 1, userId: 2 });

    const res1 = await cache.call.isMember({ callId: 1, userId: 1 });
    const res2 = await cache.call.isMember({ callId: 1, userId: 3 });
    const res3 = await cache.call.isMember({ callId: 2, userId: 2 });

    expect(res1).to.true;
    expect(res2).to.false;
    expect(res3).to.false;
  });
});
