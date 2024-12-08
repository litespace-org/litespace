import { TutorOnboardingStep } from "@/constants/user";
import React from "react";
import Interview from "@/components/TutorOnboardingSteps/Interview";
import MediaShot from "@/components/TutorOnboardingSteps/MediaShot";
import { Element, IInterview } from "@litespace/types";

const TutorOnboardingSteps: React.FC<{
  step: number;
  interviews: IInterview.FindPagedInterviewsProps;
  current: Element<IInterview.FindInterviewsApiResponse["list"]> | null;
}> = ({ step, interviews, current }) => {
  if (step === TutorOnboardingStep.Interview)
    return <Interview interviews={interviews} current={current} />;
  if (step === TutorOnboardingStep.Media) return <MediaShot />;
  if (step === TutorOnboardingStep.Profile) return "todo";
  return null;
};

export default TutorOnboardingSteps;
