import { dayjs, MINUTES_IN_HOUR, nameof, price } from "@litespace/utils";
import { db } from "@litespace/tests";
import { calcRefundAmount } from "@/lib/refund";
import { expect } from "chai";
import { ILesson, IPlan, ITransaction } from "@litespace/types";
import { notfound, unexpected } from "@/lib/error/api";
import { platformConfig } from "@/constants";

describe(nameof(calcRefundAmount), () => {
  beforeEach(async () => {
    await db.flush();
  });

  it("should return zero when paid lesson transaction amount is less than or equal to transaction fees", async () => {
    const tx = await db.transaction({
      amount: price.scale(50),
      type: ITransaction.Type.PaidLesson,
    });
    const refundAmount = await calcRefundAmount(tx, 100);
    expect(refundAmount).to.eq(0);
  });

  it("should return correct refund amount for paid lesson transaction after deducting transaction fees", async () => {
    const tx = await db.transaction({
      amount: price.scale(101),
      type: ITransaction.Type.PaidLesson,
    });
    const refundAmount = await calcRefundAmount(tx, 100);
    expect(refundAmount).to.eq(1);
  });

  it("should return not found error when subscription is not found for non-paid lesson transaction", async () => {
    const tx = await db.transaction({
      amount: 50,
      type: ITransaction.Type.PaidPlan,
    });
    const refundAmount = await calcRefundAmount(tx, 100);
    expect(refundAmount).to.deep.eq(notfound.subscription());
  });

  it("should calculate correct refund amount for subscription transaction based on attended hours in current week", async () => {
    const now = dayjs();
    const paid = 2550;
    const weeklyMinutes = 120;

    const plan = await db.plan({
      baseMonthlyPrice: price.scale(paid),
      monthDiscount: 0,
      weeklyMinutes,
    });

    const student = await db.student();
    const tx = await db.transaction({
      userId: student.id,
      amount: price.scale(paid),
    });

    await db.subscription({
      userId: student.id,
      planId: plan.id,
      period: IPlan.Period.Month,
      start: now.subtract(3, "days").startOf("day").toISOString(),
      end: now.add(3, "days").endOf("day").toISOString(),
      txId: tx.id,
      weeklyMinutes,
    });

    // insert lessons in current week
    await Promise.all([
      db.lesson({
        student: tx.userId,
        start: now.subtract(2, "day").toISOString(),
        duration: ILesson.Duration.Long,
        reported: true,
      }),
      db.lesson({
        student: tx.userId,
        start: now.subtract(1, "day").toISOString(),
        duration: ILesson.Duration.Long,
      }),
      db.lesson({
        student: tx.userId,
        start: now.subtract(4, "hours").toISOString(),
        duration: ILesson.Duration.Long,
        canceled: true,
      }),
      // NOTE: the lessons in the current day are included
      // NOTE: this's non-deterministic; can cause an console
      // if your run the test at the end of the day.
      db.lesson({
        student: tx.userId,
        start: now.add(5, "minutes").toISOString(),
        duration: ILesson.Duration.Long,
      }),
      db.lesson({
        student: tx.userId,
        start: now.add(1, "day").toISOString(),
        duration: ILesson.Duration.Long,
      }),
    ]);

    const timeAttended = 1; // Hour
    const timePrice = timeAttended * platformConfig.totalHourlyRate; // EGP
    const fees = 10; // EGP

    const refundAmount = await calcRefundAmount(tx, fees);

    expect(refundAmount).to.eq(paid - timePrice - fees);
  });

  it("should return zero when refund amount is negative after accounting for attended hours and transaction fees", async () => {
    const now = dayjs();
    const paid = platformConfig.totalHourlyRate; // EGP
    const weeklyMinutes = 120;

    const plan = await db.plan({
      baseMonthlyPrice: price.scale(paid),
      monthDiscount: 0,
      weeklyMinutes,
    });

    const student = await db.student();
    const tx = await db.transaction({
      userId: student.id,
      amount: price.scale(paid),
    });

    await db.subscription({
      userId: student.id,
      planId: plan.id,
      period: IPlan.Period.Month,
      start: now.subtract(3, "days").startOf("day").toISOString(),
      end: now.add(3, "days").endOf("day").toISOString(),
      txId: tx.id,
      weeklyMinutes,
    });

    // insert lessons in current week
    await Promise.all([
      db.lesson({
        student: tx.userId,
        start: now.subtract(1, "day").toISOString(),
        duration: ILesson.Duration.Long,
      }),
      db.lesson({
        student: tx.userId,
        start: now.subtract(4, "hours").toISOString(),
        duration: ILesson.Duration.Long,
      }),
      db.lesson({
        student: tx.userId,
        start: now.subtract(2, "hours").toISOString(),
        duration: ILesson.Duration.Long,
      }),
    ]);

    const refundAmount = await calcRefundAmount(tx, 0);
    expect(refundAmount).to.eq(0);
  });

  it("should correctly calculate refund amount for subscription with multiple weeks of usage", async () => {
    const now = dayjs();
    const paid = 2550; // EGP
    const weeklyMinutes = 120;

    const plan = await db.plan({
      baseMonthlyPrice: price.scale(paid),
      monthDiscount: 0,
      weeklyMinutes,
    });

    const student = await db.student();
    const tx = await db.transaction({
      userId: student.id,
      amount: price.scale(paid),
      type: ITransaction.Type.PaidPlan,
    });

    await db.subscription({
      userId: student.id,
      planId: plan.id,
      period: IPlan.Period.Month,
      start: now.subtract(21, "day").startOf("day").toISOString(),
      end: now.add(5, "days").endOf("day").toISOString(),
      txId: tx.id,
      weeklyMinutes,
    });

    // insert lessons in current week
    await Promise.all([
      db.lesson({
        student: tx.userId,
        start: now.subtract(2, "weeks").toISOString(),
        duration: ILesson.Duration.Long,
      }),
      db.lesson({
        student: tx.userId,
        start: now.subtract(1, "week").toISOString(),
        duration: ILesson.Duration.Long,
      }),
      db.lesson({
        student: tx.userId,
        start: now.subtract(2, "hours").toISOString(),
        duration: ILesson.Duration.Long,
      }),
    ]);

    // the past three weeks and the attended lesson of the current week
    const timeAttended = 3 * (weeklyMinutes / MINUTES_IN_HOUR) + 0.5; // Hour
    const timePrice = timeAttended * platformConfig.totalHourlyRate; // EGP
    const fees = 10; // EGP

    const refundAmount = await calcRefundAmount(tx, fees);

    expect(refundAmount).to.eq(paid - timePrice - fees);
  });

  it("should handle edge case where subscription start date is in the future", async () => {
    const now = dayjs();
    const paid = 2550; // EGP
    const weeklyMinutes = 120;

    const plan = await db.plan({
      baseMonthlyPrice: price.scale(paid),
      monthDiscount: 0,
      weeklyMinutes,
    });

    const student = await db.student();
    const tx = await db.transaction({
      userId: student.id,
      amount: price.scale(paid),
    });

    await db.subscription({
      userId: student.id,
      planId: plan.id,
      period: IPlan.Period.Month,
      start: now.add(1, "day").startOf("day").toISOString(),
      end: now.add(4, "weeks").endOf("day").toISOString(),
      txId: tx.id,
      weeklyMinutes,
    });

    const refundAmount = await calcRefundAmount(tx, 0);

    expect(refundAmount).to.deep.eq(unexpected());
  });
});
