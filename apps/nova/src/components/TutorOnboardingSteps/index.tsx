import { TutorOnboardingStep } from "@/constants/user";
import React from "react";
import Interview from "@/components/TutorOnboardingSteps/Interview";
import MediaShot from "@/components/TutorOnboardingSteps/MediaShot";
import IntorduceYourself from "@/components/TutorOnboardingSteps/IntroduceYourself";
import { Element, IInterview } from "@litespace/types";
import { UseQueryResult } from "@tanstack/react-query";

const TutorOnboardingSteps: React.FC<{
  step: number;
  interviews: UseQueryResult<IInterview.FindInterviewsApiResponse, unknown>;
  current: Element<IInterview.FindInterviewsApiResponse["list"]> | null;
}> = ({ step, interviews, current }) => {
  if (step === TutorOnboardingStep.Interview)
    return <Interview interviews={interviews} current={current} />;
  if (step === TutorOnboardingStep.Media) return <MediaShot />;
  if (step === TutorOnboardingStep.Profile) return <IntorduceYourself />;
  return null;
};

export default TutorOnboardingSteps;
