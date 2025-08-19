import { Step } from "@/components/CompleteProfile/Stepper";
import Bio from "@/components/CompleteProfile/Steps/Bio";
import MainInfo from "@/components/CompleteProfile/Steps/MainInfo";
import Topics from "@/components/CompleteProfile/Steps/Topics";
import React, { useState } from "react";

const CompleteProfile: React.FC = () => {
  const [step, setStep] = useState<Step>("main-info");

  if (step === "main-info") return <MainInfo next={() => setStep("bio")} />;

  if (step === "bio") return <Bio />;

  return <Topics />;
};

export default CompleteProfile;
