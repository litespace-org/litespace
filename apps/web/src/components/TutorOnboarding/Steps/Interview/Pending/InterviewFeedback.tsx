import { Element, IInterview } from "@litespace/types";
import { AvatarV2 } from "@litespace/ui/Avatar";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Textarea } from "@litespace/ui/Textarea";
import { Typography } from "@litespace/ui/Typography";

const InterviewFeedback: React.FC<{
  interview: Element<IInterview.FindApiResponse["list"]>;
}> = ({ interview }) => {
  const intl = useFormatMessage();

  if (!interview.interviewerFeedback && !interview.intervieweeFeedback)
    return null;

  return (
    <div>
      <Typography
        tag="h3"
        className="text-subtitle-2 font-bold text-natural-950 mb-2"
      >
        {intl("tutor-onboarding.step.interview.feedback.title")}
      </Typography>
      <div className="flex flex-col gap-2 mb-6">
        {interview.interviewerFeedback ? (
          <Feedback
            member={interview.interviewer}
            feedback={interview.interviewerFeedback}
          />
        ) : null}

        {interview.intervieweeFeedback ? (
          <Feedback
            member={interview.interviewee}
            feedback={interview.intervieweeFeedback}
          />
        ) : null}
      </div>
      {interview.intervieweeFeedback ? <SendFeedback /> : null}
    </div>
  );
};

const Feedback: React.FC<{
  member: IInterview.InterviewMember;
  feedback: string | null;
}> = ({ member, feedback }) => {
  return (
    <div className="max-w-[490px]">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 overflow-hidden rounded-full">
          <AvatarV2 id={member.id} alt={member.name} src={member.image} />
        </div>
        <Typography tag="h4" className="text-tiny font-bold text-natural-950">
          {member.name}
        </Typography>
      </div>
      <Typography tag="p" className="text-tiny font-medium text-natural-950">
        {feedback}
      </Typography>
    </div>
  );
};

const SendFeedback: React.FC = () => {
  const intl = useFormatMessage();

  return (
    <Textarea
      label={intl("tutor-onboarding.step.interview.feedback.comment")}
      placeholder={intl(
        "tutor-onboarding.step.interview.feedback.comment.placeholder"
      )}
    />
  );
};

export default InterviewFeedback;
