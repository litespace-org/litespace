import {
  TUTUOR__ONBOARDING_MEDIA_STEP_ID,
  TUTUOR_ONBOARDING_INTERVIEW_STEP_ID,
} from "@/constants/user";
import React from "react";
import ScheduleInterview from "@/components/TutorOnboardingSteps/ScheduleInterview";
import MediaShot from "@/components/TutorOnboardingSteps/MediaShot";
import IntorduceYourself from "@/components/TutorOnboardingSteps/IntroduceYourself";

const TutorOnboardingSteps: React.FC<{ step: number }> = ({ step }) => {
  if (step === TUTUOR_ONBOARDING_INTERVIEW_STEP_ID)
    return <ScheduleInterview />;

  if (step === TUTUOR__ONBOARDING_MEDIA_STEP_ID) return <MediaShot />;

  return <IntorduceYourself />;
};

export default TutorOnboardingSteps;
