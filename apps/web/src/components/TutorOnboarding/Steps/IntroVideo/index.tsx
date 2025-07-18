import Pending from "@/components/TutorOnboarding/Steps/IntroVideo/Pending";
import Record from "@/components/TutorOnboarding/Steps/IntroVideo/Record";
import Result from "@/components/TutorOnboarding/Steps/IntroVideo/Result";
import React, { useState } from "react";

type Status = "idle" | "pre-record" | "pending" | "rejected";

// const status: Status | null = null;

const IntroVideo: React.FC = () => {
  const [status, setStatus] = useState<Status>("idle");

  if (status === "pending") return <Pending />;
  if (status === "rejected") return <Result />;
  return <Record />;
};

export default IntroVideo;
