import {
  apierror,
  bad,
  forbidden,
  illegalInvoiceUpdate,
  notfound,
  unexpected,
} from "@/lib/error/api";
import { getRequestFile, upload } from "@/lib/assets";
import { ApiContext } from "@/types/api";
import {
  ids,
  invoiceStatus,
  pageNumber,
  pageSize,
  jsonBoolean,
  withdrawMethod,
  withNamedId,
} from "@/validation/utils";
import { isAdmin, isRegularTutor } from "@litespace/utils/user";
import { invoices, lessons } from "@litespace/models";
import { IInvoice, IUser, Wss } from "@litespace/types";
import { NextFunction, Request, Response } from "express";
import safeRequest from "express-async-handler";
import zod, { ZodSchema } from "zod";
import {
  dayjs,
  isValidInvoiceAmount,
  isValidInvoiceNote,
  isValidInvoiceReceiver,
} from "@litespace/utils";
import bytes from "bytes";
import { calculateWithdrawableAmount } from "@/lib/invoice";

const createPayload: ZodSchema<IInvoice.CreateApiPayload> = zod.object({
  method: withdrawMethod,
  receiver: zod.string(),
  amount: zod.coerce.number().int().positive(),
  note: zod.optional(zod.string()),
});

const updatePayload: ZodSchema<IInvoice.UpdateApiPayload> = zod.object({
  status: zod.optional(zod.nativeEnum(IInvoice.Status)),
  note: zod.optional(zod.string()),
});

const orderByOptions = [
  "created_at",
  "updated_at",
  "amount",
] as const satisfies Array<IInvoice.FindInvoicesQuery["orderBy"]>;

const findQuery: ZodSchema<IInvoice.FindInvoicesQuery> = zod.object({
  users: zod.optional(ids),
  methods: zod.optional(zod.array(withdrawMethod)),
  statuses: zod.optional(zod.array(invoiceStatus)),
  receipt: zod.optional(jsonBoolean),
  orderBy: zod.optional(zod.enum(orderByOptions)),
  page: zod.optional(pageNumber),
  size: zod.optional(pageSize),
});

async function stats(req: Request, res: Response, next: NextFunction) {
  const { tutorId } = withNamedId("tutorId").parse(req.params);
  const user = req.user;
  const allowed =
    (isRegularTutor(user) && user.id === tutorId) || isAdmin(user);
  if (!allowed) return next(forbidden());

  const now = dayjs();

  /**
   * Total tutor earnings including "past" and "future" lessons
   */
  const totalIncome = await lessons.sumPrice({
    users: [tutorId],
    canceled: false,
    reported: false,
  });

  /**
   * Total tutor "past" earnings.
   */
  const pastIncome = await lessons.sumPrice({
    users: [tutorId],
    canceled: false,
    reported: false,
    before: now.toISOString(),
  });

  /**
   * Tutor earning from future lessons (pending funds)
   * Cannot be spent until the lesson is fulfilled.
   */
  const futureIncome = totalIncome - pastIncome;

  /**
   * Total sum for all invoices created by the tutor including "fulfilled" and "pending".
   * Canceled or rejected invoices are not included.
   */
  const totalInvoices = await invoices.sumAmounts({
    users: [tutorId],
    status: [
      IInvoice.Status.Approved,
      IInvoice.Status.PendingApproval,
      IInvoice.Status.PendingCancellation,
    ],
  });

  /**
   * Total sum for all "fulfulled" invoices created by the tutor.
   */
  const fulfilledInvoices = await invoices.sumAmounts({
    users: [tutorId],
    status: [IInvoice.Status.Approved],
  });

  /**
   * Total sum for all "pending" tutor invoices.
   */
  const pendingInvoices = totalInvoices - fulfilledInvoices;

  /**
   * What the tutor can withdraw from the platform.
   *
   * It is equal to the difference between all past income (earnings) and his
   * total invoices.
   *
   * - Future income is not included as it is not spendable yet.
   * - Pending invoices is included in the calculation to pervent
   *   douple-spending problem.
   */
  const spendable = pastIncome - totalInvoices;

  const response: IInvoice.StatsApiResponse = {
    income: {
      total: totalIncome,
      future: futureIncome,
      past: pastIncome,
    },
    invoices: {
      total: totalInvoices,
      fulfilled: fulfilledInvoices,
      pending: pendingInvoices,
    },
    spendable,
  };

  res.status(200).json(response);
}

