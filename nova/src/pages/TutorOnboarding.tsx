import React, { useEffect, useMemo, useState } from "react";
import { messages, Stepper } from "@litespace/luna";
import { useIntl } from "react-intl";
import { TutorOnboardingStep } from "@/constants/user";
import TutorOnboardingSteps from "@/components/TutorOnboardingSteps";
import { useQuery } from "@tanstack/react-query";
import { atlas } from "@/lib/atlas";
import { useAppSelector } from "@/redux/store";
import { profileSelector } from "@/redux/user/me";
import { selectCurrentInterview } from "@/lib/interview";
import { tutorMetaSelector } from "@/redux/user/tutor";
import { useNavigate } from "react-router-dom";
import { Route } from "@/types/routes";

const TutorOnboarding: React.FC = () => {
  const intl = useIntl();
  const profile = useAppSelector(profileSelector);
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

  const interviews = useQuery({
    queryFn: async () => {
      if (!profile) return [];
      return await atlas.interview.findInterviews(profile.id);
    },
    enabled: !!profile,
    queryKey: ["find-interviews"],
  });

  const currentInterview = useMemo(() => {
    if (!interviews.data) return null;
    return selectCurrentInterview(interviews.data);
  }, [interviews.data]);

  useEffect(() => {
    if (
      interviews.data &&
      (!currentInterview ||
        currentInterview.approved == null ||
        currentInterview.passed === null)
    )
      return setStep(TutorOnboardingStep.Interview);

    if (
      profile &&
      tutorMeta &&
      (tutorMeta.video === null || profile?.photo === null)
    )
      return setStep(TutorOnboardingStep.Media);

    if (tutorMeta && (tutorMeta.bio === null || tutorMeta.about === null))
      return setStep(TutorOnboardingStep.Profile);

    if (
      interviews.data &&
      currentInterview &&
      currentInterview.passed &&
      currentInterview.approved &&
      profile &&
      tutorMeta &&
      tutorMeta.bio &&
      tutorMeta.about &&
      profile.photo &&
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
