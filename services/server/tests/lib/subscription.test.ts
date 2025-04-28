import {
  calcualteWeeklyMinutesOfCurrentWeek,
  calculateRemainingWeeklyMinutesOfCurrentWeekByUserId,
} from "@/lib/subscription";
import time from "@fixtures/time";
import { nameof } from "@litespace/utils";
import { expect } from "@fixtures/chai";
import db from "@fixtures/db";
import { subscriptions } from "@litespace/models";

describe(nameof(calcualteWeeklyMinutesOfCurrentWeek), () => {
  it("should calcualte available weekly minutes incase the user subscribed in the middle of the current week", () => {
    const start = time.now.startOf("week").add(3, "day");
    expect(
      calcualteWeeklyMinutesOfCurrentWeek({
        subscription: {
          start: start.toISOString(),
          end: start.add(4, "weeks").toISOString(),
        },
        weeklyMinutes: 7 * 30,
        time: time.now.startOf("week").add(1, "day").toISOString(),
      })
    ).to.be.eq(120);
  });

  it("should calcualte available weekly minutes incase the user subscription will end at the middle of the current week", () => {
    const end = time.now.startOf("week").add(2, "day");
    const start = end.subtract(4, "weeks");
    expect(
      calcualteWeeklyMinutesOfCurrentWeek({
        subscription: {
          start: start.toISOString(),
          end: end.toISOString(),
        },
        weeklyMinutes: 7 * 30,
        time: time.now.startOf("week").add(1, "day").toISOString(),
      })
    ).to.be.eq(90);
  });

  it("should calcualte available weekly minutes incase the user subscription is available for the entire week", () => {
    const start = time.isoweek(-10);
    const end = time.isoweek(10);
    expect(
      calcualteWeeklyMinutesOfCurrentWeek({
        subscription: {
          start: start,
          end: end,
        },
        weeklyMinutes: 60,
        time: time.isomin(0),
      })
    ).to.be.eq(60);
  });
});

