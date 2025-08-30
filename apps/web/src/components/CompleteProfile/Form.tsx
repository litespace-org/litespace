import { Step } from "@/components/CompleteProfile/Stepper";
import Bio from "@/components/CompleteProfile/Steps/Bio";
import MainInfo from "@/components/CompleteProfile/Steps/MainInfo";
import Topics from "@/components/CompleteProfile/Steps/Topics";
import { Web } from "@litespace/utils/routes";
import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";

const CompleteProfile: React.FC<{
  step: Step;
  setStep: (step: Step) => void;
}> = ({ step, setStep }) => {
  const navigate = useNavigate();

  const goRoot = useCallback(() => navigate(Web.Root), [navigate]);

  if (step === "main-info") return <MainInfo next={() => setStep("bio")} />;

  if (step === "bio") return <Bio next={() => setStep("fav-topics")} />;

  return <Topics next={goRoot} />;
};

export default CompleteProfile;
