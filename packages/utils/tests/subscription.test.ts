import {
  getCurrentWeekBoundaries,
  getCurrentWeekIndex,
  getWeekCount,
} from "@/subscription";
import { nameof } from "@/utils";
import { dayjs } from "@/dayjs";
import { expect } from "chai";

describe(nameof(getCurrentWeekIndex), () => {
  it("should return -1 in case the subscription hasn't started yet", () => {
    const start = dayjs.utc().add(1, "day").toISOString();
    expect(getCurrentWeekIndex(start)).to.be.eq(-1);
  });

  it("should return week index", () => {
    expect(
      getCurrentWeekIndex(dayjs.utc().subtract(1, "day").toISOString())
    ).to.be.eq(0);

    expect(
      getCurrentWeekIndex(dayjs.utc().subtract(1, "week").toISOString())
    ).to.be.eq(1);

    expect(
      getCurrentWeekIndex(dayjs.utc().subtract(2, "week").toISOString())
    ).to.be.eq(2);
  });
});

describe(nameof(getWeekCount), () => {
  it("should return zero in case the start is after the end", () => {
    expect(
      getWeekCount({
        start: dayjs.utc().add(1, "week").toISOString(),
        end: dayjs.utc().toISOString(),
      })
    ).to.be.eq(0);
  });

  it("should return week count based on the subscription start and end", () => {
    expect(
      getWeekCount({
        start: dayjs.utc().toISOString(),
        end: dayjs.utc().add(1, "week").toISOString(),
      })
    ).to.be.eq(1);

    expect(
      getWeekCount({
        start: dayjs.utc().toISOString(),
        end: dayjs.utc().add(1, "month").toISOString(),
      })
    ).to.be.eq(4);

    expect(
      getWeekCount({
        start: dayjs.utc().toISOString(),
        end: dayjs.utc().add(1, "year").toISOString(),
      })
    ).to.be.eq(52);
  });
});

describe(nameof(getCurrentWeekBoundaries), () => {
  it("should calculate week boundaries (start/end) from the subscription start", () => {
    const now = dayjs.utc();

    expect(getCurrentWeekBoundaries(now.toISOString())).to.be.deep.eq({
      start: now.toISOString(),
      end: now.add(1, "week").toISOString(),
    });

    expect(
      getCurrentWeekBoundaries(now.subtract(1, "week").toISOString())
    ).to.be.deep.eq({
      start: now.toISOString(),
      end: now.add(1, "week").toISOString(),
    });

    expect(
      getCurrentWeekBoundaries(now.subtract(3, "days").toISOString())
    ).to.be.deep.eq({
      start: now.subtract(3, "days").toISOString(),
      end: now.add(4, "days").toISOString(),
    });
  });
});
