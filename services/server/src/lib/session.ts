import { unpackRules } from "@litespace/sol/rule";
import { IInterview, ILesson, IRule, Wss } from "@litespace/types";
import { concat, first, isEmpty } from "lodash";
import dayjs from "@/lib/dayjs";
import { platformConfig } from "@/constants";
import { interviews, lessons } from "@litespace/models";
import { asSessionId, getSessionType } from "@litespace/sol";

// todo: impl: each tutor can have interview each 3 months.
export function canBeInterviewed(sessions: IInterview.Self[]): boolean {
  if (isEmpty(sessions)) return true;
  return false;
}

export function canBook({
  rule,
  lessons = [],
  interviews = [],
  slot,
}: {
  rule: IRule.Self;
  lessons?: ILesson.Self[];
  interviews?: IInterview.Self[];
  slot: { start: string; duration: number };
}) {
  const start = dayjs.utc(slot.start).startOf("day");
  const end = start.add(1, "day");
  const lessonSlots: IRule.Slot[] = lessons.map((lesson) => ({
    ruleId: lesson.ruleId,
    start: lesson.start,
    duration: lesson.duration,
  }));
  const interviewSlots: IRule.Slot[] = interviews.map((interview) => ({
    ruleId: interview.ids.rule,
    start: interview.start,
    duration: platformConfig.interviewDuration,
  }));
  const unpackedRules = unpackRules({
    rules: [rule],
    slots: concat(lessonSlots, interviewSlots),
    start: start.toISOString(),
    end: end.toISOString(),
  });
  if (isEmpty(unpackedRules)) return false;

  const slotStart = dayjs.utc(slot.start);
  const slotEnd = slotStart.add(slot.duration, "minutes");

  /**
   * Check if the incoming slot can fit in one of the unpacked rules.
   */
  for (const unpackedRule of unpackedRules) {
    const after =
      slotStart.isSame(unpackedRule.start) ||
      slotStart.isAfter(unpackedRule.start);
    const before =
      slotEnd.isSame(unpackedRule.end) || slotEnd.isBefore(unpackedRule.end);
    const between = after && before;
    if (between) return true;
  }

  return false;
}

// todo: write tests
/**
 * this function has been written to clean up the wss session handler
 * by seperating this verbose details from the main logic code.
 */
export async function canJoinSessionAck({
  userId,
  sessionId,
}: {
  userId: number;
  sessionId: string;
}): Promise<Wss.AcknowledgePayload> {
  const sessionType = getSessionType(sessionId);

  if (sessionType === "lesson") {
    const lesson = await lessons.findBySessionId(asSessionId(sessionId));
    if (!lesson) return { code: Wss.AcknowledgeCode.LessonNotFound };

    const members = await lessons.findLessonMembers([lesson.id]);
    const member = members.find((member) => member.userId === userId);
    if (!member)
      return {
        code: Wss.AcknowledgeCode.Unallowed,
        message: "The user is not a member of the lesson.",
      };

    return { code: Wss.AcknowledgeCode.Ok };
  }

  const interview = await interviews.findBySessionId(asSessionId(sessionId));
  if (!interview) return { code: Wss.AcknowledgeCode.InterviewNotFound };

  const member =
    interview.ids.interviewer === userId ||
    interview.ids.interviewee === userId;
  if (!member)
    return {
      code: Wss.AcknowledgeCode.Unallowed,
      message: "The user is not a member of the lesson.",
    };

  return { code: Wss.AcknowledgeCode.Ok };
}
