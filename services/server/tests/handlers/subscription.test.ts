import db from "@fixtures/db";
import handlers from "@/handlers/subscription";
import fawryHandlers from "@/handlers/fawry";
import { ISubscription, IUser, IPlan, ILesson, IFawry } from "@litespace/types";
import { mockApi } from "@fixtures/mockApi";
import { expect } from "chai";
import { bad, fawryError, forbidden, notfound } from "@/lib/error/api";
import { subscriptions, transactions } from "@litespace/models";
import dayjs from "dayjs";
import { PLAN_PERIOD_TO_PLAN_PERIOD_LITERAL } from "@litespace/utils";
import { calcRefundAmount } from "@/lib/refund";

const find = mockApi<
  ISubscription.FindApiQuery,
  object,
  object,
  ISubscription.FindApiResponse
>(handlers.find);

const findById = mockApi<object, { id: number }, object, ISubscription.Self>(
  handlers.findById
);

const cancel = mockApi<
  ISubscription.CancelApiPayload,
  object,
  object,
  ISubscription.CancelApiResponse
>(handlers.cancel);

const pay = mockApi<
  IFawry.PayWithEWalletPayload,
  object,
  object,
  IFawry.PayWithEWalletResponse
>(fawryHandlers.payWithEWallet);

const syncPaymentStatus = mockApi<
  IFawry.SyncPaymentStatusPayload,
  object,
  object,
  IFawry.SyncPaymentStatusResponse
>(fawryHandlers.syncPaymentStatus);

