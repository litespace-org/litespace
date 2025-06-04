import { calculateRemainingWeeklyMinutesOfCurrentWeekByUserId } from "@/lib/subscription";
import time from "@fixtures/time";
import { nameof } from "@litespace/utils";
import { expect } from "@fixtures/chai";
import { fixtures as db } from "@litespace/tests";
import { subscriptions } from "@litespace/models";

describe(nameof(calculateRemainingWeeklyMinutesOfCurrentWeekByUserId), () => {
  beforeEach(async () => {
    return await db.flush();
  });

  it("should return zero in case the user has no subscription", async () => {
    const user = await db.student();
    await expect(
      calculateRemainingWeeklyMinutesOfCurrentWeekByUserId(user.id)
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
      calculateRemainingWeeklyMinutesOfCurrentWeekByUserId(user.id)
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
      calculateRemainingWeeklyMinutesOfCurrentWeekByUserId(user.id)
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
      calculateRemainingWeeklyMinutesOfCurrentWeekByUserId(user.id)
    ).to.eventually.be.eq(120);
  });

  it("should exclude booked lessons from the remaining minutes #1", async () => {
    const user = await db.student();

    await db.subscription({
      userId: user.id,
      start: time.isoweek(-4),
      end: time.isoweek(4),
      weeklyMinutes: 120,
    });

    await db.lesson({
      student: user.id,
      start: time.week(0).add(1, "day").toISOString(),
      duration: 30,
    });

    await expect(
      calculateRemainingWeeklyMinutesOfCurrentWeekByUserId(user.id)
    ).to.eventually.be.eq(90);
  });

  it("should exclude booked lessons from the remaining minutes #2", async () => {
    const user = await db.student();

    await db.subscription({
      userId: user.id,
      start: time.isoweek(-4),
      end: time.isoweek(4),
      weeklyMinutes: 120,
    });

    await db.lesson({
      student: user.id,
      start: time.week(0).add(1, "day").toISOString(),
      duration: 30,
    });

    await db.lesson({
      student: user.id,
      start: time.week(0).toISOString(),
      duration: 30,
    });

    await expect(
      calculateRemainingWeeklyMinutesOfCurrentWeekByUserId(user.id)
    ).to.eventually.be.eq(60);
  });

  it("should ignore canceled lessons", async () => {
    const user = await db.student();

    await db.subscription({
      userId: user.id,
      start: time.isoweek(-4),
      end: time.isoweek(4),
      weeklyMinutes: 120,
    });

    await db.lesson({
      student: user.id,
      start: time.week(0).add(1, "day").toISOString(),
      duration: 30,
    });

    await db.lesson({
      student: user.id,
      start: time.week(0).toISOString(),
      duration: 30,
      canceled: true,
    });

    await expect(
      calculateRemainingWeeklyMinutesOfCurrentWeekByUserId(user.id)
    ).to.eventually.be.eq(90);
  });

  it("should ignore lessons out of the current week range", async () => {
    const user = await db.student();

    await db.subscription({
      userId: user.id,
      start: time.isoweek(-4),
      end: time.isoweek(4),
      weeklyMinutes: 120,
    });

    await db.lesson({
      student: user.id,
      start: time.week(0).subtract(1, "day").toISOString(),
      duration: 30,
    });

    await db.lesson({
      student: user.id,
      start: time.week(0).toISOString(),
      duration: 30,
      canceled: true,
    });

    await db.lesson({
      student: user.id,
      start: time.week(0).add(30, "minutes").toISOString(),
      duration: 30,
    });

    await expect(
      calculateRemainingWeeklyMinutesOfCurrentWeekByUserId(user.id)
    ).to.eventually.be.eq(90);
  });
});
