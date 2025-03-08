import { useFormatMessage } from "@litespace/ui/hooks/intl";
import React from "react";
import Header from "@/components/Auth/Header";
import { Typography } from "@litespace/ui/Typography";
import Aside from "@/components/Auth/Aside";
import Form from "@/components/CompleteProfile/Form";
import { useMediaQuery } from "@litespace/headless/mediaQuery";

const Complete: React.FC = () => {
  const intl = useFormatMessage();
  const mq = useMediaQuery();

  return (
    <div className="flex flex-row gap-8 h-full p-6">
      <main className="flex flex-col gap-10 sm:gap-0 items-center flex-1 flex-shrink-0 w-full">
        <Header />
        <div className="flex-1 flex flex-col sm:justify-center gap-6 w-full">
          <div className="flex flex-col gap-2 items-start sm:items-center text-start sm:text-center max-w-[645px] sm:mx-auto">
            <Typography
              tag="h1"
              className="text-natural-950 font-bold sm:font-semibold text-subtitle-1 sm:text-h4"
            >
              {intl("complete-profile.title")}
            </Typography>
            <Typography
              tag="p"
              className="text-natural-700 font-semibold sm:font-normal text-tiny-text sm:text-body"
            >
              {intl("complete-profile.description")}
            </Typography>
          </div>
          <Form />
        </div>
      </main>
      {mq.lg ? <Aside /> : null}
    </div>
  );
};

export default Complete;
