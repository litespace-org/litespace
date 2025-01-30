import { IInterview, ISession } from "@litespace/types";
import { isEmpty } from "lodash";
import { interviews, lessons } from "@litespace/models";
import { getSessionType } from "@litespace/utils";

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
    const interview = await interviews.findBySessionId(sessionId);
    if (!interview) return false;
    const isMember =
      interview.ids.interviewer === userId ||
      interview.ids.interviewee === userId;
    if (isMember) return true;
  }

  return false;
}
