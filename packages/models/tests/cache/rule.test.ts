import { cache } from "@fixtures/cache";
import { expect } from "chai";
import dayjs from "dayjs";
import { first } from "lodash";

describe("Testing cache/rules functions", () => {
  beforeAll(async () => {
    await cache.connect();
  });

  afterAll(async () => {
    await cache.disconnect();
  });

  beforeEach(async () => {
    await cache.flush();
  });

  it("should set/retreive one rule in/from the cache", async () => {
    await cache.rules.setOne({ tutor: 1, rule: 1, events: [] })
    let res = await cache.rules.getOne({ tutor: 1, rule: 1 })
    expect(res).to.have.length(0);

    const mockRuleEvent = {
      id: 1,
      start: dayjs().toISOString(),
      end: dayjs().add(1, "hour").toISOString(),
    }

    await cache.rules.setOne({ tutor: 1, rule: 1, events: [mockRuleEvent] });
    res = await cache.rules.getOne({ tutor: 1, rule: 1 })
    expect(res).to.have.length(1);
    expect(first(res)).to.deep.eq(mockRuleEvent);
  });

  it("should set/retreive many rules in/from the cache", async () => {
    const mockRuleEvents = [
      {
        id: 1,
        start: dayjs().toISOString(),
        end: dayjs().add(1, "hour").toISOString(),
      },
      {
        id: 2,
        start: dayjs().add(1, "day").toISOString(),
        end: dayjs().add(2, "days").toISOString(),
      },
    ]

    const mock1 = { tutor: 1, rule: 1, events: [mockRuleEvents[0]] };
    const mock2 = { tutor: 2, rule: 2, events: [mockRuleEvents[1]] };

    await cache.rules.setMany([mock1, mock2]);

    const res = await cache.rules.getAll()
    expect(res).to.have.length(2);
    expect(res).to.deep.contains(mock1);
    expect(res).to.deep.contains(mock2);
  });

  it("should remove one rule from the cache", async () => {
    await cache.rules.setOne({ tutor: 1, rule: 1, events: [] })
    await cache.rules.deleteOne({ tutor: 1, rule: 1 });
    const res = await cache.rules.getOne({ tutor: 1, rule: 1 });
    expect(res).to.eq(null);
  });

  it("should check if rules key does exist in the cache", async () => {
    expect(await cache.rules.exists()).to.false;
    await cache.rules.setOne({ tutor: 1, rule: 1, events: [] })
    expect(await cache.rules.exists()).to.true;
  });
});
