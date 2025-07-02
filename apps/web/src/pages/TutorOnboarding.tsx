import Content from "@/components/TutorOnboarding/Content";
import { router } from "@/lib/routes";
import { useUser } from "@litespace/headless/context/user";
import { IUser } from "@litespace/types";
import { Web } from "@litespace/utils/routes";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const TutorOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    if (user?.role !== IUser.Role.Tutor)
      navigate(router.web({ route: Web.Root }));
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="h-full w-full max-w-screen-3xl mx-auto">
      <Content selfId={user.id} />
    </div>
  );
};

export default TutorOnboarding;
