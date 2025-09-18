import React, { lazy } from "react";

import Content from "@/components/Auth/Login/Content";
import { CacheKey } from "@/constants/cache";
import { cache } from "@/lib/cache";
import { useUser } from "@litespace/headless/context/user";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import { Web } from "@litespace/utils/routes";
import { Navigate } from "react-router-dom";
import { IUser } from "@litespace/types";

const Aside = lazy(() => import("@/components/Auth/Common/Aside"));

const Login: React.FC = () => {
  const mq = useMediaQuery();
  const { user } = useUser();
  const load = cache.load(CacheKey.AuthToken);

  if (load && user?.role === IUser.Role.Student)
    return <Navigate to={Web.StudentDashboard} />;
  if (
    load &&
    (user?.role === IUser.Role.Tutor || user?.role === IUser.Role.TutorManager)
  )
    return <Navigate to={Web.TutorDashboard} />;

  return (
    <div className="flex flex-row justify-center lg:justify-between xl:justify-center gap-32 h-full p-4 sm:p-6">
      <Content />
      {mq.lg ? <Aside /> : null}
    </div>
  );
};

export default Login;
