import fixtures from "@fixtures/db";
import { nameof, wait } from "@litespace/utils/utils";
import { invoices } from "@/index";
import { IInvoice, IWithdrawMethod } from "@litespace/types";
import { expect } from "chai";
import { sum } from "lodash";

describe("Invoices", () => {
  beforeEach(async () => {
    return await fixtures.flush();
  });

  describe(nameof(invoices.create), () => {
    it("should successfully create and retrieve an invoice", async () => {
      const tutor = await fixtures.tutor();

      const newInvoice = await invoices.create({
        userId: tutor.id,
        method: IWithdrawMethod.Type.Instapay,
        receiver: "tutorname",
        amount: 200000,
        note: "Just a test note",
      });

      const dbInvoice = await invoices.findById(newInvoice.id);
      expect(dbInvoice).to.deep.eq(newInvoice);
    });
  });

  describe(nameof(invoices.update), () => {
    it("should update an invoice state", async () => {
      const tutor = await fixtures.tutor();
      const newInvoice = await invoices.create({
        userId: tutor.id,
        method: IWithdrawMethod.Type.Instapay,
        receiver: "tutorname",
        amount: 200000,
        note: "Just a test note",
      });

      await invoices.update(newInvoice.id, {
        status: IInvoice.Status.PendingCancellation,
      });

      const updated = await invoices.findById(newInvoice.id);
      expect(updated?.status).to.eq(IInvoice.Status.PendingCancellation);
    });

    it("should update an invoice receipt", async () => {
      const tutor = await fixtures.tutor();
      const newInvoice = await invoices.create({
        userId: tutor.id,
        method: IWithdrawMethod.Type.Instapay,
        receiver: "tutorname",
        amount: 200000,
        note: "Just a test note",
      });

      await invoices.update(newInvoice.id, {
        receipt: "b0ac23sdgk23asdk",
      });

      const updated = await invoices.findById(newInvoice.id);
      expect(updated?.receipt).to.eq("b0ac23sdgk23asdk");
    });

    it("should update an invoice update date", async () => {
      const tutor = await fixtures.tutor();
      const newInvoice = await invoices.create({
        userId: tutor.id,
        method: IWithdrawMethod.Type.Instapay,
        receiver: "tutorname",
        amount: 200000,
        note: "Just a test note",
      });

      await wait(1);

      await invoices.update(newInvoice.id, {
        receipt: "b0ac23sdgk23asdk",
      });

      const updated = await invoices.findById(newInvoice.id);
      expect(updated?.updatedAt).to.not.eq(newInvoice.updatedAt);
    });
  });

  describe(nameof(invoices.find), () => {
    it("should successfully find paginated invoices with a specified query", async () => {
      const tutor1 = await fixtures.tutor();
      const tutor2 = await fixtures.tutor();

      const newlist = await Promise.all([
        await invoices.create({
          userId: tutor1.id,
          method: IWithdrawMethod.Type.Instapay,
          receiver: "tutorname",
          amount: 200000,
        }),
        await invoices.create({
          userId: tutor1.id,
          method: IWithdrawMethod.Type.Bank,
          receiver: "alex:2183921830112",
          amount: 20000,
        }),
        await invoices.create({
          userId: tutor1.id,
          method: IWithdrawMethod.Type.Instapay,
          receiver: "tutorname",
          amount: 350000,
        }),
        await invoices.create({
          userId: tutor2.id,
          method: IWithdrawMethod.Type.Bank,
          receiver: "nbe:12389128390122",
          amount: 150000,
        }),
      ]);

      const res1 = await invoices.find({ users: [tutor1.id] });
      const res2 = await invoices.find({
        users: [tutor1.id],
        methods: [IWithdrawMethod.Type.Instapay],
      });
      const res3 = await invoices.find({
        methods: [IWithdrawMethod.Type.Bank],
      });

      expect(res1.total).to.eq(3);
      for (const obj of newlist.slice(0, 3)) {
        expect(res1.list).to.deep.include(obj);
      }

      expect(res2.total).to.eq(2);
      expect(res2.list).to.deep.include(newlist[0]);
      expect(res2.list).to.deep.include(newlist[2]);

      expect(res3.total).to.eq(2);
      expect(res3.list).to.deep.include(newlist[1]);
      expect(res3.list).to.deep.include(newlist[3]);
    });
  });

  describe(nameof(invoices.findByUser), () => {
    it("should find a paginated list of invoices of a specific user", async () => {
      const tutor1 = await fixtures.tutor();
      const tutor2 = await fixtures.tutor();

      const newlist = await Promise.all([
        await invoices.create({
          userId: tutor1.id,
          method: IWithdrawMethod.Type.Instapay,
          receiver: "tutorname",
          amount: 200000,
        }),
        await invoices.create({
          userId: tutor1.id,
          method: IWithdrawMethod.Type.Bank,
          receiver: "alex:2183921830112",
          amount: 20000,
        }),
        await invoices.create({
          userId: tutor1.id,
          method: IWithdrawMethod.Type.Instapay,
          receiver: "tutorname",
          amount: 350000,
        }),
        await invoices.create({
          userId: tutor2.id,
          method: IWithdrawMethod.Type.Bank,
          receiver: "nbe:12389128390122",
          amount: 150000,
        }),
      ]);

      const res = await invoices.findByUser(tutor1.id);

      expect(res.total).to.eq(3);
      for (const obj of newlist.slice(0, 3)) {
        expect(res.list).to.deep.include(obj);
      }
    });
  });

  describe(nameof(invoices.sumAmounts), () => {
    it("should return the sum amount of invoices of a specific user / list of users / status / list of statuses", async () => {
      const tutor1 = await fixtures.tutor();
      const tutor2 = await fixtures.tutor();

      const newlist = await Promise.all([
        await invoices.create({
          userId: tutor1.id,
          method: IWithdrawMethod.Type.Instapay,
          receiver: "tutorname",
          amount: 200000,
        }),
        await invoices.create({
          userId: tutor1.id,
          method: IWithdrawMethod.Type.Bank,
          receiver: "alex:2183921830112",
          amount: 20000,
        }),
        await invoices.create({
          userId: tutor1.id,
          method: IWithdrawMethod.Type.Instapay,
          receiver: "tutorname",
          amount: 350000,
        }),
        await invoices.create({
          userId: tutor2.id,
          method: IWithdrawMethod.Type.Bank,
          receiver: "nbe:12389128390122",
          amount: 150000,
        }),
      ]);

      const res1 = await invoices.sumAmounts({ users: [] });
      const res2 = await invoices.sumAmounts({ users: [tutor1.id] });
      const res3 = await invoices.sumAmounts({ users: [tutor1.id, tutor2.id] });
      const res4 = await invoices.sumAmounts({
        status: [IInvoice.Status.Approved],
      });
      const res5 = await invoices.sumAmounts({
        status: [IInvoice.Status.PendingApproval],
      });

      expect(res1).to.eq(0);
      expect(res2).to.eq(
        sum(newlist.slice(0, 3).map((invoice) => invoice.amount))
      );
      expect(res3).to.eq(sum(newlist.map((invoice) => invoice.amount)));
      expect(res4).to.eq(0);
      expect(res5).to.eq(sum(newlist.map((invoice) => invoice.amount)));
    });
  });
});
