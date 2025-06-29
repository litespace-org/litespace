import { router } from "@/lib/routes";
import { useUpdateInterview } from "@litespace/headless/interviews";
import { Element, IInterview, Void } from "@litespace/types";
import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Web } from "@litespace/utils/routes";
import { Link } from "react-router-dom";
import { State } from "@/components/TutorOnboarding/Steps/Interview/types";
import { LocalId } from "@litespace/ui/locales";
import Card from "@/components/TutorOnboarding/Steps/Interview/Pending/ResultCard";
import dayjs from "dayjs";
import { INTERVIEW_DURATION } from "@litespace/utils";
import { useMemo } from "react";

const InterviewState: React.FC<{
  sync: Void;
  interview: Element<IInterview.FindApiResponse["list"]>;
  state: State;
  syncing: boolean;
}> = ({ sync, syncing, state, interview }) => {
  const intl = useFormatMessage();

  const { title, result, resultColor } = useMemo(
    () => destructureInterviewData(interview, state),
    [interview, state]
  );

  const update = useUpdateInterview({
    onSuccess() {
      sync();
    },
  });

  return (
    <Card
      title={intl(title)}
      result={intl(result)}
      end={dayjs(interview.start).add(INTERVIEW_DURATION).toISOString()}
      start={interview.start}
      interviewer={interview.interviewer}
      resultColor={resultColor}
      actions={
        state === "in-progress" ? (
          <InProgressActions
            interviewId={interview.id}
            loading={syncing || update.isPending}
            cancelInterview={() =>
              update.mutate({
                id: interview.id,
                status: IInterview.Status.CanceledByInterviewee,
              })
            }
          />
        ) : null
      }
    />
  );
};

const InProgressActions: React.FC<{
  interviewId: number;
  loading: boolean;
  cancelInterview: Void;
}> = ({ interviewId, loading, cancelInterview }) => {
  const intl = useFormatMessage();

  return (
    <div className="flex flex-row gap-4 mt-2 items-center justify-center">
      <Link
        to={router.web({ route: Web.Interview, id: interviewId })}
        tabIndex={-1}
        className="flex-1"
      >
        <Button disabled={loading} size="large" className="w-full">
          {intl("tutor-onboarding.step.interview.join")}{" "}
        </Button>
      </Link>
      <Button
        size="large"
        variant="secondary"
        className="flex-1"
        disabled={loading}
        loading={loading}
        onClick={cancelInterview}
      >
        {intl("tutor-onboarding.step.interview.cancel")}{" "}
      </Button>
    </div>
  );
};

function destructureInterviewData(
  interview: Element<IInterview.FindApiResponse["list"]>,
  state: State
) {
  const title: LocalId = getTitle(state);
  const result: LocalId = getResult(interview, state);
  const resultColor = getResultColor(interview, state);

  return { title, result, resultColor };
}

function getResultColor(
  interview: Element<IInterview.FindApiResponse["list"]>,
  state: State
): "warning" | "brand" | "natural" {
  if (state === "in-progress" || interview.status === IInterview.Status.Pending)
    return "warning";

  if (interview.status === IInterview.Status.Passed) return "brand";
  return "natural";
}

function getTitle(state: State) {
  if (state === "in-progress")
    return "tutor-onboarding.step.interview.title.in-progress";
  return "tutor-onboarding.step.interview.title.ended";
}

function getResult(
  interview: Element<IInterview.FindApiResponse["list"]>,
  state: State
) {
  if (state === "in-progress")
    return "tutor-onboarding.step.interview.state.in-progress";
  if (interview.status === IInterview.Status.Passed)
    return "tutor-onboarding.step.interview.state.accepted";
  if (interview.status === IInterview.Status.Rejected)
    return "tutor-onboarding.step.interview.state.rejected";
  if (interview.status === IInterview.Status.Pending)
    return "tutor-onboarding.step.interview.state.pending";
  if (interview.status === IInterview.Status.CanceledByInterviewee)
    return "tutor-onboarding.step.interview.state.canceled-by-interviewee";
  return "tutor-onboarding.step.interview.state.canceled-by-interviewer";
}

export default InterviewState;
