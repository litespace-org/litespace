import Content from "@/components/TutorOnboarding/Content";
import { useUser } from "@litespace/headless/context/user";
import React from "react";

const TutorOnboarding: React.FC = () => {
  const { user } = useUser();
  if (!user) return null;

  return (
    <div className="h-full w-full max-w-screen-3xl mx-auto">
      <Content selfId={user.id} />
    </div>
  );
};

export default TutorOnboarding;
