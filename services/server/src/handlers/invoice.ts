import {
  bad,
  empty,
  forbidden,
  illegalInvoiceUpdate,
  notfound,
} from "@/lib/error";
import { isValidInvoice } from "@/lib/invoice";
import { getRequestFile, upload } from "@/lib/assets";
import { ApiContext } from "@/types/api";
import {
  bank,
  ids,
  invoiceStatus,
  pageNumber,
  pageSize,
  queryBoolean,
  withdrawMethod,
  withNamedId,
} from "@/validation/utils";
import { isAdmin, isRegularTutor } from "@litespace/utils/user";
import { invoices, lessons } from "@litespace/models";
import { IInvoice, Wss } from "@litespace/types";
import { NextFunction, Request, Response } from "express";
import safeRequest from "express-async-handler";
import { isUndefined } from "lodash";
import zod from "zod";

const invoicePayload = zod.object({
  method: withdrawMethod,
  receiver: zod.string(),
  bank: zod.union([bank, zod.null()]),
  amount: zod.coerce.number().int().positive(),
});

const createPayload = invoicePayload;

const updateByAdminPayload = zod.object({
  status: zod.optional(
    zod.enum([
      IInvoice.Status.CancellationApprovedByAdmin,
      IInvoice.Status.Rejected,
      IInvoice.Status.Fulfilled,
    ])
  ),
  note: zod.optional(zod.string()),
});

const updateByReceiverPayload = zod.object({
  updateRequest: zod.optional(createPayload),
  cancel: zod.optional(zod.boolean()),
});

const findQueryPayload = zod.object({
  users: zod.optional(ids),
  methods: zod.array(withdrawMethod).optional(),
  banks: zod.array(bank).optional(),
  statuses: zod.array(invoiceStatus).optional(),
  receipt: queryBoolean.optional(),
  page: pageNumber.optional(),
  size: pageSize.optional(),
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
    pending: false,
  });

  /**
   * Total sum for all "pending" tutor invoices.
   */
  const pendingIncoices = totalInvoices - fulfilledInvoices;

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
      pending: pendingIncoices,
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
  // todo: add verbose error response about what is wrong with the invoice
  const valid = await isValidInvoice({ payload, userId: user.id });
  if (!valid) return next(bad());

  const invoice = await invoices.create({
    userId: user.id,
    method: payload.method,
    receiver: payload.receiver,
    bank: payload.bank,
    amount: payload.amount,
  });

  res.status(200).json(invoice);
}

function updateByReceiver(context: ApiContext) {
  return safeRequest(
    async (req: Request, res: Response, next: NextFunction) => {
      const user = req.user;
      const allowed = isRegularTutor(user);
      if (!allowed) return next(forbidden());

      const { invoiceId } = withNamedId("invoiceId").parse(req.params);
      const payload = updateByReceiverPayload.parse(req.body);

      const invoice = await invoices.findById(invoiceId);
      if (!invoice) return next(notfound.invoice());

      const owner = invoice.userId === user.id;
      if (!owner) return next(forbidden());

      // user cannot perform an update request and cancel the request at the same
      // time. Also cannot submit an empty request.
      const empty =
        isUndefined(payload.updateRequest) && isUndefined(payload.cancel);
      const full = !!payload.updateRequest && payload.cancel === true;
      const invalid = empty || full;
      if (invalid) return next(bad());

      const end = () => {
        // notify the admin that an invoice just got updated.
        context.io.sockets
          .to(Wss.Room.AdminInvoices)
          .emit(Wss.ServerEvent.InvoiceUpdated);
        res.status(200).json();
      };

      // only invoices in "pending" and "updated" status can be edited by the
      // tutor.
      const updatable = [
        IInvoice.Status.Pending,
        IInvoice.Status.UpdatedByReceiver,
      ].includes(invoice.status);
      if (!updatable) return next(illegalInvoiceUpdate());

      // 1. handle invoice cancellation by the receiver
      if (payload.cancel) {
        await invoices.update(invoice.id, {
          status: IInvoice.Status.CanceledByReceiver,
        });
        return end();
      }

      // 2. handle update request by the receiver
      if (!payload.updateRequest) return next(bad());
      const valid = await isValidInvoice({
        payload: payload.updateRequest,
        userId: invoice.userId,
        change: invoice.amount,
      });
      if (!valid) return next(bad());

      await invoices.update(invoice.id, {
        updateRequest: payload.updateRequest,
        status: IInvoice.Status.UpdatedByReceiver,
      });
      return end();
    }
  );
}

export function updateByAdmin(context: ApiContext) {
  return safeRequest(
    async (req: Request, res: Response, next: NextFunction) => {
      const user = req.user;
      const allowed = isAdmin(user);
      if (!allowed) return next(forbidden());

      const file = getRequestFile(req.files, "receipt");
      const { invoiceId } = withNamedId("invoiceId").parse(req.params);
      const payload: IInvoice.UpdateByAdminApiPayload =
        updateByAdminPayload.parse(req.body);

      const invoice = await invoices.findById(invoiceId);
      if (!invoice) return next(notfound.invoice());

      if (isUndefined(payload.status) && isUndefined(payload.note) && !file)
        return next(empty());

      if (payload.status && payload.status === invoice.status)
        return next(bad());

      const receipt = file
        ? await upload({ data: file.buffer, type: file.mimetype })
        : undefined;

      const approveUpdate =
        payload.status === IInvoice.Status.Pending &&
        invoice.status === IInvoice.Status.UpdatedByReceiver &&
        invoice.update;

      const amount = approveUpdate ? invoice.update?.amount : undefined;
      const method = approveUpdate ? invoice.update?.method : undefined;
      const bank = approveUpdate ? invoice.update?.bank : undefined;
      const receiver = approveUpdate ? invoice.update?.receiver : undefined;

      const updated = await invoices.update(invoice.id, {
        receipt,
        note: payload.note,
        status: payload.status,
        addressedBy: user.id,
        amount,
        method,
        bank,
        receiver,
        updateRequest: null, // reset the update request if any
      });

      res.status(200).json(updated);
      context.io.emit(Wss.ServerEvent.InvoiceDeleted);
    }
  );
}

async function find(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const query: IInvoice.FindInvoicesQuery = findQueryPayload.parse(req.query);
  const allowed =
    (isRegularTutor(user) && query.users?.includes(user.id)) || isAdmin(user);
  if (!allowed) return next(forbidden());

  const { list, total } = await invoices.find(query);

  // attachement is a private field.
  const masked = isRegularTutor(user)
    ? list.map((invoice): IInvoice.Self => ({ ...invoice, receipt: null }))
    : list;

  const response: IInvoice.FindInvoicesApiResponse = {
    list: masked,
    total,
  };

  res.status(200).json(response);
}

export async function cancel(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isRegularTutor(user);
  if (!allowed) return next(forbidden());

  const { id: invoiceId } = withNamedId("id").parse(req.params);
  const invoice = await invoices.findById(invoiceId);
  if (!invoice) return next(notfound.base());

  if (invoice.userId !== user.id) return next(forbidden());

  const cancelable = [
    IInvoice.Status.Pending,
    IInvoice.Status.UpdatedByReceiver,
  ];
  if (!cancelable) return next(bad());

  await invoices.update(invoice.id, {
    status: IInvoice.Status.CanceledByReceiver,
  });

  res.status(200).json();
}

export default {
  create: safeRequest(create),
  stats: safeRequest(stats),
  find: safeRequest(find),
  cancel: safeRequest(cancel),
  updateByAdmin,
  updateByReceiver,
};
