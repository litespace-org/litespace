import fixtures from "@fixtures/db";
import { expect } from "chai";
import { plans } from "@/plans";
import { nameof } from "@litespace/utils";

describe("plans", () => {
  beforeEach(async () => {
    return await fixtures.flush();
  });

  describe(nameof(plans.create), () => {
    it("should create a new plan", async () => {
      const created = await fixtures.plan();
      expect(created.id).to.be.greaterThan(0);
      expect(created.baseMonthlyPrice).to.be.greaterThan(0);
      expect(created.yearDiscount).to.be.greaterThan(0);
      expect(created.monthDiscount).to.be.greaterThan(0);
      expect(created.quarterDiscount).to.be.greaterThan(0);
      expect(created.weeklyMinutes).to.be.greaterThan(0);
      expect(created.active).to.exist;
      expect(created.forInvitesOnly).to.exist;
      expect(created.createdAt).to.exist;
      expect(created.updatedAt).to.eq(created.createdAt);
    });
  });

  describe(nameof(plans.update), () => {
    it("should update a plan", async () => {
      const created = await fixtures.plan();
      const updated = await plans.update(created.id, {
        weeklyMinutes: 10,
        baseMonthlyPrice: 100,
        monthDiscount: 200,
        quarterDiscount: 300,
        yearDiscount: 400,
        forInvitesOnly: !created.forInvitesOnly,
        active: !created.active,
      });
      expect(updated.id).to.eq(created.id);
      expect(updated.weeklyMinutes).to.eq(10);
      expect(updated.baseMonthlyPrice).to.eq(100);
      expect(updated.monthDiscount).to.eq(200);
      expect(updated.quarterDiscount).to.eq(300);
      expect(updated.yearDiscount).to.eq(400);
      expect(updated.forInvitesOnly).to.eq(!created.forInvitesOnly);
      expect(updated.active).to.eq(!created.active);
    });
  });

  describe(nameof(plans.delete), () => {
    it("should delete a plan", async () => {
      const created = await fixtures.plan();
      await plans.delete(created.id);
      const found = await plans.findById(created.id);
      expect(found).to.eq(null);
    });
  });

  describe(nameof(plans.find), () => {
    it("should list active plans", async () => {
      const created = await Promise.all([
        fixtures.plan({ active: true }),
        fixtures.plan({ active: true }),
        fixtures.plan({ active: false }),
        fixtures.plan({ active: false }),
      ]);
      const found = await plans.find({ active: true });
      expect(found.list).to.deep.eq(created.slice(0, 2));
    });

    it("should list inactive plans", async () => {
      const created = await Promise.all([
        fixtures.plan({ active: true }),
        fixtures.plan({ active: true }),
        fixtures.plan({ active: false }),
        fixtures.plan({ active: false }),
      ]);
      const found = await plans.find({ active: false });
      expect(found.list).to.deep.members(created.slice(2));
    });

    it("should list active and not forInvitesOnly plans", async () => {
      const created = await Promise.all([
        fixtures.plan({ active: true, forInvitesOnly: false }),
        fixtures.plan({ active: true, forInvitesOnly: true }),
        fixtures.plan({ active: false }),
        fixtures.plan({ active: false }),
      ]);
      const found = await plans.find({ active: true, forInvitesOnly: false });
      expect(found.list).to.deep.eq(created.slice(0, 1));
    });
  });
});
