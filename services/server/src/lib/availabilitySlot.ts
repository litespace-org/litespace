import { availabilitySlots, interviews, lessons } from "@litespace/models";
import { asSubSlots } from "@litespace/sol";
import { IAvailabilitySlot } from "@litespace/types";
import { Knex } from "knex";
import { isEmpty } from "lodash";

export async function deleteSlots({
  currentUserId,
  ids,
  tx,
}: {
  currentUserId: number;
  ids: number[];
  tx: Knex.Transaction;
}): Promise<void> {
  if (isEmpty(ids)) return;

  const associatedLessons = await lessons.find({ slots: ids, tx });
  const associatedInterviews = await interviews.find({ slots: ids, tx });
  const associatesCount = associatedLessons.total + associatedInterviews.total;

  if (associatesCount <= 0) return await availabilitySlots.delete(ids, tx);

  await Promise.all([
    lessons.cancel({
      ids: associatedLessons.list.map((l) => l.id),
      canceledBy: currentUserId,
      tx,
    }),

    interviews.cancel({
      ids: associatedInterviews.list.map((i) => i.ids.self),
      canceledBy: currentUserId,
      tx,
    }),

    availabilitySlots.markAsDeleted({ ids: ids, tx }),
  ]);
}

export async function getSubslots({
  slotIds,
  userId,
  after,
  before,
}: {
  slotIds: number[];
  userId: number;
  after: string;
  before: string;
}): Promise<IAvailabilitySlot.SubSlot[]> {
  const paginatedLessons = await lessons.find({
    users: [userId],
    slots: slotIds,
    after,
    before,
  });

  const paginatedInterviews = await interviews.find({
    users: [userId],
    slots: slotIds,
  });

  return asSubSlots([...paginatedLessons.list, ...paginatedInterviews.list]);
}
