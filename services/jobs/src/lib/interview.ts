import { IInterview, IUser } from "@litespace/types";
import { router } from "@/lib/router";
import { Web } from "@litespace/utils/routes";
import { ValidInterviewMember } from "@/types/interview";

export function formatMorningMessage(
  interview: IInterview.Self,
  time: string
): string {
  const url = router.web({
    route: Web.Interview,
    id: interview.id,
    full: true,
  });

  return `Hi there!
Just a friendly reminder about your interview with LiteSpace today at ${time}.
Please be sure to join on time at this url:
${url}
If you run into any difficulties or need to cancel, please do so before the interview starts.
Keep in mind that failing to cancel beforehand will prevent you from booking any new interviews with us for the next three months.
We look forward to speaking with you!
`;
}

export function formateImmediateReminderMessage(
  interview: IInterview.Self,
  time: string
): string {
  const url = router.web({
    route: Web.Interview,
    id: interview.id,
    full: true,
  });

  return `Hi there! Your LiteSpace interview is starting ${time}. We're looking forward to speaking with you!.
  you can join using this url:
  ${url}
  `;
}

export function isValidInterviewMember(
  member: IUser.Self
): member is ValidInterviewMember {
  return (
    !!member.notificationMethod && !!member.phone && !!member.verifiedPhone
  );
}