describe(nameof(calculateRemainingWeeklyMinutesOfCurrentWeekByUserId), () => {
  beforeEach(async () => {
    return await db.flush();
  });

  it("should return zero in case the user has no subscription", async () => {
    const user = await db.student();
    await expect(
      calculateRemainingWeeklyMinutesOfCurrentWeekByUserId({
        userId: user.id,
        time: time.now.toISOString(),
      })
    ).to.eventually.be.eq(0);
  });

  it("should return zero in case the subscription was termianted", async () => {
    const user = await db.student();

    const subscription = await db.subscription({
      userId: user.id,
      start: time.now.subtract(1, "month").toISOString(),
      end: time.now.add(1, "month").toISOString(),
      weeklyMinutes: 120,
    });

    await subscriptions.update(subscription.id, {
      terminatedAt: time.now.toISOString(),
    });

    await expect(
      calculateRemainingWeeklyMinutesOfCurrentWeekByUserId({
        userId: user.id,
        time: time.now.toISOString(),
      })
    ).to.eventually.be.eq(0);
  });

  it("should return zero in case the subscription was eneded", async () => {
    const user = await db.student();

    await db.subscription({
      userId: user.id,
      start: time.now.subtract(2, "month").toISOString(),
      end: time.now.subtract(1, "month").toISOString(),
      weeklyMinutes: 120,
    });

    await expect(
      calculateRemainingWeeklyMinutesOfCurrentWeekByUserId({
        userId: user.id,
        time: time.now.toISOString(),
      })
    ).to.eventually.be.eq(0);
  });

  it("should return all available weekly minutes incase user didn't book any lesson", async () => {
    const user = await db.student();

    await db.subscription({
      userId: user.id,
      start: time.now.subtract(1, "month").toISOString(),
      end: time.now.add(1, "month").toISOString(),
      weeklyMinutes: 120,
    });

    await expect(
      calculateRemainingWeeklyMinutesOfCurrentWeekByUserId({
        userId: user.id,
        time: time.now.toISOString(),
      })
    ).to.eventually.be.eq(120);
  });

  it("should return only a subset of the weekly minutes in case the user subscription just started this week", async () => {
    const user = await db.student();

    await db.subscription({
      userId: user.id,
      start: time.now.startOf("week").add(4, "days").toISOString(),
      end: time.now.add(1, "month").toISOString(),
      weeklyMinutes: 120,
    });

    await expect(
      calculateRemainingWeeklyMinutesOfCurrentWeekByUserId({
        userId: user.id,
        time: time.now.startOf("week").add(4, "days").toISOString(),
      })
    ).to.eventually.be.eq(45);
  });

  it("should return only a subset of the weekly minutes in case the user subscription will end this week", async () => {
    const user = await db.student();

    await db.subscription({
      userId: user.id,
      start: time.isomonth(-2),
      end: time.now.endOf("week").subtract(2, "days").toISOString(),
      weeklyMinutes: 120,
    });

    await expect(
      calculateRemainingWeeklyMinutesOfCurrentWeekByUserId({
        userId: user.id,
        time: time.now.startOf("week").toISOString(),
      })
    ).to.eventually.be.eq(75);
  });

  it("should exclude booked lessons from the remaining minutes #1", async () => {
    const user = await db.student();

    await db.lesson({
      student: user.id,
      start: time.now.startOf("week").add(1, "day").toISOString(),
      duration: 30,
    });

    await db.subscription({
      userId: user.id,
      start: time.isoweek(-4),
      end: time.isoweek(4),
      weeklyMinutes: 120,
    });

    await expect(
      calculateRemainingWeeklyMinutesOfCurrentWeekByUserId({
        userId: user.id,
        time: time.now.startOf("week").toISOString(),
      })
    ).to.eventually.be.eq(90);
  });

  it("should exclude booked lessons from the remaining minutes #2", async () => {
    const user = await db.student();

    await db.lesson({
      student: user.id,
      start: time.now.startOf("week").add(1, "day").toISOString(),
      duration: 30,
    });

    await db.lesson({
      student: user.id,
      start: time.now.startOf("week").toISOString(),
      duration: 30,
    });

    await db.subscription({
      userId: user.id,
      start: time.isoweek(-4),
      end: time.isoweek(4),
      weeklyMinutes: 120,
    });

    await expect(
      calculateRemainingWeeklyMinutesOfCurrentWeekByUserId({
        userId: user.id,
        time: time.now.startOf("week").toISOString(),
      })
    ).to.eventually.be.eq(60);
  });

  it("should ignore canceled lessons", async () => {
    const user = await db.student();

    await db.lesson({
      student: user.id,
      start: time.now.startOf("week").add(1, "day").toISOString(),
      duration: 30,
    });

    await db.lesson({
      student: user.id,
      start: time.now.startOf("week").toISOString(),
      duration: 30,
      canceled: true,
    });

    await db.subscription({
      userId: user.id,
      start: time.isoweek(-4),
      end: time.isoweek(4),
      weeklyMinutes: 120,
    });

    await expect(
      calculateRemainingWeeklyMinutesOfCurrentWeekByUserId({
        userId: user.id,
        time: time.now.startOf("week").toISOString(),
      })
    ).to.eventually.be.eq(90);
  });

  it("should ignore lessons out of the current week range", async () => {
    const user = await db.student();

    await db.lesson({
      student: user.id,
      start: time.now.startOf("week").subtract(1, "day").toISOString(),
      duration: 30,
    });

    await db.lesson({
      student: user.id,
      start: time.now.startOf("week").toISOString(),
      duration: 30,
      canceled: true,
    });

    await db.lesson({
      student: user.id,
      start: time.now.startOf("week").add(30, "minutes").toISOString(),
      duration: 30,
    });

    await db.subscription({
      userId: user.id,
      start: time.isoweek(-4),
      end: time.isoweek(4),
      weeklyMinutes: 120,
    });

    await expect(
      calculateRemainingWeeklyMinutesOfCurrentWeekByUserId({
        userId: user.id,
        time: time.now.startOf("week").toISOString(),
      })
    ).to.eventually.be.eq(90);
  });
});
