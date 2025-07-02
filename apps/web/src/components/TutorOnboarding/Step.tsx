import React from "react";
import { StepId } from "@/components/TutorOnboarding/types";
import IntroVideo from "@/components/TutorOnboarding/Steps/IntroVideo";
import Interview from "@/components/TutorOnboarding/Steps/Interview";
import DemoSession from "@/components/TutorOnboarding/Steps/DemoSession";
import PhotoSession from "@/components/TutorOnboarding/Steps/PhotoSession";

const Step: React.FC<{
  step: StepId;
  setStep: (s: StepId) => void;
  selfId: number;
}> = ({ step, setStep, selfId }) => {
  if (step === "intro-video")
    return <IntroVideo tutorId={selfId} next={() => setStep("interview")} />;

  if (step === "interview") return <Interview selfId={selfId} />;
  if (step === "demo-session") return <DemoSession />;
  if (step === "photo-session") return <PhotoSession />;

  throw new Error("unsupported step, should never happen");
};

export default Step;
