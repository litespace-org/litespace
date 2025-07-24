import React, { lazy } from "react";
import Form from "@/components/CompleteProfile/Form";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import HorizontalLogo from "@/components/Common/HorizontalLogo";
import Description from "@/components/CompleteProfile/Description";

const Aside = lazy(() => import("@/components/Auth/Common/Aside"));

const Complete: React.FC = () => {
  const mq = useMediaQuery();

  return (
    <div className="flex flex-row justify-center lg:justify-between xl:justify-center gap-6 h-full p-6">
      <main className="flex flex-col justify-center items-center gap-8 w-full max-w-[496px] lg:p-6">
        <div className="flex flex-col gap-4 w-full items-center justify-center">
          <HorizontalLogo />
          <Description />
        </div>
        <Form />
      </main>
      {mq.lg ? <Aside /> : null}
    </div>
  );
};

export default Complete;
