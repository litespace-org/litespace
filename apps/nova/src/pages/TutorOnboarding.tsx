import React, { useEffect, useMemo, useState } from "react";
import { Stepper } from "@litespace/luna/Stepper";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { TutorOnboardingStep } from "@/constants/user";
import { useNavigate } from "react-router-dom";
import { Route } from "@/types/routes";
import { IInterview } from "@litespace/types";
import { maxBy } from "lodash";
import dayjs from "@/lib/dayjs";
import { useFindInfinitInterviews } from "@litespace/headless/interviews";
import { useUser } from "@litespace/headless/context/user";

const TutorOnboarding: React.FC = () => {
  const intl = useFormatMessage();
  const { user, meta } = useUser();
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(-1);

  const steps = useMemo(() => {
    return [
      {
        label: intl("page.tutor.onboarding.steps.first"),
        value: TutorOnboardingStep.Interview,
      },
      {
        label: intl("page.tutor.onboarding.steps.second"),
        value: TutorOnboardingStep.Media,
      },
      {
        label: intl("page.tutor.onboarding.steps.third"),
        value: TutorOnboardingStep.Profile,
      },
    ];
  }, [intl]);

  const interviews = useFindInfinitInterviews(user?.id);

  const current = useMemo(() => {
    if (!interviews.list) return null;
    const interview = maxBy(interviews.list, (item) =>
      dayjs(item.createdAt).unix()
    );
    return interview || null;
  }, [interviews.list]);

  useEffect(() => {
    const pending = current?.status === IInterview.Status.Pending;
    const passed = current?.status === IInterview.Status.Passed;
    const rejected = current?.status === IInterview.Status.Rejected;
    const canceled = current?.status === IInterview.Status.Canceled;
    const signed = !!current?.signer;

    if (
      interviews.list &&
      (!current || pending || rejected || canceled || !signed)
    )
      return setStep(TutorOnboardingStep.Interview);

    if (user && meta && (meta.video === null || user?.image === null))
      return setStep(TutorOnboardingStep.Media);

    if (meta && (meta.bio === null || meta.about === null))
      return setStep(TutorOnboardingStep.Profile);

    if (
      interviews.list &&
      current &&
      passed &&
      signed &&
      user &&
      meta &&
      meta.bio &&
      meta.about &&
      user.image &&
      meta.video
    )
      return navigate(Route.Root);
  }, [current, interviews.list, meta, navigate, user]);

  return (
    <div className="w-full px-8 py-12 mx-auto max-w-screen-2xl">
      <div className="mb-10">
        <Stepper steps={steps} value={step} />
      </div>

      {/* <div>
        <TutorOnboardingSteps
          step={step}
          interviews={interviews}
          current={current}
        />
      </div> */}
    </div>
  );
};

export default TutorOnboarding;
