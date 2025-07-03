import React, { useState } from "react";
import Record from "@/components/TutorOnboarding/Steps/IntroVideo/Record";
import Pending from "@/components/TutorOnboarding/Steps/IntroVideo/Pending";
import Result from "@/components/TutorOnboarding/Steps/IntroVideo/Result";
import Idle from "@/components/TutorOnboarding/Steps/IntroVideo/Idle";
import PreRecord from "@/components/TutorOnboarding/Steps/IntroVideo/PreRecord";

type Status = "idle" | "pre-record" | "pending" | "rejected";

// const status: Status | null = null;

const IntroVideo: React.FC = () => {
  const [status, setStatus] = useState<Status>("idle");

  if (status === "pending") return <Pending />;
  if (status === "rejected") return <Result />;
  return <Record setStatus={setStatus} />;
};

export default IntroVideo;
