import { transactions } from "@/transactions";
import fixtures from "@fixtures/db";
import { ITransaction } from "@litespace/types";
import { nameof } from "@litespace/utils/utils";
import { expect } from "chai";

describe("transactions", () => {
  beforeEach(async () => {
    return await fixtures.flush();
  });

  describe(nameof(transactions.create), () => {
    it("should successfully create a new transaction", async () => {
      const user = await fixtures.tutor();
      const newTransaction = await transactions.create({
        userId: user.id,
        phone: user.phone || "",
        amount: 200,
        paymentMethod: ITransaction.PaymentMethod.Card,
        type: ITransaction.Type.PaidPlan,
        providerRefNum: null,
      });
      expect(newTransaction.id).to.be.greaterThanOrEqual(1);
      expect(newTransaction.amount).to.be.eq(200);
      expect(newTransaction.status).to.be.eq(ITransaction.Status.New);
      expect(newTransaction.paymentMethod).to.be.eq(
        ITransaction.PaymentMethod.Card
      );
    });
  });

  describe(nameof(transactions.update), () => {
    it("should successfully update the transaction status", async () => {
      const user = await fixtures.tutor();
      const created = await transactions.create({
        userId: user.id,
        phone: user.phone || "",
        amount: 200,
        paymentMethod: ITransaction.PaymentMethod.Card,
        type: ITransaction.Type.PaidPlan,
        providerRefNum: null,
      });

      const updated = await transactions.update({
        id: created.id,
        status: ITransaction.Status.Paid,
      });

      expect(updated.id).to.be.eq(created.id);
      expect(updated.amount).to.be.eq(created.amount);
      expect(updated.status).to.be.eq(ITransaction.Status.Paid);
      expect(updated.paymentMethod).to.be.eq(created.paymentMethod);
      expect(updated.providerRefNum).to.be.eq(created.providerRefNum);
    });

    it("should successfully update the transaction providerRefNum", async () => {
      const user = await fixtures.tutor();
      const created = await transactions.create({
        userId: user.id,
        phone: user.phone || "",
        amount: 200,
        paymentMethod: ITransaction.PaymentMethod.Card,
        type: ITransaction.Type.PaidPlan,
        providerRefNum: null,
      });

      const updated = await transactions.update({
        id: created.id,
        providerRefNum: "123",
      });

      expect(updated.id).to.be.eq(created.id);
      expect(updated.amount).to.be.eq(created.amount);
      expect(updated.status).to.be.eq(created.status);
      expect(updated.paymentMethod).to.be.eq(created.paymentMethod);
      expect(updated.providerRefNum).to.be.eq("123");
    });
  });

  describe(nameof(transactions.find), () => {
    it("should successfully retrieve transactions for a specific set of users", async () => {
      const users1 = await Promise.all([
        fixtures.tutor(),
        fixtures.tutor(),
        fixtures.tutor(),
      ]);

      const users2 = await Promise.all([
        fixtures.tutor(),
        fixtures.tutor(),
        fixtures.tutor(),
      ]);

      for (const user of [...users1, ...users2]) {
        await transactions.create({
          userId: user.id,
          phone: user.phone || "",
          amount: 200,
          paymentMethod: ITransaction.PaymentMethod.Card,
          type: ITransaction.Type.PaidPlan,
          providerRefNum: null,
        });
      }

      const res = await transactions.find({
        users: users2.map((u) => u.id),
        amount: 200,
        paymentMethods: [ITransaction.PaymentMethod.Card],
        providerRefNums: null,
      });

      expect(res.total).to.be.eq(3);
    });
  });

  describe(nameof(transactions.findById), () => {
    it("should retrieve a specific transaction with its id", async () => {
      const user = await fixtures.tutor();

      const tx = await transactions.create({
        userId: user.id,
        phone: user.phone || "",
        amount: 200,
        paymentMethod: ITransaction.PaymentMethod.Card,
        type: ITransaction.Type.PaidPlan,
        providerRefNum: null,
      });

      const res = await transactions.findById(tx.id);
      expect(res).to.deep.eq(tx);
      const res2 = await transactions.findById(-1);
      expect(res2).to.be.null;
    });
  });
});
