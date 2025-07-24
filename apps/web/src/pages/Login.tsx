import React, { lazy } from "react";

import Content from "@/components/Auth/Login/Content";
import { useMediaQuery } from "@litespace/headless/mediaQuery";

const Aside = lazy(() => import("@/components/Auth/Common/Aside"));

const Login: React.FC = () => {
  const mq = useMediaQuery();

  return (
    <div className="flex flex-row justify-center lg:justify-between xl:justify-center gap-32 h-full p-4 sm:p-6">
      <Content />
      {mq.lg ? <Aside /> : null}
    </div>
  );
};

export default Login;
