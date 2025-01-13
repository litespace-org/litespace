import { bad, conflict, forbidden, notfound } from "@/lib/error";
import { datetime, id, skippablePagination } from "@/validation/utils";
import { isTutor, isTutorManager, isUser } from "@litespace/auth";
import { IAvailabilitySlot } from "@litespace/types";
import { availabilitySlots, knex } from "@litespace/models";
import dayjs from "@/lib/dayjs";
import { NextFunction, Request, Response } from "express";
import safeRequest from "express-async-handler";
import { isIntersecting } from "@litespace/sol";
import zod from "zod";
import { isEmpty } from "lodash";
import { deleteSlots, getSubslots } from "@/lib/availabilitySlot";
import { MAX_FULL_FLAG_DAYS } from "@/constants";

const findPayload = zod.object({
  userId: id,
  after: datetime,
  before: datetime,
  pagination: skippablePagination.optional(),
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

  const { userId, after, before, pagination } = findPayload.parse(req.query);

  const diff = dayjs(before).diff(after, "days");
  if (diff < 0) return next(bad());

  const canUseFullFlag =
    after &&
    before &&
    dayjs.utc(before).diff(after, "days") <= MAX_FULL_FLAG_DAYS;

  if (pagination?.full && !canUseFullFlag) return next(bad());

  const paginatedSlots = await availabilitySlots.find({
    users: [userId],
    after,
    before,
    pagination,
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
    (obj) => obj.action === "create"
  ) as Array<IAvailabilitySlot.CreateAction>;
  const updates = payload.slots.filter(
    (obj) => obj.action === "update"
  ) as Array<IAvailabilitySlot.UpdateAction>;
  const deletes = payload.slots.filter(
    (obj) => obj.action === "delete"
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

    // validations for creates and updates
    const mySlots = await availabilitySlots.find({
      users: [user.id],
      deleted: false,
      tx,
    });

    for (const slot of [...creates, ...updates]) {
      const start = dayjs.utc(slot.start);
      const end = dayjs.utc(slot.end);
      // all updates and creates should be in the future
      if (start.isBefore(dayjs.utc())) {
        return next(bad());
      }
      // and the end date should be after the start
      if (end.isBefore(start) || end.isSame(start)) {
        return next(bad());
      }
      // check for confliction with existing slots
      if (!slot.start || !slot.end) continue;

      const intersecting = isIntersecting(
        {
          id: 0,
          start: slot.start,
          end: slot.end,
        },
        mySlots.list
      );

      if (intersecting) return next(conflict());
    }

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
