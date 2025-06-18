import dayjs from "@/lib/dayjs";
import { interviews, users } from "@litespace/models";
import { IInterview, IKafka, IUser } from "@litespace/types";
import {
  AFRICA_CAIRO_TIMEZONE,
  INTERVIEW_DURATION,
  safePromise,
} from "@litespace/utils";
import {
  formatMorningMessage,
  formateImmediateReminderMessage,
  isValidInterviewMember,
} from "@/lib/interview";
import { send, msg } from "@/lib/message";
import { Interview, Reminder } from "@/types/interview";

async function getInterviewList(includeInterviewer?: boolean) {
  const now = dayjs.utc();
  /**
   * end range for the find function, if we includeInterviewer then it's immediate reminder
   * so we need to just get the interviews for the next 30 minutes.
   * if not then it's morning reminder so we get the whole day interviews.
   */
  const end = {
    lte: includeInterviewer
      ? now.add(INTERVIEW_DURATION, "minutes").toISOString()
      : now.endOf("day").toISOString(),
  };

  const { list: interviewsList } = await interviews.find({
    start: { gte: now.toISOString() },
    end,
    full: true,
    canceled: false,
  });

  return interviewsList;
}

async function getInterviewsMembers(
  interviewsList: IInterview.Self[],
  includeInterviewer?: boolean
) {
  const membersIds: number[] = [];
  for (const interview of interviewsList) {
    membersIds.push(interview.intervieweeId);
    if (includeInterviewer) membersIds.push(interview.interviewerId);
  }

  const { list: membersList } = await users.find({
    ids: membersIds,
  });
  return membersList;
}

async function asInterviewData(
  interviewsList: IInterview.Self[],
  membersList: IUser.Self[]
) {
  const result: Interview = [];
  for (const interview of interviewsList) {
    const members = membersList.filter((user) =>
      [interview.intervieweeId, interview.interviewerId].includes(user.id)
    );

    result.push({
      interview: interview,
      members,
    });
  }

  return result;
}

async function getInterviews(includeInterviewer?: boolean): Promise<Interview> {
  const interviewsList = await getInterviewList(includeInterviewer);
  const membersList = await getInterviewsMembers(
    interviewsList,
    includeInterviewer
  );

  return asInterviewData(interviewsList, membersList);
}

async function getMessageQueue(interviews: Interview, type: Reminder) {
  const whatsappMessages: Array<IKafka.ValueOf<"whatsapp">> = [];
  const telegramMessages: Array<IKafka.ValueOf<"telegram">> = [];

  for (const item of interviews) {
    const now = dayjs.utc();
    const start = dayjs.utc(item.interview.start);
    // skip interviews that are already started
    if (start.isBefore(now)) continue;

    const tz = start.tz(AFRICA_CAIRO_TIMEZONE);
    const message =
      type === "morning"
        ? formatMorningMessage(item.interview, tz.format("hh:mm A"))
        : formateImmediateReminderMessage(item.interview, tz.fromNow());

    for (const member of item.members) {
      if (!isValidInterviewMember(member)) continue;

      const notificationMethod = member.notificationMethod;

      if (notificationMethod === IUser.NotificationMethod.Whatsapp)
        whatsappMessages.push({ to: member.phone, message });

      if (notificationMethod === IUser.NotificationMethod.Telegram)
        telegramMessages.push({ to: member.phone, message });
    }
  }

  return { whatsappMessages, telegramMessages };
}

async function sendReminders(includeInterviewer: boolean, reminder: Reminder) {
  const interviews = await getInterviews(includeInterviewer);

  const { whatsappMessages, telegramMessages } = await getMessageQueue(
    interviews,
    reminder
  );

  await Promise.all([
    send("whatsapp", whatsappMessages),
    send("telegram", telegramMessages),
  ]);
}

/**
 * Reminder to the tutor at 8 am for his interivew
 */
async function startMorningReminder() {
  const result = await safePromise(sendReminders(false, "morning"));
  if (result instanceof Error)
    msg(
      `interivew morning reminders error: ${result.message}\n\n${result.stack}`
    );
}

/**
 * Reminder to both interview members just before the interview
 */
async function startImmediateReminder() {
  const result = await safePromise(sendReminders(true, "immediate"));
  if (result instanceof Error)
    msg(
      `interivew immediate reminders error: ${result.message}\n\n${result.stack}`
    );
}

export default {
  startMorningReminder,
  startImmediateReminder,
};
