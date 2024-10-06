import { FileType } from "@/constants";
import { bad, forbidden, notfound } from "@/lib/error";
import { isValidInvoice } from "@/lib/invoice";
import { uploadSingle } from "@/lib/media";
import { ApiContext } from "@/types/api";
import {
  bank,
  id,
  invoiceStatus,
  pagination,
  withdrawMethod,
  withNamedId,
} from "@/validation/utils";
import { admin, authorizer, tutor } from "@litespace/auth";
import { invoices, lessons } from "@litespace/models";
import { IInvoice } from "@litespace/types";
import { NextFunction, Request, Response } from "express";
import safe from "express-async-handler";
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
  status: zod.optional(invoiceStatus),
  note: zod.optional(zod.union([zod.string(), zod.null()])),
});

const updateByReceiverPayload = zod.object({
  updateRequest: zod.optional(createPayload),
  cancel: zod.optional(zod.boolean()),
});

const findPayload = zod.object({ userId: zod.optional(id) });

async function stats(req: Request, res: Response, next: NextFunction) {
  const { tutorId } = withNamedId("tutorId").parse(req.params);
  const allowed = authorizer().admin().owner(tutorId).check(req.user);
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
  // only tutor can create invoices.
  const allowed = authorizer().tutor().check(req.user);
  if (!allowed) return next(forbidden());

  const payload: IInvoice.CreateApiPayload = createPayload.parse(req.body);
  const valid = await isValidInvoice({ payload, userId: req.user.id });
  if (!valid) return next(bad());

  const invoice = await invoices.create({
    userId: req.user.id,
    method: payload.method,
    receiver: payload.receiver,
    bank: payload.bank,
    amount: payload.amount,
  });

  res.status(200).json(invoice);
}

function updateByReceiver(context: ApiContext) {
  return safe(async (req: Request, res: Response, next: NextFunction) => {
    const allowed = authorizer().tutor().check(req.user);
    if (!allowed) return next(forbidden());

    const { invoiceId } = withNamedId("invoiceId").parse(req.params);
    const payload = updateByReceiverPayload.parse(req.body);

    const invoice = await invoices.findById(invoiceId);
    if (!invoice) return next(notfound.base());

    const owner = invoice.userId === req.user.id;
    if (!owner) return next(forbidden());

    // user cannot perform an update request and cancel the request at the same
    // time. Also cannot submit an empty request.
    const empty =
      isUndefined(payload.updateRequest) && isUndefined(payload.cancel);
    const full = !!payload.updateRequest && payload.cancel === true;
    const invalid = empty || full;
    if (invalid) return next(bad());

    const end = () => {
      context.io.emit("invoice-updated");
      res.status(200).json();
    };

    // only invoices in "pending" and "updated" status can be edited by the
    // tutor.
    const updatable = [
      IInvoice.Status.Pending,
      IInvoice.Status.UpdatedByReceiver,
    ].includes(invoice.status);
    if (!updatable) return next(bad());

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
  });
}

export function updateByAdmin(context: ApiContext) {
  return safe(async (req: Request, res: Response, next: NextFunction) => {
    const allowed = authorizer().admin().check(req.user);
    if (!allowed) return next(forbidden());

    const file = req.files?.attachment;
    const { invoiceId } = withNamedId("invoiceId").parse(req.params);
    const payload: IInvoice.UpdateByAdminApiPayload =
      updateByAdminPayload.parse(req.body);

    const invoice = await invoices.findById(invoiceId);
    if (!invoice) return next(notfound.base());

    const validStatus =
      !payload.status || payload.status !== IInvoice.Status.CanceledByReceiver;
    if (!validStatus) return next(bad());

    const attachment = file
      ? await uploadSingle(file, FileType.Image)
      : undefined;

    const approveUpdate =
      payload.status === IInvoice.Status.Pending &&
      invoice.status === IInvoice.Status.UpdatedByReceiver &&
      invoice.update;

    const amount = approveUpdate ? invoice.update?.amount : undefined;
    const method = approveUpdate ? invoice.update?.method : undefined;
    const bank = approveUpdate ? invoice.update?.bank : undefined;
    const receiver = approveUpdate ? invoice.update?.receiver : undefined;

    await invoices.update(invoice.id, {
      attachment,
      note: payload.note,
      status: payload.status,
      addressedBy: req.user.id,
      amount,
      method,
      bank,
      receiver,
      updateRequest: null, // reset the update request if any
    });

    res.status(200).json();
    context.io.emit("invocie-updated");
  });
}

async function find(req: Request, res: Response, next: NextFunction) {
  const allowed = authorizer().admin().tutor().check(req.user);
  if (!allowed) return next(forbidden());

  const { userId } = findPayload.parse(req.query);
  const { page, size } = pagination.parse(req.query);
  const role = req.user.role;
  const isTutor = tutor(role);
  const isAdmin = admin(role);
  const isPermissionedTutor = isTutor && userId && req.user.id === userId;
  const isPermissionedAdmin = isAdmin;
  const isPermissioned = isPermissionedAdmin || isPermissionedTutor;
  if (!isPermissioned) return next(forbidden());

  const { list, total } = userId
    ? await invoices.findByUser(userId, { page, size })
    : await invoices.find({ page, size });

  // attachement is a private field.
  const masked = isTutor
    ? list.map((invoice): IInvoice.Self => ({ ...invoice, attachment: null }))
    : list;

  const response: IInvoice.FindInvoicesApiResponse = {
    list: masked,
    total,
  };

  res.status(200).json(response);
}

export async function cancel(req: Request, res: Response, next: NextFunction) {
  const allowed = authorizer().tutor().check(req.user);
  if (!allowed) return next(forbidden());

  const { id: invoiceId } = withNamedId("id").parse(req.params);
  const invoice = await invoices.findById(invoiceId);
  if (!invoice) return next(notfound.base());

  if (invoice.userId !== req.user.id) return next(forbidden());

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
  create: safe(create),
  stats: safe(stats),
  find: safe(find),
  cancel: safe(cancel),
  updateByAdmin,
  updateByReceiver,
};
