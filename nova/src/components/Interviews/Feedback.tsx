import React from "react";
// todo: should be part of `luna`
import RawHtml from "../TutorOnboardingSteps/RawHtml";

const Feedback: React.FC<{ title: string; feedback: string }> = ({
  title,
  feedback,
}) => {
  return (
    <div className="border border-border-overlay rounded-md w-full">
      <p className="bg-surface-300 px-3 py-1.5">{title}</p>
      <div className="py-2 px-3">
        <RawHtml html={feedback} />
      </div>
    </div>
  );
};

export default Feedback;