async function create(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isRegularTutor(user);
  if (!allowed) return next(forbidden());

  const payload: IInvoice.CreateApiPayload = createPayload.parse(req.body);

  const withdrawable = await calculateWithdrawableAmount(user.id);

  // todo: add verbose error response about what is wrong with the invoice
  const validations = [
    isValidInvoiceReceiver(payload.receiver, payload.method),
    isValidInvoiceAmount(payload.amount, 0, withdrawable),
    isValidInvoiceNote(payload.note),
  ];

  for (const result of validations)
    if (result !== true) return next(apierror(result, 400));

  const response: IInvoice.CreateApiPayloadResponse = await invoices.create({
    userId: user.id,
    method: payload.method,
    receiver: payload.receiver,
    amount: payload.amount,
  });

  res.status(200).json(response);
}

function update(context: ApiContext) {
  return safeRequest(
    async (req: Request, res: Response, next: NextFunction) => {
      const user = req.user;
      const itsTutor = isRegularTutor(user);
      const allowed = itsTutor || isAdmin(user);
      if (!allowed) return next(forbidden());

      const { invoiceId } = withNamedId("invoiceId").parse(req.params);
      const payload = updatePayload.parse(req.body);
      const receipt = getRequestFile(req.files, IInvoice.ReceiptFileKey);

      const invoice = await invoices.findById(invoiceId);
      if (!invoice) return next(notfound.invoice());

      if (itsTutor && invoice.userId !== user.id) return next(forbidden());
      if (itsTutor && receipt) return next(forbidden());
      if (itsTutor && payload.status !== IInvoice.Status.PendingCancellation)
        return next(illegalInvoiceUpdate());

      if (
        invoice.status !== IInvoice.Status.PendingApproval &&
        invoice.status !== IInvoice.Status.PendingCancellation &&
        payload.status !== undefined
      )
        return next(illegalInvoiceUpdate());

      if (receipt) {
        const limit = bytes("8mb");
        if (!limit) return next(unexpected());
        if (receipt.size > limit) return next(bad());
      }

      const receiptId = receipt
        ? await upload({
            data: receipt.buffer,
            type: receipt.mimetype,
            prefix: "invoices/receipts/",
          })
        : undefined;

      await invoices.update(invoice.id, {
        status: payload.status,
        receipt: receiptId,
        addressedBy: itsTutor ? undefined : (user as IUser.Self).id,
        note: !itsTutor ? payload.note : undefined,
      });

      context.io.sockets
        .to(Wss.Room.AdminInvoices)
        .emit(Wss.ServerEvent.InvoiceUpdated);

      res.sendStatus(200);
    }
  );
}

async function find(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const query: IInvoice.FindInvoicesQuery = findQuery.parse(req.query);
  const itsTutor = isRegularTutor(user);
  const allowed = itsTutor || isAdmin(user);
  if (!allowed) return next(forbidden());

  const { list, total } = itsTutor
    ? await invoices.findByUser(user.id, {
        page: query.page,
        size: query.size,
      })
    : await invoices.find(query);

  const masked = itsTutor
    ? list.map((invoice): IInvoice.Self => ({ ...invoice, receipt: null }))
    : list;

  const response: IInvoice.FindInvoicesApiResponse = {
    list: masked,
    total,
  };

  res.status(200).json(response);
}

export default {
  create: safeRequest(create),
  stats: safeRequest(stats),
  find: safeRequest(find),
  update,
};