describe("/api/v1/sub/", () => {
  beforeEach(async () => {
    await db.flush();
  });

  describe("GET /api/v1/sub/:id", () => {
    it("should respond with forbidden in case the user is neither an admin nor a student", async () => {
      const tutor = await db.user({ role: IUser.Role.Tutor });
      const res = await findById({
        user: tutor,
        params: { id: 321 },
      });
      expect(res).to.deep.eq(forbidden());
    });

    it("should respond with forbidden in case the student is trying to retrieve a subscription that he doen't own", async () => {
      const s1 = await db.user({ role: IUser.Role.Student });
      const s2 = await db.user({ role: IUser.Role.Student });

      const tx = await db.subscription({ userId: s1.id });

      const res = await findById({
        user: s2,
        params: { id: tx.id },
      });

      expect(res).to.deep.eq(forbidden());
    });

    it("should respond with notfound in case the subscription is not found.", async () => {
      const student = await db.user({ role: IUser.Role.Student });

      const res = await findById({
        user: student,
        params: { id: 300 },
      });

      expect(res).to.deep.eq(notfound.subscription());
    });

    it("should successfully respond with the subscription by providing its id", async () => {
      const s1 = await db.user({ role: IUser.Role.Student });
      const tx = await db.subscription({ userId: s1.id });

      const res = await findById({
        user: s1,
        params: { id: tx.id },
      });

      expect(res).to.not.be.instanceof(Error);
      expect(res.body).to.deep.eq(tx);
    });
  });

  describe("GET /api/v1/sub/list", () => {
    it("should respond with forbidden in case the user is neither an admin nor a student", async () => {
      const tutor = await db.user({ role: IUser.Role.Tutor });

      const res = await find({
        user: tutor,
        query: {
          users: [tutor.id],
        },
      });
      expect(res).to.deep.eq(forbidden());
    });

    it("should respond with a list of subscriptions", async () => {
      const student = await db.user({ role: IUser.Role.Student });
      const subs = await Promise.all([
        db.subscription({ userId: student.id }),
        db.subscription({ userId: student.id }),
        db.subscription({ userId: student.id }),
      ]);

      const res = await find({
        user: student,
        query: {
          users: [student.id],
        },
      });

      expect(res).to.not.be.instanceof(Error);
      expect(res.body?.total).to.eq(3);
      for (const sub of subs) expect(res.body?.list).to.deep.contain(sub);
    });
  });

  describe("PATCH /api/v1/sub/cancel", () => {
    it("should return forbidden when user doesn't have permission to cancel subscription", async () => {
      const users = await Promise.all([
        db.user({ role: IUser.Role.RegularAdmin }),
        db.user({ role: IUser.Role.TutorManager }),
        db.user({ role: IUser.Role.Tutor }),
        db.user({ role: IUser.Role.Studio }),
      ]);

      for (const user of users) {
        const res = await cancel({
          user: user,
          body: { id: 1 },
        });
        expect(res).to.deep.eq(forbidden());
      }
    });

    it("should return bad request when student provides a subscription ID in the payload", async () => {
      const student = await db.student();
      const res = await cancel({
        user: student,
        body: { id: 1 },
      });
      expect(res).to.deep.eq(bad());
    });

    it("should return bad request when super admin doesn't provide a subscription ID in the payload", async () => {
      const admin = await db.user({ role: IUser.Role.SuperAdmin });
      const res = await cancel({
        user: admin,
        body: {},
      });
      expect(res).to.deep.eq(bad());
    });

    it("should return not found error when subscription with provided ID doesn't exist", async () => {
      const admin = await db.user({ role: IUser.Role.SuperAdmin });
      const res = await cancel({
        user: admin,
        body: { id: 4321 },
      });
      expect(res).to.deep.eq(notfound.subscription());
    });

    it("should return not found error when student doesn't have any active subscriptions", async () => {
      const student = await db.student();

      const res1 = await cancel({ user: student, body: {} });
      expect(res1).to.deep.eq(notfound.subscription());

      const createdSub = await db.subscription({ userId: student.id });
      await subscriptions.update(createdSub.id, {
        terminatedAt: dayjs().toISOString(),
      });

      const res2 = await cancel({ user: student, body: {} });
      expect(res2).to.deep.eq(notfound.subscription());
    });

    // @TODO: add this test in end-to-end test suites
    it.skip("should return 500 status error in case something went wrong with fawry API", async () => {
      const student = await db.student();

      const now = dayjs();

      const tx = await db.transaction({
        userId: student.id,
        providerRefNum: "1",
        amount: 2500,
      });
      const sub = await db.subscription({
        txId: tx.id,
        userId: student.id,
        start: now.subtract(1, "month").toISOString(),
        end: now.add(2, "month").toISOString(),
        period: IPlan.Period.Quarter,
      });

      const res = await cancel({ user: student, body: {} });
      // @NOTE: should be error as fawry api is not used to make the subscription
      expect(res).to.deep.eq(fawryError());

      const updated = await subscriptions.findById(sub.id);
      expect(updated?.terminatedAt).to.be.null;
    });

    it("should update subscription status to terminated after successful refund", async () => {
      const student = await db.student();
      const plan = await db.plan();

      const payRes = await pay({
        user: student,
        body: {
          planId: plan.id,
          period: PLAN_PERIOD_TO_PLAN_PERIOD_LITERAL[IPlan.Period.Quarter],
          wallet: "01010101010",
          phone: "01010101010",
        },
      });
      expect(payRes).to.not.be.instanceof(Error);
      expect(payRes.status).to.eq(200);

      const txId = payRes.body!.transactionId;
      const tx = await transactions.findById(txId);
      expect(tx).to.not.be.null;

      // in order to create the subscription
      await syncPaymentStatus({
        user: student,
        body: { transactionId: txId },
      });

      const sub = await subscriptions.findByTxId(txId);
      expect(sub).to.not.be.null;

      const res = await cancel({ user: student, body: {} });
      expect(res.status).to.not.be.instanceof(Error);
      expect(res.body).to.deep.eq({ refundAmount: tx!.amount });

      const updated = await subscriptions.findById(sub!.id);
      expect(updated?.terminatedAt).to.not.be.null;
      expect(updated?.terminatedBy).to.eq(student.id);
    });

    it("should calculate refund amount correctly based on attended minutes and total minutes of subscription period", async () => {
      const student = await db.student();
      const plan = await db.plan();

      const payRes = await pay({
        user: student,
        body: {
          planId: plan.id,
          period: PLAN_PERIOD_TO_PLAN_PERIOD_LITERAL[IPlan.Period.Quarter],
          wallet: "01010101010",
          phone: "01010101010",
        },
      });
      expect(payRes).to.not.be.instanceof(Error);
      expect(payRes.status).to.eq(200);

      const txId = payRes.body!.transactionId;
      const tx = await transactions.findById(txId);
      expect(tx).to.not.be.null;

      // in order to create the subscription
      await syncPaymentStatus({
        user: student,
        body: { transactionId: txId },
      });

      const sub = await subscriptions.findByTxId(txId);
      expect(sub).to.not.be.null;

      // insert mock lessons in the db
      await Promise.all([
        db.lesson({
          student: student.id,
          timing: "past",
          duration: ILesson.Duration.Long,
        }),
        db.lesson({
          student: student.id,
          timing: "future",
          duration: ILesson.Duration.Long,
        }),
      ]);

      const expectedAmount = await calcRefundAmount(tx!);
      expect(expectedAmount).to.not.be.instanceof(Error);

      const res = await cancel({ user: student, body: {} });
      expect(res.status).to.not.be.instanceof(Error);
      expect(res.body).to.deep.eq({
        refundAmount: expectedAmount,
      });
    });
  });
});
