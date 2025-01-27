import { availabilitySlots, interviews, lessons } from "@litespace/models";
import {
  asSubSlot,
  asSubSlots,
  isIntersecting,
  isSuperSlot,
} from "@litespace/sol";
import { IAvailabilitySlot } from "@litespace/types";
import { Knex } from "knex";
import { isEmpty, uniqBy } from "lodash";
import dayjs from "@/lib/dayjs";

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
  const now = dayjs.utc();
  /**
   * Get "all (skip the pagination)" lessons that are not canceled and still in
   * the future (didn't happen yet).
   */
  const associatedLessons = await lessons.find({
    after: now.toISOString(),
    canceled: false,
    full: true,
    slots: ids,
    tx,
  });
  // TODO: extend `interviews.find` with `after`, `before`, and the `full` params.
  const associatedInterviews = await interviews.find({
    slots: ids,
    tx,
  });

  const associatesCount = associatedLessons.total + associatedInterviews.total;
  if (associatesCount <= 0) return await availabilitySlots.delete(ids, tx);

  await Promise.all([
    lessons.cancel({
      ids: associatedLessons.list.map((lesson) => lesson.id),
      canceledBy: currentUserId,
      tx,
    }),
    interviews.cancel({
      ids: associatedInterviews.list.map((lesson) => lesson.ids.self),
      canceledBy: currentUserId,
      tx,
    }),
    availabilitySlots.markAsDeleted({ ids: ids, tx }),
  ]);
}

export async function updateSlot({
  slot,
  userId,
  start,
  end,
  tx,
}: {
  userId: number;
  slot: IAvailabilitySlot.Self;
  start?: string;
  end?: string;
  tx: Knex.Transaction;
}): Promise<void> {
  const [updated] = asUpdateSlots([slot], [{ id: slot.id, start, end }]);

  // get slot associated subslots (lessons & interviews)
  const associatedLessons = await lessons.find({
    canceled: false,
    full: true,
    slots: [slot.id],
    tx,
  });

  const associatedInterviews = await interviews.find({
    slots: [slot.id],
    tx,
  });

  // check if the subslots will fit within the new slot dates (start & end)
  // and cancel the subslot that doesn't fit
  const toBeCancelledLessons = associatedLessons.list.filter(
    (lesson) => !isSuperSlot(updated, asSubSlot(lesson))
  );

  const toBeCancelledInterviews = associatedInterviews.list.filter(
    (interview) => !isSuperSlot(updated, asSubSlot(interview))
  );

  await Promise.all([
    lessons.cancel({
      ids: toBeCancelledLessons.map((lesson) => lesson.id),
      canceledBy: userId,
      tx,
    }),

    interviews.cancel({
      ids: toBeCancelledInterviews.map((interview) => interview.ids.self),
      canceledBy: userId,
      tx,
    }),

    // update the slot dates in the database
    availabilitySlots.update(slot.id, { start, end }, tx),
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
  after?: string;
  before?: string;
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

function asUpdateSlots(
  slots: IAvailabilitySlot.Self[],
  updates: Omit<IAvailabilitySlot.UpdateAction, "type">[]
) {
  return structuredClone(slots).map((slot) => {
    const update = updates.find((action) => action.id === slot.id);
    if (update?.start) slot.start = update.start;
    if (update?.end) slot.end = update.end;
    return slot;
  });
}

// TODO: unit tests are needed to test this function
/**
 * This function ensures that slots are not conflicting
 * and properly structured as well.
 */
export async function isValidSlots({
  userId,
  creates,
  updates,
  deletes,
}: {
  userId: number;
  creates: IAvailabilitySlot.CreateAction[];
  updates: IAvailabilitySlot.UpdateAction[];
  deletes: IAvailabilitySlot.DeleteAction[];
}): Promise<"conflict" | "malformed" | null> {
  const now = dayjs.utc();
  // Find "all" (hence `full=true`) user slots that are not deleted or about to
  // be deleted (hence why `execludeSlots`)
  // TODO: fetch only future slots @mmoehabb & @neuodev
  const userSlots = await availabilitySlots.find({
    users: [userId],
    deleted: false,
    execludeSlots: deletes.map((action) => action.id),
    full: true,
  });

  const updateIds = updates.map((action) => action.id);
  // Filter out the slots that are about to be updated
  const updatableSlots = userSlots.list.filter((slot) =>
    updateIds.includes(slot.id)
  );
  // Filter out the slots that are "ready only"
  const readOnlySlots = userSlots.list.filter(
    (slot) => !updateIds.includes(slot.id)
  );
  // Create a version of the updatable slots with the desired updates.
  const updatedSlots = asUpdateSlots(updatableSlots, updates);

  // validate the slots that are about to be created and the slots with the
  // applied updates.
  for (const slot of [...creates, ...updatedSlots]) {
    const start = dayjs.utc(slot.start);
    const end = dayjs.utc(slot.end);
    if (start.isAfter(end) || start.isSame(end) || start.isBefore(now))
      return "malformed";
  }

  // List of the final version of all user slots
  // 1. `readOnlySlots` -> all user slots the are not deleted or about to be
  //    updated.
  // 2. `creates` -> user slots that are about to be inserted in the
  //    database.
  // 3. `updatedSlots` -> in-memory slots with the desired updates (updates are
  //    applied)
  const allSlots = [...readOnlySlots, ...creates, ...updatedSlots];

  // All start and end dates must be unique.
  const starts = uniqBy(allSlots, (slot) => slot.start);
  const ends = uniqBy(allSlots, (slot) => slot.end);
  if (starts.length !== allSlots.length || ends.length !== allSlots.length)
    return "conflict";

  // Rule: each slot should not conflict with the other slots.
  for (const currentSlot of allSlots) {
    const otherSlots = allSlots.filter(
      (otherSlot) => otherSlot.start !== currentSlot.start
    );

    const intersecting = isIntersecting(
      { start: currentSlot.start, end: currentSlot.end },
      otherSlots
    );

    if (intersecting) return "conflict";
  }

  return null;
}
