import {
  IAvailabilitySlot,
  IDemoSession,
  IInterview,
  ISession,
} from "@litespace/types";
import { concat, first, isEmpty } from "lodash";
import {
  availabilitySlots,
  demoSessions,
  interviews,
  lessons,
} from "@litespace/models";
import { asSubSlots, canBook, getSessionType } from "@litespace/utils";

// todo: impl: each tutor can have interview each 3 months.
export function canBeInterviewed(sessions: IInterview.Self[]): boolean {
  if (isEmpty(sessions)) return true;
  return false;
}

export async function canAccessSession({
  sessionId,
  userId,
}: {
  sessionId: ISession.Id;
  userId: number;
}) {
  const type = getSessionType(sessionId);

  if (type === "lesson") {
    const lesson = await lessons.findBySessionId(sessionId);
    if (!lesson) return false;

    const members = await lessons.findLessonMembers([lesson.id]);
    const isMember = members.find((member) => member.userId === userId);

    return isMember;
  }

  if (type === "interview") {
    const interview = await interviews.findOne({ sessions: [sessionId] });
    if (!interview) return false;

    const isMember =
      interview.interviewerId === userId || interview.intervieweeId === userId;

    return isMember;
  }

  if (type === "demo") {
    const demoSession = first(
      (await demoSessions.find({ sessionIds: [sessionId] })).list
    );

    if (!demoSession) return false;
    // @moehab TODO: refactor the model select function in order to perform
    // join queries correctly and use it instead of multiple queries.
    const slot = await availabilitySlots.findById(demoSession?.slotId);
    const isMember = demoSession.tutorId === userId || slot?.userId === userId;

    return isMember;
  }
}

export async function isBookable({
  slot,
  bookInfo,
}: {
  slot: IAvailabilitySlot.Slot;
  bookInfo: {
    start: string;
    duration: number;
  };
}): Promise<boolean> {
  const slotLessons = await lessons.find({
    slots: [slot.id],
    canceled: false,
    full: true,
  });

  const slotInterviews = await interviews.find({
    slots: [slot.id],
    canceled: false,
    full: true,
  });

  const slotDemoSessions = await demoSessions.find({
    slotIds: [slot.id],
    statuses: [IDemoSession.Status.Pending],
    full: true,
  });

  return canBook({
    slot,
    bookedSubslots: concat(
      asSubSlots(slotLessons.list),
      asSubSlots(slotInterviews.list),
      asSubSlots(slotDemoSessions.list)
    ),
    bookInfo,
  });
}
