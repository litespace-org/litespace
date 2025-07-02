import React, { useState } from "react";
import Steps from "@/components/TutorOnboarding/Steps";
import Step from "@/components/TutorOnboarding/Step";
import { StepId } from "@/components/TutorOnboarding/types";

const Content: React.FC<{ selfId: number }> = ({ selfId }) => {
  const [step, setStep] = useState<StepId>("intro-video");

  return (
    <div className="flex flex-col lg:flex-row-reverse h-full">
      <Steps active={step} />
      <Step step={step} selfId={selfId} setStep={setStep} />
    </div>
  );
};

export default Content;
