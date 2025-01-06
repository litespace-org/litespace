import { availabilitySlots, interviews, lessons } from "@litespace/models";
import { Knex } from "knex";
import { isEmpty } from "lodash";

export async function deleteSlots({
  currentUserId,
  ids,
  tx,
}: {
  currentUserId: number;
  ids: number[];
  tx?: Knex.Transaction;
}): Promise<void> {
  if (isEmpty(ids)) return;

  const associatedLessons = await lessons.find({ slots: ids, tx });
  const associatedInterviews = await interviews.find({ slots: ids, tx });
  const associatesCount = associatedLessons.total + associatedInterviews.total;

  if (associatesCount <= 0) return await availabilitySlots.delete(ids, tx);

  await lessons.cancelBatch({
    ids: associatedLessons.list.map((l) => l.id),
    canceledBy: currentUserId,
    tx,
  });
  await interviews.cancel({
    ids: associatedInterviews.list.map((i) => i.ids.self),
    canceledBy: currentUserId,
    tx,
  });
  await availabilitySlots.markAsDeleted({ ids: ids, tx });
}
