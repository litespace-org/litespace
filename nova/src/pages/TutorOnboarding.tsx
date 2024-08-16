import React, { useMemo } from "react";
import { messages, Stepper } from "@litespace/luna";
import { useIntl } from "react-intl";
import {
  TUTUOR__ONBOARDING_MEDIA_STEP_ID,
  TUTUOR_ONBOARDING_INTERVIEW_STEP_ID,
  TUTUOR_ONBOARDING_PROFILE_STEP_ID,
} from "@/constants/user";
import TutorOnboardingSteps from "@/components/TutorOnboardingSteps";
import { useQuery } from "react-query";
import { atlas } from "@/lib/atlas";
import { useAppSelector } from "@/redux/store";
import { profileSelector } from "@/redux/user/me";

const TutorOnboarding: React.FC = () => {
  const intl = useIntl();
  const profile = useAppSelector(profileSelector);

  const steps = useMemo(() => {
    return [
      {
        label: intl.formatMessage({
          id: messages["page.tutor.onboarding.steps.first"],
        }),
        value: TUTUOR_ONBOARDING_INTERVIEW_STEP_ID,
      },
      {
        label: intl.formatMessage({
          id: messages["page.tutor.onboarding.steps.second"],
        }),
        value: TUTUOR__ONBOARDING_MEDIA_STEP_ID,
      },
      {
        label: intl.formatMessage({
          id: messages["page.tutor.onboarding.steps.third"],
        }),
        value: TUTUOR_ONBOARDING_PROFILE_STEP_ID,
      },
    ];
  }, [intl]);

  const interviews = useQuery({
    queryFn: async () => {
      if (!profile) return [];
      return await atlas.interview.findInterviews(profile.id);
    },
    enabled: !!profile,
  });

  return (
    <div className="max-w-screen-2xl px-8 mx-auto w-full py-12">
      <div className="mb-10">
        <Stepper steps={steps} value={TUTUOR__ONBOARDING_MEDIA_STEP_ID} />
      </div>

      <div>
        <TutorOnboardingSteps step={1} interviews={interviews} />
      </div>
    </div>
  );
};

export default TutorOnboarding;
