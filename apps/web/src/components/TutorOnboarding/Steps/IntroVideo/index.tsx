import React from "react";
import Record from "@/components/TutorOnboarding/Steps/IntroVideo/Record";
import Pending from "@/components/TutorOnboarding/Steps/IntroVideo/Pending";
import Result from "@/components/TutorOnboarding/Steps/IntroVideo/Result";

type Status = "pending" | "rejected";

const status: Status | null = null;

const IntroVideo: React.FC = () => {
  if (status === "pending") return <Pending />;
  if (status === "rejected") return <Result />;
  return <Record />;
};

export default IntroVideo;
