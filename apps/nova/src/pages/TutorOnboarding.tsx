import React, { useCallback, useEffect, useMemo, useState } from "react";
import { messages, Stepper, atlas } from "@litespace/luna";
import { useIntl } from "react-intl";
import { TutorOnboardingStep } from "@/constants/user";
import TutorOnboardingSteps from "@/components/TutorOnboardingSteps";
import { useQuery } from "@tanstack/react-query";
import { useAppSelector } from "@/redux/store";
import { profileSelectors } from "@/redux/user/profile";
import { selectCurrentInterview } from "@/lib/interview";
import { tutorMetaSelector } from "@/redux/user/tutor";
import { useNavigate } from "react-router-dom";
import { Route } from "@/types/routes";
import { IInterview } from "@litespace/types";

const TutorOnboarding: React.FC = () => {
  const intl = useIntl();
  const profile = useAppSelector(profileSelectors.user);
  const tutorMeta = useAppSelector(tutorMetaSelector);
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(-1);

  const steps = useMemo(() => {
    return [
      {
        label: intl.formatMessage({
          id: messages["page.tutor.onboarding.steps.first"],
        }),
        value: TutorOnboardingStep.Interview,
      },
      {
        label: intl.formatMessage({
          id: messages["page.tutor.onboarding.steps.second"],
        }),
        value: TutorOnboardingStep.Media,
      },
      {
        label: intl.formatMessage({
          id: messages["page.tutor.onboarding.steps.third"],
        }),
        value: TutorOnboardingStep.Profile,
      },
    ];
  }, [intl]);

  const findInterviews = useCallback(async () => {
    if (!profile) return { list: [], total: 0 };
    return await atlas.interview.findInterviews(profile.id);
  }, [profile]);

  const interviews = useQuery({
    queryFn: findInterviews,
    enabled: !!profile,
    queryKey: ["find-interviews"],
  });

  const currentInterview = useMemo(() => {
    if (!interviews.data) return null;
    return selectCurrentInterview(
      interviews.data.list.map((item) => item.interview)
    );
  }, [interviews.data]);

  useEffect(() => {
    const pending = currentInterview?.status === IInterview.Status.Pending;
    const passed = currentInterview?.status === IInterview.Status.Passed;
    const rejected = currentInterview?.status === IInterview.Status.Rejected;
    const canceled = currentInterview?.status === IInterview.Status.Canceled;
    const signed = !!currentInterview?.signer;

    if (
      interviews.data &&
      (!currentInterview || pending || rejected || canceled || !signed)
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
      interviews.data &&
      currentInterview &&
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
  }, [currentInterview, interviews.data, navigate, profile, tutorMeta]);

  return (
    <div className="max-w-screen-2xl px-8 mx-auto w-full py-12">
      <div className="mb-10">
        <Stepper steps={steps} value={step} />
      </div>

      <div>
        <TutorOnboardingSteps
          step={step}
          interviews={interviews}
          currentInterview={currentInterview}
        />
      </div>
    </div>
  );
};

export default TutorOnboarding;
