import { mockApi, mockApiContext } from "@fixtures/mockApi";
import db from "@fixtures/db";
import handlers from "@/handlers/invoice";
import { FieldError, IInvoice, IUser } from "@litespace/types";
import { expect } from "chai";
import { invoices, lessons } from "@litespace/models";
import {
  apierror,
  forbidden,
  illegalInvoiceUpdate,
  notfound,
} from "@/lib/error";
import { Readable } from "stream";

const createInvoice = mockApi<IInvoice.CreateApiPayload>(handlers.create);

const updateInvoice = mockApi<
  IInvoice.UpdateApiPayload,
  IInvoice.UpdateApiParams
>(handlers.update(mockApiContext()));

const findInvoice = mockApi<object, object, IInvoice.FindInvoicesQuery>(
  handlers.find
);

const findStats = mockApi<object, IInvoice.FindStatsParams>(handlers.stats);

const getMockFile = (): Express.Multer.File => ({
  filename: "mockfile",
  fieldname: "mockfield",
  originalname: "mockname",
  encoding: "testing",
  mimetype: "testing",
  size: 1,
  stream: new Readable(),
  destination: "empty",
  path: "/tmp",
  buffer: Buffer.from(new ArrayBuffer()),
});

describe("/api/v1/invoice/", () => {
  beforeEach(async () => {
    return await db.flush();
  });

  describe("POST /api/v1/invoice/", () => {
    it("should respond with forbidden in case the requester is not a tutor", async () => {
      const student = await db.student();
      const studio = await db.user({ role: IUser.Role.Studio });
      const admin = await db.user({ role: IUser.Role.SuperAdmin });

      const res1 = await createInvoice({
        body: {
          method: IInvoice.WithdrawMethod.Wallet,
          receiver: "01199999999",
          amount: 100,
        },
        user: student,
      });
      const res2 = await createInvoice({
        body: {
          method: IInvoice.WithdrawMethod.Wallet,
          receiver: "01199999999",
          amount: 100,
        },
        user: studio,
      });
      const res3 = await createInvoice({
        body: {
          method: IInvoice.WithdrawMethod.Wallet,
          receiver: "01199999999",
          amount: 100,
        },
        user: admin,
      });

      expect(res1).to.deep.eq(forbidden());
      expect(res2).to.deep.eq(forbidden());
      expect(res3).to.deep.eq(forbidden());
    });

    it("should respond with bad in case the tutor make invoice with an amount more than the acquired", async () => {
      const tutor = await db.user({ role: IUser.Role.Tutor });
      const acquired = await lessons.sumPrice({ past: true, canceled: false });

      const res = await createInvoice({
        body: {
          method: IInvoice.WithdrawMethod.Wallet,
          receiver: "01199999999",
          amount: acquired + 1,
        },
        user: tutor,
      });

      expect(res).to.deep.eq(
        apierror(FieldError.InvoiceMaxAmountExceeded, 400)
      );
    });

    it("should respond with bad in case the bank receiver is incorrect", async () => {
      const student = await db.student();
      const tutor = await db.user({ role: IUser.Role.Tutor });
      const lesson = await db.lesson({
        tutor: tutor.id,
        student: student.id,
        price: 10000,
        timing: "past",
      });

      const res = await createInvoice({
        body: {
          method: IInvoice.WithdrawMethod.Bank,
          receiver: "invalid:123321",
          amount: lesson.lesson.price,
        },
        user: tutor,
      });

      expect(res).to.deep.eq(apierror(FieldError.InvalidBankName, 400));
    });

    it("should respond with bad in case the wallet receiver is incorrect", async () => {
      const student = await db.student();
      const tutor = await db.user({ role: IUser.Role.Tutor });
      const lesson = await db.lesson({
        tutor: tutor.id,
        student: student.id,
        price: 10000,
        timing: "past",
      });

      const res = await createInvoice({
        body: {
          method: IInvoice.WithdrawMethod.Wallet,
          receiver: "12321423441",
          amount: lesson.lesson.price,
        },
        user: tutor,
      });

      expect(res).to.deep.eq(apierror(FieldError.InvalidPhone, 400));
    });

    it("should respond with bad in case the instapay receiver is incorrect", async () => {
      const student = await db.student();
      const tutor = await db.user({ role: IUser.Role.Tutor });
      const lesson = await db.lesson({
        tutor: tutor.id,
        student: student.id,
        price: 10000,
        timing: "past",
      });

      const res = await createInvoice({
        body: {
          method: IInvoice.WithdrawMethod.Instapay,
          receiver: "test@NOTinstapay",
          amount: lesson.lesson.price,
        },
        user: tutor,
      });

      expect(res).to.deep.eq(apierror(FieldError.InvalidInstapayIPA, 400));
    });

    it("should successfully create an invoice", async () => {
      const student = await db.student();
      const tutor = await db.user({ role: IUser.Role.Tutor });
      const { lesson } = await db.lesson({
        tutor: tutor.id,
        student: student.id,
        price: 10000,
        timing: "past",
      });

      const res = await createInvoice({
        body: {
          method: IInvoice.WithdrawMethod.Wallet,
          // NOTE: this is invalid; by convention it's just the username before the @
          receiver: "01099999999",
          amount: lesson.price,
        },
        user: tutor,
      });

      const body = res.body as IInvoice.CreateApiPayloadResponse;
      const updated = await invoices.findById(body.id);

      expect(res.status).to.eq(200);
      expect(updated?.status).to.eq(IInvoice.Status.PendingApproval);
    });
  });

  describe("PUT /api/v1/invoice/:invoiceId", () => {
    it("should respond with notfound in case the invoice doesn't exist", async () => {
      const student = await db.student();
      const tutor = await db.user({ role: IUser.Role.Tutor });
      await db.lesson({
        tutor: tutor.id,
        student: student.id,
        price: 10000,
        timing: "past",
      });

      const res = await updateInvoice({
        params: { invoiceId: 123123 },
        body: { status: IInvoice.Status.PendingCancellation },
        user: tutor,
      });

      expect(res).to.deep.eq(notfound.invoice());
    });

    it("should respond with forbidden in case the requester is neither a tutor nor an admin", async () => {
      const student = await db.student();
      const tutor = await db.user({ role: IUser.Role.Tutor });
      const { lesson } = await db.lesson({
        tutor: tutor.id,
        student: student.id,
        price: 10000,
        timing: "past",
      });

      const invoice = await invoices.create({
        userId: tutor.id,
        method: IInvoice.WithdrawMethod.Instapay,
        receiver: "user@instapay",
        amount: lesson.price,
      });

      const res = await updateInvoice({
        params: { invoiceId: invoice.id },
        body: { status: IInvoice.Status.PendingCancellation },
        user: student,
      });

      expect(res).to.deep.eq(forbidden());
    });

    it("should respond with forbidden in case the tutor is trying to update any field rather than the status", async () => {
      const student = await db.student();
      const tutor = await db.user({ role: IUser.Role.Tutor });
      const { lesson } = await db.lesson({
        tutor: tutor.id,
        student: student.id,
        price: 10000,
        timing: "past",
      });

      const invoice = await invoices.create({
        userId: tutor.id,
        method: IInvoice.WithdrawMethod.Instapay,
        receiver: "user@instapay",
        amount: lesson.price,
      });

      const res = await updateInvoice({
        params: { invoiceId: invoice.id },
        files: { [IInvoice.ReceiptFileKey]: [getMockFile()] },
        body: { status: IInvoice.Status.PendingCancellation },
        user: student,
      });

      expect(res).to.deep.eq(forbidden());
    });

    it("should respond with illegal in case the tutor is trying to update status to any value rather than PendingCancellation", async () => {
      const student = await db.student();
      const tutor = await db.user({ role: IUser.Role.Tutor });
      const { lesson } = await db.lesson({
        tutor: tutor.id,
        student: student.id,
        price: 10000,
        timing: "past",
      });

      const invoice = await invoices.create({
        userId: tutor.id,
        method: IInvoice.WithdrawMethod.Instapay,
        receiver: "user@instapay",
        amount: lesson.price,
      });

      const res = await updateInvoice({
        params: { invoiceId: invoice.id },
        body: { status: IInvoice.Status.Approved },
        user: tutor,
      });

      expect(res).to.deep.eq(illegalInvoiceUpdate());
    });

    it("should not update the addressedBy column when the tutor update the invoice", async () => {
      const student = await db.student();
      const tutor = await db.user({ role: IUser.Role.Tutor });
      const { lesson } = await db.lesson({
        tutor: tutor.id,
        student: student.id,
        price: 10000,
        timing: "past",
      });

      const invoice = await invoices.create({
        userId: tutor.id,
        method: IInvoice.WithdrawMethod.Instapay,
        receiver: "user@instapay",
        amount: lesson.price,
      });

      const res = await updateInvoice({
        params: { invoiceId: invoice.id },
        body: { status: IInvoice.Status.PendingCancellation },
        user: tutor,
      });

      const updated = await invoices.findById(invoice.id);
      expect(res.status).to.eq(200);
      expect(updated?.status).to.eq(IInvoice.Status.PendingCancellation);
      expect(updated?.addressedBy).to.eq(null);
    });

    it("should update the addressedBy column when an admin update the invoice", async () => {
      const student = await db.student();
      const admin = await db.user({ role: IUser.Role.SuperAdmin });
      const tutor = await db.user({ role: IUser.Role.Tutor });
      const { lesson } = await db.lesson({
        tutor: tutor.id,
        student: student.id,
        price: 10000,
        timing: "past",
      });

      const invoice = await invoices.create({
        userId: tutor.id,
        method: IInvoice.WithdrawMethod.Instapay,
        receiver: "user@isntapay",
        amount: lesson.price,
      });

      const res = await updateInvoice({
        params: { invoiceId: invoice.id },
        files: { [IInvoice.ReceiptFileKey]: [getMockFile()] },
        body: { status: IInvoice.Status.Approved },
        user: admin,
      });

      const updated = await invoices.findById(invoice.id);
      expect(res.status).to.eq(200);
      expect(updated?.status).to.eq(IInvoice.Status.Approved);
      expect(updated?.addressedBy).to.eq(admin.id);
    });

    it("should not update from non-pending statuses", async () => {
      const student = await db.student();
      const admin = await db.user({ role: IUser.Role.SuperAdmin });
      const tutor = await db.user({ role: IUser.Role.Tutor });
      const { lesson } = await db.lesson({
        tutor: tutor.id,
        student: student.id,
        price: 10000,
        timing: "past",
      });

      const invoice = await invoices.create({
        userId: tutor.id,
        method: IInvoice.WithdrawMethod.Instapay,
        receiver: "user@isntapay",
        amount: lesson.price,
      });

      await updateInvoice({
        params: { invoiceId: invoice.id },
        body: { status: IInvoice.Status.Approved },
        user: admin,
      });

      const res = await updateInvoice({
        params: { invoiceId: invoice.id },
        body: { status: IInvoice.Status.PendingApproval },
        user: admin,
      });
      expect(res).to.deep.eq(illegalInvoiceUpdate());
    });
  });

  describe("GET /api/v1/invoice", () => {
    it("should respond with forbidden if the requester is neither a tutor nor an admin", async () => {
      const student = await db.student();
      const res = await findInvoice({ user: student });
      expect(res).to.deep.eq(forbidden());
    });

    it("should get a list of invoices associated to the requester when it's a tutor", async () => {
      const student = await db.student();

      const tutor1 = await db.user({ role: IUser.Role.Tutor });
      const { lesson } = await db.lesson({
        tutor: tutor1.id,
        student: student.id,
        price: 10000,
        timing: "past",
      });
      const invoice1 = await invoices.create({
        userId: tutor1.id,
        method: IInvoice.WithdrawMethod.Instapay,
        receiver: "user@instapay",
        amount: lesson.price,
      });

      const tutor2 = await db.user({ role: IUser.Role.Tutor });
      const { lesson: lesson2 } = await db.lesson({
        tutor: tutor2.id,
        student: student.id,
        price: 20000,
        timing: "past",
      });
      await invoices.create({
        userId: tutor2.id,
        method: IInvoice.WithdrawMethod.Instapay,
        receiver: "user@isntapay",
        amount: lesson2.price,
      });

      const res = await findInvoice({ user: tutor1 });
      expect(res.status).to.eq(200);
      const body = res.body as IInvoice.FindInvoicesApiResponse;
      expect(body.total).to.eq(1);
      expect(body.list).to.deep.eq([invoice1]);
    });

    it("should get a list of invoices associated to all tutors if the requester is an admin", async () => {
      const student = await db.student();
      const admin = await db.user({ role: IUser.Role.SuperAdmin });

      const tutor1 = await db.user({ role: IUser.Role.Tutor });
      const { lesson } = await db.lesson({
        tutor: tutor1.id,
        student: student.id,
        price: 10000,
        timing: "past",
      });
      const invoice1 = await invoices.create({
        userId: tutor1.id,
        method: IInvoice.WithdrawMethod.Instapay,
        receiver: "user@instapay",
        amount: lesson.price,
      });

      const tutor2 = await db.user({ role: IUser.Role.Tutor });
      const { lesson: lesson2 } = await db.lesson({
        tutor: tutor2.id,
        student: student.id,
        price: 20000,
        timing: "past",
      });
      const invoice2 = await invoices.create({
        userId: tutor2.id,
        method: IInvoice.WithdrawMethod.Instapay,
        receiver: "user@instapay",
        amount: lesson2.price,
      });

      const res = await findInvoice({ user: admin });
      const body = res.body as IInvoice.FindInvoicesApiResponse;
      expect(body.total).to.eq(2);
      for (const invoice of [invoice1, invoice2]) {
        expect(body.list).to.deep.contain(invoice);
      }
    });

    it("should get a filtered list of invoices for admins", async () => {
      const student = await db.student();
      const admin = await db.user({ role: IUser.Role.SuperAdmin });

      const tutor1 = await db.user({ role: IUser.Role.Tutor });
      const { lesson } = await db.lesson({
        tutor: tutor1.id,
        student: student.id,
        price: 10000,
        timing: "past",
      });
      const invoice1 = await invoices.create({
        userId: tutor1.id,
        method: IInvoice.WithdrawMethod.Instapay,
        receiver: "user@instapay",
        amount: lesson.price,
      });

      const tutor2 = await db.user({ role: IUser.Role.Tutor });
      await db.lesson({
        tutor: tutor2.id,
        student: student.id,
        price: 20000,
        timing: "past",
      });

      const res = await findInvoice({
        query: { users: [tutor1.id] },
        user: admin,
      });
      const body = res.body as IInvoice.FindInvoicesApiResponse;
      expect(body.total).to.eq(1);
      expect(body.list).to.deep.contain(invoice1);
    });
  });

  describe("GET /api/v1/invoice/stats/:tutorId", () => {
    it("should respond with forbidden if the user is neither an admin nor a tutor", async () => {
      const student = await db.student();
      const tutor = await db.user({ role: IUser.Role.Tutor });
      const res = await findStats({
        params: { tutorId: tutor.id },
        user: student,
      });
      expect(res).to.deep.eq(forbidden());
    });

    it("should respond with forbidden if the user is an tutor but with a different id than tutorId param", async () => {
      const tutor1 = await db.user({ role: IUser.Role.Tutor });
      const tutor2 = await db.user({ role: IUser.Role.Tutor });

      const res = await findStats({
        params: { tutorId: tutor1.id },
        user: tutor2,
      });

      expect(res).to.deep.eq(forbidden());
    });

    it("should successfully response with the tutor stats", async () => {
      const admin = await db.user({ role: IUser.Role.SuperAdmin });

      const tutor = await db.user({ role: IUser.Role.Tutor });
      const student = await db.student();

      // seeding lessons
      await Promise.all([
        db.lesson({
          tutor: tutor.id,
          student: student.id,
          timing: "past",
          price: 1000,
        }),
        db.lesson({
          tutor: tutor.id,
          student: student.id,
          timing: "past",
          price: 1000,
        }),
        db.lesson({
          tutor: tutor.id,
          student: student.id,
          timing: "past",
          canceled: true,
        }),
        db.lesson({
          tutor: tutor.id,
          student: student.id,
          timing: "future",
          price: 500,
        }),
        db.lesson({
          tutor: tutor.id,
          student: student.id,
          timing: "future",
          price: 500,
        }),
        db.lesson({
          tutor: tutor.id,
          student: student.id,
          timing: "past",
          canceled: true,
        }),
      ]);

      // seeding invoices
      await invoices.create({
        userId: tutor.id,
        amount: 1000,
        method: IInvoice.WithdrawMethod.Wallet,
        receiver: "01099999999",
      });
      const invoice2 = await invoices.create({
        userId: tutor.id,
        amount: 500,
        method: IInvoice.WithdrawMethod.Wallet,
        receiver: "01099999999",
      });
      await invoices.update(invoice2.id, {
        status: IInvoice.Status.Approved,
      });

      // checking the results
      const res = await findStats({
        params: { tutorId: tutor.id },
        user: admin,
      });
      const body = res.body as IInvoice.StatsApiResponse;

      expect(res.status).to.eq(200);
      expect(body.spendable).to.eq(500);

      expect(body.invoices.total).to.eq(1500);
      expect(body.invoices.fulfilled).to.eq(500);
      expect(body.invoices.pending).to.eq(1000);

      expect(body.income.total).to.eq(3000);
      expect(body.income.future).to.eq(1000);
      expect(body.income.past).to.eq(2000);
    });
  });
});
