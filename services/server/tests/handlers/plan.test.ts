import db from "@fixtures/db";
import handlers from "@/handlers/plan";
import { IPlan, IUser } from "@litespace/types";
import { mockApi } from "@fixtures/mockApi";
import { expect } from "chai";
import { forbidden, notfound } from "@/lib/error/api";

const create = mockApi<IPlan.CreateApiPayload, object, object, IPlan.Self>(
  handlers.create
);
const update = mockApi<IPlan.UpdateApiPayload, { id: number }>(handlers.update);
const deletePlan = mockApi<object, { id: number }>(handlers.delete);
const find = mockApi<object, object, IPlan.FindApiQuery, IPlan.FindApiResponse>(
  handlers.find
);
const findById = mockApi<object, { id: number }, object>(handlers.findById);

describe("/api/v1/plan/", () => {
  beforeEach(async () => {
    await db.flush();
  });

  describe("GET /api/v1/plan/:id", () => {
    it("should respond with forbidden in case the requester is not a user", async () => {
      const res = await findById({
        user: undefined,
        params: { id: 321 },
      });
      expect(res).to.deep.eq(forbidden());
    });

    it("should respond with not-found in case the plan is not active.", async () => {
      const student = await db.user({ role: IUser.Role.Student });
      const plan = await db.plan({ active: false });

      const res = await findById({
        user: student,
        params: { id: plan.id },
      });

      expect(res).to.deep.eq(notfound.plan());
    });

    it("should respond with notfound in case the plan is not found.", async () => {
      const student = await db.user({ role: IUser.Role.Student });

      const res = await findById({
        user: student,
        params: { id: 300 },
      });

      expect(res).to.deep.eq(notfound.plan());
    });

    it("should successfully respond with the plan by providing its id", async () => {
      const s1 = await db.user({ role: IUser.Role.Student });
      const plan = await db.plan({ active: true, forInvitesOnly: false });

      const res = await findById({
        user: s1,
        params: { id: plan.id },
      });

      expect(res).to.not.be.instanceof(Error);
      expect(res.body).to.deep.eq(plan);
    });
  });

  describe("GET /api/v1/plan/list", () => {
    it("should respond with a list of active plans", async () => {
      const created = await Promise.all([
        db.plan({ active: true }),
        db.plan({ active: true }),
        db.plan({ active: false }),
        db.plan({ active: false }),
      ]);

      const res = await find({
        query: { active: true },
      });

      expect(res.body?.list).to.deep.members(created.slice(0, 2));
    });

    it("should respond with a list of inactive plans", async () => {
      const created = await Promise.all([
        db.plan({ active: false }),
        db.plan({ active: false }),
        db.plan({ active: true }),
        db.plan({ active: true }),
      ]);

      const res = await find({
        query: { active: false },
      });

      expect(res.body?.list).to.deep.members(created.slice(0, 2));
    });

    it("should respond with a list of active and NOT forInvitesOnly plans", async () => {
      const created = await Promise.all([
        db.plan({ active: true, forInvitesOnly: false }),
        db.plan({ active: true, forInvitesOnly: false }),
        db.plan({ active: true, forInvitesOnly: true }),
        db.plan({ active: true, forInvitesOnly: true }),
      ]);

      const res = await find({
        query: { active: true, forInvitesOnly: false },
      });

      expect(res.body?.list).to.deep.members(created.slice(0, 2));
    });
  });

  describe("POST /api/v1/plan/", () => {
    it("should respond with forbidden in case the user is not a super admin", async () => {
      const admin = await db.user({ role: IUser.Role.RegularAdmin });
      const res = await create({
        user: admin,
        body: {
          weeklyMinutes: 120,
          baseMonthlyPrice: 100,
          monthDiscount: 10,
          quarterDiscount: 15,
          yearDiscount: 20,
          forInvitesOnly: false,
          active: true,
        },
      });
      expect(res).to.deep.eq(forbidden());
    });

    it("should successfully create a plan and return it in the response payload", async () => {
      const admin = await db.user({ role: IUser.Role.SuperAdmin });
      const payload = {
        weeklyMinutes: 120,
        baseMonthlyPrice: 100,
        monthDiscount: 10,
        quarterDiscount: 15,
        yearDiscount: 20,
        forInvitesOnly: false,
        active: true,
      };

      const res = await create({
        user: admin,
        body: payload,
      });

      expect(res.body).to.not.be.null;
      expect(res.body).to.deep.contain(payload);
    });
  });

  describe("PATCH /api/v1/plan/:id", () => {
    it("should respond with forbidden in case the user is not a super admin", async () => {
      const admin = await db.user({ role: IUser.Role.RegularAdmin });
      const plan = await db.plan();

      const res = await update({
        user: admin,
        params: { id: plan.id },
        body: {
          weeklyMinutes: 200,
          active: true,
        },
      });

      expect(res).to.deep.eq(forbidden());
    });

    it("should respond with notfound in case the plan id does not exist", async () => {
      const admin = await db.user({ role: IUser.Role.SuperAdmin });

      const res = await update({
        user: admin,
        params: { id: 312 },
        body: {
          weeklyMinutes: 200,
          active: true,
        },
      });

      expect(res).to.deep.eq(notfound.plan());
    });

    it("should successfully update a plan data and return it in the response payload", async () => {
      const admin = await db.user({ role: IUser.Role.SuperAdmin });
      const plan = await db.plan();

      const res = await update({
        user: admin,
        params: { id: plan.id },
        body: {
          weeklyMinutes: 200,
          active: true,
        },
      });

      expect(res.body).to.deep.contain({
        weeklyMinutes: 200,
        active: true,
      });
    });
  });

  describe("DELETE /api/v1/plan/:id", () => {
    it("should respond with forbidden in case the user is not a super admin", async () => {
      const admin = await db.user({ role: IUser.Role.RegularAdmin });
      const plan = await db.plan();

      const res = await deletePlan({
        user: admin,
        params: { id: plan.id },
      });

      expect(res).to.deep.eq(forbidden());
    });

    it("should respond with notfound in case the plan id does not exist", async () => {
      const admin = await db.user({ role: IUser.Role.SuperAdmin });
      const res = await deletePlan({
        user: admin,
        params: { id: 321 },
      });
      expect(res).to.deep.eq(notfound.plan());
    });

    it("should successfully delete a plan from the database", async () => {
      const admin = await db.user({ role: IUser.Role.SuperAdmin });
      const plan = await db.plan();
      const res = await deletePlan({
        user: admin,
        params: { id: plan.id },
      });
      expect(res.status).to.eq(200);
    });
  });
});
