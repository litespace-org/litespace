import React, { useEffect, useMemo, useState } from "react";
import { Stepper } from "@litespace/luna/Stepper";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { TutorOnboardingStep } from "@/constants/user";
import TutorOnboardingSteps from "@/components/TutorOnboardingSteps";
import { useAppSelector } from "@/redux/store";
import { profileSelectors } from "@/redux/user/profile";
import { tutorMetaSelector } from "@/redux/user/tutor";
import { useNavigate } from "react-router-dom";
import { Route } from "@/types/routes";
import { IInterview } from "@litespace/types";
import { maxBy } from "lodash";
import dayjs from "@/lib/dayjs";
import { useFindInterviews } from "@litespace/headless/interviews";

const TutorOnboarding: React.FC = () => {
  const intl = useFormatMessage();
  const profile = useAppSelector(profileSelectors.user);
  const tutorMeta = useAppSelector(tutorMetaSelector);
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

  const interviews = useFindInterviews({ user: profile?.id, userOnly: true });

  const current = useMemo(() => {
    if (!interviews.list) return null;
    const interview = maxBy(interviews.list, (item) =>
      dayjs(item.interview.createdAt).unix()
    );
    return interview || null;
  }, [interviews.list]);

  useEffect(() => {
    const pending = current?.interview.status === IInterview.Status.Pending;
    const passed = current?.interview.status === IInterview.Status.Passed;
    const rejected = current?.interview.status === IInterview.Status.Rejected;
    const canceled = current?.interview.status === IInterview.Status.Canceled;
    const signed = !!current?.interview.signer;

    if (
      interviews.list &&
      (!current || pending || rejected || canceled || !signed)
    )
      return setStep(TutorOnboardingStep.Interview);

    if (
      profile &&
      tutorMeta &&
      (tutorMeta.video === null || profile?.image === null)
    )
      return setStep(TutorOnboardingStep.Media);

    if (tutorMeta && (tutorMeta.bio === null || tutorMeta.about === null))
      return setStep(TutorOnboardingStep.Profile);

    if (
      interviews.list &&
      current &&
      passed &&
      signed &&
      profile &&
      tutorMeta &&
      tutorMeta.bio &&
      tutorMeta.about &&
      profile.image &&
      tutorMeta.video
    )
      return navigate(Route.Root);
  }, [current, interviews.list, navigate, profile, tutorMeta]);

  return (
    <div className="w-full px-8 py-12 mx-auto max-w-screen-2xl">
      <div className="mb-10">
        <Stepper steps={steps} value={step} />
      </div>

      <div>
        <TutorOnboardingSteps
          step={step}
          interviews={interviews}
          current={current}
        />
      </div>
    </div>
  );
};

export default TutorOnboarding;
