import { TutorOnboardingStep } from "@/constants/user";
import React from "react";
import Interview from "@/components/TutorOnboardingSteps/Interview";
import MediaShot from "@/components/TutorOnboardingSteps/MediaShot";
import IntorduceYourself from "@/components/TutorOnboardingSteps/IntroduceYourself";
import { IInterview } from "@litespace/types";
import { UseQueryResult } from "react-query";

const TutorOnboardingSteps: React.FC<{
  step: number;
  interviews: UseQueryResult<IInterview.Self[], unknown>;
  currentInterview: IInterview.Self | null;
}> = ({ step, interviews, currentInterview }) => {
  if (step === TutorOnboardingStep.Interview)
    return (
      <Interview interviews={interviews} currentInterview={currentInterview} />
    );
  if (step === TutorOnboardingStep.Media) return <MediaShot />;
  if (step === TutorOnboardingStep.Profile) return <IntorduceYourself />;
  return null;
};

export default TutorOnboardingSteps;
