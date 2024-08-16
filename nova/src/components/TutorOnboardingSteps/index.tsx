import {
  TUTUOR__ONBOARDING_MEDIA_STEP_ID,
  TUTUOR_ONBOARDING_INTERVIEW_STEP_ID,
} from "@/constants/user";
import React from "react";
import Interview from "@/components/TutorOnboardingSteps/Interview";
import MediaShot from "@/components/TutorOnboardingSteps/MediaShot";
import IntorduceYourself from "@/components/TutorOnboardingSteps/IntroduceYourself";
import { IInterview } from "@litespace/types";
import { UseQueryResult } from "react-query";

const TutorOnboardingSteps: React.FC<{
  step: number;
  interviews: UseQueryResult<IInterview.Self[], unknown>;
}> = ({ step, interviews }) => {
  if (step === TUTUOR_ONBOARDING_INTERVIEW_STEP_ID)
    return <Interview interviews={interviews} />;

  if (step === TUTUOR__ONBOARDING_MEDIA_STEP_ID) return <MediaShot />;

  return <IntorduceYourself />;
};

export default TutorOnboardingSteps;
