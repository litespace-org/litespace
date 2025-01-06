import { bad, conflict, forbidden, notfound } from "@/lib/error";
import { datetime, id, skippablePagination } from "@/validation/utils";
import { isTutor, isTutorManager, isUser } from "@litespace/auth";
import { IAvailabilitySlot } from "@litespace/types";
import {
  availabilitySlots,
  interviews,
  knex,
  lessons,
} from "@litespace/models";
import dayjs from "@/lib/dayjs";
import { NextFunction, Request, Response } from "express";
import safeRequest from "express-async-handler";
import { asSubSlots, isIntersecting } from "@litespace/sol";
import zod from "zod";
import { isEmpty } from "lodash";
import { deleteSlots } from "@/lib/availabilitySlot";

const findPayload = zod.object({
  userId: id,
  after: datetime,
  before: datetime,
  slotsOnly: zod.boolean().optional().default(false),
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

  const { userId, after, before, slotsOnly, pagination } = findPayload.parse(
    req.query
  );

  const diff = dayjs(before).diff(after, "days");
  if (diff < 0) return next(bad());
  const canUseFullFlag =
    after && before && dayjs.utc(before).diff(after, "days") <= 30;

  const paginatedSlots = await availabilitySlots.find({
    users: [userId],
    after,
    before,
    pagination: {
      page: pagination?.page || 1,
      size: pagination?.size || 10,
      full: pagination?.full || !!canUseFullFlag,
    },
  });

  // return only-slots only if the user is a tutor
  if (slotsOnly && (isTutor(user.role) || isTutorManager(user.role))) {
    const result = {
      list: [{ slots: paginatedSlots.list, subslots: [] }],
      total: paginatedSlots.total,
    };
    res.status(200).json(result);
    return;
  }

  const slotIds = paginatedSlots.list.map((slot) => slot.id);

  const paginatedLessons = await lessons.find({
    users: [userId],
    slots: slotIds,
    after,
    before,
  });

  const userInterviews = await interviews.find({
    users: [userId],
    slots: slotIds,
  });

  const result: IAvailabilitySlot.FindAvailabilitySlotsApiResponse = {
    list: [
      {
        slots: paginatedSlots.list,
        subslots: asSubSlots([
          ...paginatedLessons.list,
          ...userInterviews.list,
        ]),
      },
    ],
    total: paginatedSlots.total,
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

    if (isEmpty(creates)) return;

    // check for confliction in creates list
    const mySlots = await availabilitySlots.find({
      users: [user.id],
      deleted: false,
    });
    const intersecting = creates.find((create) =>
      isIntersecting(
        {
          id: 0,
          start: create.start,
          end: create.end,
        },
        mySlots.list
      )
    );
    if (intersecting) return conflict();

    // create slots
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
