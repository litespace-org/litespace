import MainInfo from "@/components/CompleteProfile/Steps/MainInfo";
import { Web } from "@litespace/utils/routes";
import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";

const CompleteProfile: React.FC = () => {
  const navigate = useNavigate();

  const goRoot = useCallback(() => navigate(Web.Tutors), [navigate]);

  return <MainInfo next={goRoot} />;
};

export default CompleteProfile;
