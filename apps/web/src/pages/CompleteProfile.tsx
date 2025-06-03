import React from "react";
import Aside from "@/components/Auth/Common/Aside";
import Form from "@/components/CompleteProfile/Form";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import HorizontalLogo from "@/components/Common/HorizontalLogo";
import Description from "@/components/CompleteProfile/Description";

const Complete: React.FC = () => {
  const mq = useMediaQuery();

  return (
    <div className="flex flex-row justify-center gap-6 h-full p-6">
      <main className="flex-1 flex flex-col justify-center items-center gap-8 w-full max-w-[448px]">
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
