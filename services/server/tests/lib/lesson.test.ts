import { checkStudentPaidLessonState } from "@/lib/lesson";
import { nameof } from "@litespace/utils";
import { expect } from "@fixtures/chai";
import { db } from "@litespace/tests";
import { ILesson, ITransaction, IUser } from "@litespace/types";

describe(nameof(checkStudentPaidLessonState), () => {
  beforeEach(async () => {
    await db.flush();
  });

  it("should return that the user is eligible for paid lesson and need payment", async () => {
    const user = await db.user({ role: IUser.Role.Student });
    await expect(checkStudentPaidLessonState(user.id)).to.eventually.be.deep.eq(
      {
        status: ILesson.PaidLessonStatus.EligibleWithPayment,
        hasPendingPaidLesson: false,
      }
    );
  });

  it("should return that user is not eligible for paid lessons incase exceded that max allowed lessons", async () => {
    const user = await db.user({ role: IUser.Role.Student });
    const tx1 = await db.transaction({
      userId: user.id,
      type: ITransaction.Type.PaidLesson,
      status: ITransaction.Status.Paid,
    });

    await db.lesson({ student: user.id, txId: tx1.id });

    const tx2 = await db.transaction({
      userId: user.id,
      type: ITransaction.Type.PaidLesson,
      status: ITransaction.Status.Paid,
    });

    await db.lesson({ student: user.id, txId: tx2.id });

    await expect(checkStudentPaidLessonState(user.id)).to.eventually.be.deep.eq(
      {
        status: ILesson.PaidLessonStatus.NotEligible,
        hasPendingPaidLesson: true,
      }
    );
  });

  it("should return that the user has a paid lesson available and don't have to pay", async () => {
    const user = await db.user({ role: IUser.Role.Student });
    const tx = await db.transaction({
      userId: user.id,
      type: ITransaction.Type.PaidLesson,
      status: ITransaction.Status.Paid,
    });

    const { lesson } = await db.lesson({
      student: user.id,
      txId: tx.id,
      canceled: true,
    });

    await expect(checkStudentPaidLessonState(user.id)).to.eventually.be.deep.eq(
      {
        status: ILesson.PaidLessonStatus.EligitbleWithoutPayment,
        txId: tx.id,
        duration: lesson.duration,
        hasPendingPaidLesson: false,
      }
    );
  });

  it("should return that the user is elgible for a paid lesson with payment incase he only has one transaction", async () => {
    const user = await db.user({ role: IUser.Role.Student });
    const tx = await db.transaction({
      userId: user.id,
      type: ITransaction.Type.PaidLesson,
      status: ITransaction.Status.Paid,
    });

    await db.lesson({ student: user.id, txId: tx.id });

    await expect(checkStudentPaidLessonState(user.id)).to.eventually.be.deep.eq(
      {
        status: ILesson.PaidLessonStatus.EligibleWithPayment,
        hasPendingPaidLesson: true,
      }
    );
  });
});
