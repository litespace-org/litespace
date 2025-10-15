import {
  IAvailabilitySlot,
  IDemoSession,
  IInterview,
  ISession,
} from "@litespace/types";
import { concat, isEmpty } from "lodash";
import { demoSessions, interviews, lessons } from "@litespace/models";
import { asSubSlots, canBook, getSessionType } from "@litespace/utils";
import s3 from "@/lib/s3";
import { environment } from "@/constants";

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
    if (isMember) return true;
  }

  if (type === "interview") {
    const interview = await interviews.findOne({ sessions: [sessionId] });
    if (!interview) return false;
    const isMember =
      interview.interviewerId === userId || interview.intervieweeId === userId;
    if (isMember) return true;
  }

  return false;
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

export async function getSessionMp4Files(
  sessionId: ISession.Id,
  signed?: boolean
): Promise<string[]> {
  const files = await s3.list(`sessions/${sessionId}`);
  const mp4 = files.filter((file) => file.endsWith(".mp4"));
  if (!signed) return mp4;
  return await Promise.all(mp4.map((file) => s3.get(file)));
}

export async function getSessionsMp4Files(
  ids: ISession.Id[],
  signed?: boolean
): Promise<Record<ISession.Id, string[]>> {
  if (environment === "local") return {};

  const map: Record<ISession.Id, string[]> = {};

  await Promise.all(
    ids.map(async (id) => {
      map[id] = await getSessionMp4Files(id, signed);
    })
  );

  return map;
}
