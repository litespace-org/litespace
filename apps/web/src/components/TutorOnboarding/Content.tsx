import React from "react";
import Steps from "@/components/TutorOnboarding/Steps";
import Step from "@/components/TutorOnboarding/Step";

const Content: React.FC<{ selfId: number }> = ({ selfId }) => {
  return (
    <div className="flex rtl:flex-row-reverse ltr:flex-row  h-full">
      <Steps active="demo-session" />
      <Step step="demo-session" selfId={selfId} />
    </div>
  );
};

export default Content;
