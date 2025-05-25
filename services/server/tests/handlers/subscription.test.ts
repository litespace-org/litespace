import db from "@fixtures/db";
import handlers from "@/handlers/subscription";
import { ISubscription, IUser } from "@litespace/types";
import { mockApi } from "@fixtures/mockApi";
import { expect } from "chai";
import { forbidden, notfound } from "@/lib/error";

const find = mockApi<
  void,
  void,
  ISubscription.FindApiQuery,
  ISubscription.FindApiResponse
>(handlers.find);
const findById = mockApi<object, { id: number }, object, ISubscription.Self>(
  handlers.findById
);

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
});
