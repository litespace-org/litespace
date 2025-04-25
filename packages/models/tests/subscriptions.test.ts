import { subscriptions } from "@/subscriptions";
import fixtures from "@fixtures/db";
import { nameof } from "@litespace/utils/utils";
import { expect } from "chai";

describe("transactions", () => {
  beforeEach(async () => {
    return await fixtures.flush();
  });

  describe(nameof(subscriptions.create), () => {
    it("should successfully create a new subscription", async () => {
      const student = await fixtures.student();
      const subscription = await fixtures.subscription({ userId: student.id });
      expect(subscription).to.not.be.null;
      expect(subscription).to.not.be.undefined;
      expect(subscription.userId).to.eq(student.id);
      expect(subscription.extendedBy).to.be.null;
    });
  });

  describe(nameof(subscriptions.update), () => {
    it("should successfully update the subscription extendedBy and updated_at, only, fields", async () => {
      const student = await fixtures.student();
      const sub1 = await fixtures.subscription({ userId: student.id });
      const sub2 = await fixtures.subscription({ userId: student.id });

      const res = await subscriptions.update(sub1.id, { extendedBy: sub2.id });
      expect(res).to.not.be.null;
      expect(res).to.not.be.undefined;
      expect(res.extendedBy).to.eq(sub2.id);
      expect(res.updatedAt).to.not.eq(sub1.id);

      expect(res.userId).to.eq(sub1.userId);
      expect(res.txId).to.eq(sub1.txId);
      expect(res.planId).to.eq(sub1.planId);
      expect(res.quota).to.eq(sub1.quota);
      expect(res.start).to.eq(sub1.start);
      expect(res.end).to.eq(sub1.end);
      expect(res.period).to.eq(sub1.period);
      expect(res.createdAt).to.eq(sub1.createdAt);
    });
  });

  describe(nameof(subscriptions.find), () => {
    it("should successfully retrieve subscriptions for a specific set of users", async () => {
      const u1 = await fixtures.student();
      const u2 = await fixtures.student();
      const u3 = await fixtures.student();

      const subs = await Promise.all([
        fixtures.subscription({ userId: u1.id }),
        fixtures.subscription({ userId: u1.id }),
        fixtures.subscription({ userId: u2.id }),
        fixtures.subscription({ userId: u2.id }),
        fixtures.subscription({ userId: u3.id }),
      ]);

      const res = await subscriptions.find({ users: [u1.id, u3.id] });
      expect(res.total).to.eq(3);
      expect(res.list).to.deep.eq([subs[0], subs[1], subs[4]]);
    });
  });

  describe(nameof(subscriptions.findById), () => {
    it("should retrieve a specific subscription with its id", async () => {
      const user = await fixtures.student();

      const subs = await Promise.all([
        fixtures.subscription({ userId: user.id }),
        fixtures.subscription({ userId: user.id }),
      ]);

      for (const sub of subs) {
        const res = await subscriptions.findById(sub.id);
        expect(res).to.deep.eq(sub);
      }
    });
  });
});
