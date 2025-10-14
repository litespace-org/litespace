import { bad, conflictingSchedule, forbidden, notfound } from "@/lib/error/api";
import {
  datetime,
  id,
  ids,
  jsonBoolean,
  pageNumber,
  pageSize,
  role,
  slotPurpose,
} from "@/validation/utils";
import { isTutor, isUser } from "@litespace/utils/user";
import { IAvailabilitySlot } from "@litespace/types";
import { availabilitySlots, knex } from "@litespace/models";
import dayjs from "@/lib/dayjs";
import { NextFunction, Request, Response } from "express";
import safeRequest from "express-async-handler";
import zod, { ZodSchema } from "zod";
import { isEmpty } from "lodash";
import {
  deleteSlots,
  getSubslots,
  isValidSlots,
  updateSlot,
} from "@/lib/availabilitySlot";
import { MAX_FULL_FLAG_DAYS } from "@/constants";

const findQuery: ZodSchema<IAvailabilitySlot.FindAvailabilitySlotsApiQuery> =
  zod.object({
    userIds: ids.optional(),
    purposes: slotPurpose.array().optional(),
    roles: role.array().optional(),
    after: datetime.optional(),
    before: datetime.optional(),
    page: pageNumber.optional(),
    size: pageSize.optional(),
    full: jsonBoolean.optional(),
  });

const setPayload: ZodSchema<IAvailabilitySlot.SetAvailabilitySlotsApiPayload> =
  zod.object({
    actions: zod.array(
      zod.union([
        zod.object({
          type: zod.literal("create"),
          start: datetime,
          end: datetime,
          purpose: slotPurpose,
        }),
        zod.object({
          type: zod.literal("update"),
          id: id,
          start: datetime.optional(),
          end: datetime.optional(),
          purpose: slotPurpose.optional(),
        }),
        zod.object({
          type: zod.literal("delete"),
          id: id,
        }),
      ])
    ),
  });

async function find(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  if (!isUser(user)) return next(forbidden());

  const {
    userIds,
    roles,
    purposes,
    after,
    before,
    page,
    size,
    full,
  }: IAvailabilitySlot.FindAvailabilitySlotsApiQuery = findQuery.parse(
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
    userIds,
    roles,
    purposes,
    after,
    before,
    page,
    size,
    full,
    deleted: false,
  });

  // NOTE: return only-slots only if the user is a tutor
  const slotIds = paginatedSlots.list.map((slot) => slot.id);
  const bookedSlots = isTutor(user)
    ? []
    : await getSubslots({
        slotIds,
        userIds,
        after,
        before,
      });

  const result: IAvailabilitySlot.FindAvailabilitySlotsApiResponse = {
    slots: paginatedSlots,
    subslots: bookedSlots,
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
  const allowed = isTutor(user);
  if (!allowed) return next(forbidden());

  const payload: IAvailabilitySlot.SetAvailabilitySlotsApiPayload =
    setPayload.parse(req.body);

  const creates = payload.actions.filter(
    (slot) => slot.type === "create"
  ) as Array<IAvailabilitySlot.CreateAction>;
  const updates = payload.actions.filter(
    (slot) => slot.type === "update"
  ) as Array<IAvailabilitySlot.UpdateAction>;
  const deletes = payload.actions.filter(
    (slot) => slot.type === "delete"
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

    // Find "all" (hence `full=true`) user slots that are not deleted or about to
    // be deleted (hence why `execludeSlots`)
    const userSlots = await availabilitySlots.find({
      execludeSlots: deletes.map((action) => action.id),
      userIds: [user.id],
      start: { gt: dayjs().toISOString() },
      end: { gt: dayjs().toISOString() },
      deleted: false,
      full: true,
    });

    const updateIds = updates.map((update) => update.id);
    const updatableSlots = userSlots.list.filter((slot) =>
      updateIds.includes(slot.id)
    );
    /**
     * This can happen incase the user is trying to update a deleted slot.
     */
    if (updatableSlots.length !== updateIds.length) return notfound.slot();

    const isValid = await isValidSlots({
      userSlots: userSlots.list,
      creates,
      updates,
    });
    if (isValid === "malformed") return bad();
    if (isValid === "conflict") return conflictingSchedule();

    // delete slots
    await deleteSlots({
      userId: user.id,
      ids: deleteIds,
      tx,
    });

    // update slots
    await Promise.all(
      updates.map(async (updateAction) => {
        const slot = updatableSlots.find((slot) => slot.id === updateAction.id);
        if (!slot) return console.error("unreachable");
        await updateSlot({
          slot,
          userId: user.id,
          start: updateAction.start,
          end: updateAction.end,
          tx,
        });
      })
    );

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
