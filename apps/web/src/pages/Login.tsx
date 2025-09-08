import React, { lazy, useEffect } from "react";

import Content from "@/components/Auth/Login/Content";
import { CacheKey } from "@/constants/cache";
import { cache } from "@/lib/cache";
import { useUser } from "@litespace/headless/context/user";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import { Web } from "@litespace/utils/routes";
import { useNavigate } from "react-router-dom";
import { isStudent, isTutor } from "@litespace/utils";

const Aside = lazy(() => import("@/components/Auth/Common/Aside"));

const Login: React.FC = () => {
  const mq = useMediaQuery();
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const authToken = cache.load(CacheKey.AuthToken);
    if (!authToken) return;
    if (isStudent(user)) navigate(Web.StudentDashboard);
    if (isTutor(user)) navigate(Web.TutorDashboard);
  }, [user]);

  return (
    <div className="flex flex-row justify-center lg:justify-between xl:justify-center gap-32 h-full p-4 sm:p-6">
      <Content />
      {mq.lg ? <Aside /> : null}
    </div>
  );
};

export default Login;
