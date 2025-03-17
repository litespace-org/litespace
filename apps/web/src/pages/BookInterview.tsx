import TutorInfo from "@/components/BookInterview/TutorInfo";
import { useUserContext } from "@litespace/headless/context/user";
import { Steps } from "@litespace/ui/TutorOnboarding";
import { orNull, orUndefined } from "@litespace/utils";
import { useCallback, useEffect, useState } from "react";
import { useFindInfinitInterviews } from "@litespace/headless/interviews";

const BookInterview = () => {
  const [step, setStep] = useState<number>(1);
  const { meta, user, refetch } = useUserContext();

  const goNext = useCallback(() => {
    setStep((prev) => prev + 1);
    refetch.meta();
  }, [refetch]);

  const pastInterviews = useFindInfinitInterviews(user?.id);

  useEffect(() => {}, []);

  return (
    <div className="grid grid-cols-[60%,40%] h-full">
      <div>
        {step === 1 ? (
          <TutorInfo
            id={user?.id}
            tutorInfo={{
              bio: orNull(meta?.bio),
              about: orNull(meta?.about),
            }}
            goNext={goNext}
          />
        ) : null}
      </div>
      <Steps
        loading={pastInterviews.query.isPending}
        error={pastInterviews.query.isError}
        activeStep={step}
        tutorManager="Mostafa Kamar"
        previousInterviews={
          pastInterviews.list?.map((interview) => ({
            tutorManager: "Mostafa Kamar",
            date: interview.start,
            canceled: !!interview.canceledBy,
            canceledBy:
              interview.canceledBy === user?.id
                ? "canceled-by-you"
                : "canceled-by-tutor-manager",
            result: orUndefined(interview.feedback.interviewer),
          })) || []
        }
      />
    </div>
  );
};

export default BookInterview;
