import TutorInfo from "@/components/BookInterview/TutorInfo";
import { useUserContext } from "@litespace/headless/context/user";
import { Steps } from "@litespace/ui/TutorOnboarding";
import { orNull } from "@litespace/utils";
import { useCallback, useEffect, useState } from "react";
import { useFindInfinitInterviews } from "@litespace/headless/interviews";
import { useFindTutorInfo } from "@litespace/headless/tutor";
import { isEmpty } from "lodash";
import { IInterview } from "@litespace/types";
import { useNavigate } from "react-router-dom";
import { Web } from "@litespace/utils/routes";
import { isCanceledInterview } from "@/lib/interviews";

const BookInterview = () => {
  const [step, setStep] = useState<number>(1);
  const { user, refetch } = useUserContext();
  const navigate = useNavigate();

  const tutorInfo = useFindTutorInfo(orNull(user?.id));
  const pastInterviews = useFindInfinitInterviews({
    user: user?.id,
  });

  const goNext = useCallback(() => {
    setStep((prev) => prev + 1);
    refetch.meta();
    tutorInfo.refetch();
  }, [refetch, tutorInfo]);

  useEffect(() => {
    if (
      !tutorInfo.data?.bio &&
      !tutorInfo.data?.about &&
      !isEmpty(tutorInfo.data?.topics)
    )
      return setStep(1);

    const hasPassedInterview = !isEmpty(
      pastInterviews.list?.filter(
        (interview) => interview.status === IInterview.Status.Passed
      )
    );

    if (!hasPassedInterview) return setStep(2);

    if (!tutorInfo.data?.image && !tutorInfo.data?.video) return setStep(3);

    navigate(Web.TutorDashboard);
  }, [tutorInfo.data, pastInterviews.list, navigate]);

  return (
    <div className="grid grid-cols-[60%,40%] h-full">
      <div>
        {step === 1 ? (
          <TutorInfo
            tutorInfo={{
              id: user?.id,
              bio: orNull(tutorInfo.data?.bio),
              about: orNull(tutorInfo.data?.about),
            }}
            goNext={goNext}
          />
        ) : null}
        {step === 2 ? <div>Tutor Interview</div> : null}
        {step === 3 ? <div>Studio Selection</div> : null}
        {step === 4 ? <div>Finished</div> : null}
      </div>
      <Steps
        loading={pastInterviews.query.isPending}
        error={pastInterviews.query.isError}
        activeStep={step}
        // TODO
        tutorManager="Mostafa Kamar"
        more={pastInterviews.more}
        previousInterviews={pastInterviews.list?.map((interview) => ({
          tutorManager: interview.interviewer,
          date: interview.start,
          canceledBy: isCanceledInterview(interview.canceledBy, user?.id),
          feedback: interview.interviewer.feedback,
        }))}
      />
    </div>
  );
};

export default BookInterview;
