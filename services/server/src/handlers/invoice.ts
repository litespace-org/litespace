import {
  apierror,
  bad,
  forbidden,
  illegalInvoiceUpdate,
  notfound,
  unexpected,
} from "@/lib/error";
import { getRequestFile, upload } from "@/lib/assets";
import { ApiContext } from "@/types/api";
import {
  ids,
  invoiceStatus,
  jsonBoolean,
  orderDirection,
  pageNumber,
  pageSize,
  withdrawMethod,
  withNamedId,
} from "@/validation/utils";
import { isAdmin, isRegularTutor } from "@litespace/utils/user";
import { invoices, lessons } from "@litespace/models";
import { IInvoice, IUser, Wss } from "@litespace/types";
import { NextFunction, Request, Response } from "express";
import safeRequest from "express-async-handler";
import zod from "zod";
import {
  isValidInvoiceAmount,
  isValidInvoiceNote,
  isValidInvoiceReceiver,
} from "@litespace/utils";
import bytes from "bytes";

const createPayload = zod.object({
  method: withdrawMethod,
  receiver: zod.string(),
  amount: zod.coerce.number().int().positive(),
  note: zod.optional(zod.string()),
});

const updatePayload = zod.object({
  status: zod.optional(zod.nativeEnum(IInvoice.Status)),
  note: zod.optional(zod.string()),
});

const orderByOptions = [
  "created_at",
  "updated_at",
  "amount",
] as const satisfies Array<IInvoice.FindInvoicesQuery["orderBy"]>;

const findPayload = zod.object({
  users: zod.optional(ids),
  methods: zod.optional(zod.array(withdrawMethod)),
  statuses: zod.optional(zod.array(invoiceStatus)),
  receipt: zod.optional(jsonBoolean),
  orderBy: zod.optional(zod.enum(orderByOptions)),
  orderDirection: zod.optional(orderDirection),
  page: zod.optional(pageNumber),
  size: zod.optional(pageSize),
});

async function stats(req: Request, res: Response, next: NextFunction) {
  const { tutorId } = withNamedId("tutorId").parse(req.params);
  const user = req.user;
  const allowed =
    (isRegularTutor(user) && user.id === tutorId) || isAdmin(user);
  if (!allowed) return next(forbidden());

  const users: number[] = [tutorId];
  const canceled: boolean = false;
  /**
   * Total tutor earnings including "past" and "future" lessons
   *
   * Canceled lessons are not included.
   */
  const totalIncome = await lessons.sumPrice({
    users,
    canceled,
    future: true,
  });
  /**
   * Total tutor "past" earnings.
   *
   * Canceled lessons are not included.
   */
  const pastIncome = await lessons.sumPrice({
    users,
    canceled,
    future: false,
  });

  /**
   * Tutor earning from future lessons (pending funds)
   *
   * Cannot be spent until the lesson is fulfilled.
   */
  const futureIncome = totalIncome - pastIncome;

  /**
   * Total sum for all invoices created by the tutor including "fulfilled" and "pending".
   *
   * Canceled or rejected invoices are not included.
   */
  const totalInvoices = await invoices.sumAmounts({ users });
  /**
   * Total sum for all "fulfulled" invoices created by the tutor.
   */
  const fulfilledInvoices = await invoices.sumAmounts({
    users,
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
  const acquired = await lessons.sumPrice({ past: true, canceled: false });

  // todo: add verbose error response about what is wrong with the invoice
  const validations = [
    isValidInvoiceReceiver(payload.receiver, payload.method),
    isValidInvoiceAmount(payload.amount, 0, acquired),
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
          })
        : undefined;

      await invoices.update(invoice.id, {
        status: payload.status,
        receipt: receiptId,
        addressedBy: itsTutor ? undefined : (user as IUser.Self).id,
        note: itsTutor ? payload.note : undefined,
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
  const query: IInvoice.FindInvoicesQuery = findPayload.parse(req.query);
  const itsTutor = isRegularTutor(user);
  const allowed = itsTutor || isAdmin(user);
  if (!allowed) return next(forbidden());

  const { list, total } = itsTutor
    ? await invoices.findByUser(user.id)
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
