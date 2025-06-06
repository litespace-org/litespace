import React from "react";
import Steps from "@/components/TutorOnboarding/Steps";
import Step from "@/components/TutorOnboarding/Step";

const Content: React.FC = () => {
  return (
    <div className="flex rtl:flex-row-reverse ltr:flex-row  h-full">
      <Steps active="interview" />
      <Step step="interview" />
    </div>
  );
};

export default Content;
