import { bad, conflict, forbidden, notfound } from "@/lib/error";
import {
  datetime,
  id,
  jsonBoolean,
  pageNumber,
  pageSize,
} from "@/validation/utils";
import { isTutor, isTutorManager, isUser } from "@litespace/auth";
import { IAvailabilitySlot } from "@litespace/types";
import { availabilitySlots, knex } from "@litespace/models";
import dayjs from "@/lib/dayjs";
import { NextFunction, Request, Response } from "express";
import safeRequest from "express-async-handler";
import zod from "zod";
import { isEmpty } from "lodash";
import {
  deleteSlots,
  getSubslots,
  isConflictingSlots,
} from "@/lib/availabilitySlot";
import { MAX_FULL_FLAG_DAYS } from "@/constants";

const findPayload = zod.object({
  userId: id,
  after: datetime.optional(),
  before: datetime.optional(),
  page: pageNumber.optional(),
  size: pageSize.optional(),
  full: jsonBoolean.optional(),
});

const setPayload = zod.object({
  slots: zod.array(
    zod.union([
      zod.object({
        action: zod.literal("create"),
        start: datetime,
        end: datetime,
      }),
      zod.object({
        action: zod.literal("update"),
        id: id,
        start: datetime.optional(),
        end: datetime.optional(),
      }),
      zod.object({
        action: zod.literal("delete"),
        id: id,
      }),
    ])
  ),
});

async function find(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  if (!isUser(user)) return next(forbidden());

  const {
    userId,
    after,
    before,
    page,
    size,
    full,
  }: IAvailabilitySlot.FindAvailabilitySlotsApiQuery = findPayload.parse(
    req.query
  );

  const diff = dayjs(before).diff(after, "days");
  if (diff < 0) return next(bad());

  const canUseFullFlag =
    after &&
    before &&
    dayjs.utc(before).diff(after, "days") <= MAX_FULL_FLAG_DAYS;

  if (full && !canUseFullFlag) return next(bad());

  const paginatedSlots = await availabilitySlots.find({
    users: [userId],
    after,
    before,
    page,
    size,
    full,
  });

  // NOTE: return only-slots only if the user is a tutor
  const slotIds = paginatedSlots.list.map((slot) => slot.id);
  const subslots =
    isTutor(user) || isTutorManager(user)
      ? []
      : await getSubslots({
          slotIds,
          userId,
          after,
          before,
        });

  const result: IAvailabilitySlot.FindAvailabilitySlotsApiResponse = {
    slots: paginatedSlots,
    subslots,
  };

  res.status(200).json(result);
}

/**
 * This single endpoint is dedicated to create, update, and delete slots
 * This is because when the user is preparing his schedule, he can create,
 * delete, and update simultaneously.
 */
async function set(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isTutor(user) || isTutorManager(user);
  if (!allowed) return next(forbidden());

  const payload = setPayload.parse(req.body);

  const creates = payload.slots.filter(
    (slot) => slot.action === "create"
  ) as Array<IAvailabilitySlot.CreateAction>;
  const updates = payload.slots.filter(
    (slot) => slot.action === "update"
  ) as Array<IAvailabilitySlot.UpdateAction>;
  const deletes = payload.slots.filter(
    (slot) => slot.action === "delete"
  ) as Array<IAvailabilitySlot.DeleteAction>;

  const error = await knex.transaction(async (tx) => {
    const deleteIds = deletes.map((obj) => obj.id);
    const ids = [...deleteIds, ...updates.map((obj) => obj.id)];

    const allExist = await availabilitySlots.allExist(ids, tx);
    if (!allExist) return notfound.slot();

    const isOwner = await availabilitySlots.isOwner({
      slots: ids,
      owner: user.id,
      tx,
    });
    if (!isOwner) return forbidden();

    const conflicting = await isConflictingSlots({
      userId: user.id,
      creates,
      updates,
      deletes,
    });
    if (conflicting) return conflict();

    // delete slots
    await deleteSlots({
      currentUserId: user.id,
      ids: deleteIds,
      tx,
    });

    // update slots
    for (const update of updates) {
      await availabilitySlots.update(
        update.id,
        {
          start: update.start,
          end: update.end,
        },
        tx
      );
    }

    // create slots
    if (isEmpty(creates)) return;
    await availabilitySlots.create(
      creates.map(({ start, end }) => ({
        userId: user.id,
        start,
        end,
      })),
      tx
    );
  });

  if (error) return next(error);
  res.sendStatus(200);
}

export default {
  find: safeRequest(find),
  set: safeRequest(set),
};
