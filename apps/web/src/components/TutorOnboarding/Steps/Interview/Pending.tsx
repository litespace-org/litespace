import React, { useMemo } from "react";
import Header from "@/components/TutorOnboarding/Steps/Interview/Header";
import { Element, IInterview, Void } from "@litespace/types";
import InterviewState from "@/components/TutorOnboarding/Steps/Interview/Pending/InterviewState";
import dayjs from "@/lib/dayjs";
import { INTERVIEW_DURATION } from "@litespace/utils";
import { State } from "@/components/TutorOnboarding/Steps/Interview/types";
import InterviewFeedback from "@/components/TutorOnboarding/Steps/Interview/Pending/InterviewFeedback";

const Pending: React.FC<{
  interview: Element<IInterview.FindApiResponse["list"]>;
  sync: Void;
  syncing: boolean;
}> = ({ interview, sync, syncing }) => {
  const state: State = useMemo(() => {
    const now = dayjs();
    if (now.isAfter(dayjs(interview.start).add(INTERVIEW_DURATION)))
      return "ended";

    return "in-progress";
  }, [interview]);

  return (
    <div className="w-full py-14 flex flex-col items-center gap-14">
      <Header />
      <InterviewState
        state={state}
        interview={interview}
        sync={sync}
        syncing={syncing}
      />
      <InterviewFeedback interview={interview} />
    </div>
  );
};

export default Pending;
