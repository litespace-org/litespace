import { cache } from "@fixtures/cache";
import { expect } from "chai";

describe("Testing cache/onlineStatus functions", () => {
  beforeAll(async () => {
    await cache.connect();
  });

  afterAll(async () => {
    await cache.disconnect();
  });

  beforeEach(async () => {
    await cache.flush();
  });

  it("should add (check if) user (is) in the online collection", async () => {
    let res = await cache.onlineStatus.isOnline(1);
    expect(res).false;

    await cache.onlineStatus.addUser(1);

    res = await cache.onlineStatus.isOnline(1);
    expect(res).true;
  });

  it("should remove user from the online collection", async () => {
    await cache.onlineStatus.addUser(1);
    await cache.onlineStatus.removeUser(1);
    const res = await cache.onlineStatus.isOnline(1);
    expect(res).false;
  });

  it("should retrieve all online users", async () => {
    await cache.onlineStatus.addUser(1);
    await cache.onlineStatus.addUser(2);
    await cache.onlineStatus.addUser(3);

    const res = await cache.onlineStatus.getAll();
    expect(res["1"]).to.eq("1");
    expect(res["2"]).to.eq("1");
    expect(res["3"]).to.eq("1");
  });

  it("should check if a batch of users are online or not", async () => {
    await cache.onlineStatus.addUser(1);
    await cache.onlineStatus.addUser(2);
    await cache.onlineStatus.addUser(3);

    const res = await cache.onlineStatus.isOnlineBatch([1, 2, 3, 4]);
    expect(res.get(1)).to.true;
    expect(res.get(2)).to.true;
    expect(res.get(3)).to.true;
    expect(res.get(4)).to.false;
  });
});
