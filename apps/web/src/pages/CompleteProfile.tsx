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
      <main className="flex flex-col items-center flex-1 flex-shrink-0 w-full">
        <Header />
        <div className="flex-1 flex flex-col sm:gap-6 justify-start sm:justify-center w-full">
          <div className="flex flex-col gap-2 items-start my-10 sm:my-0 max-w-[645px] mx-auto">
            <Typography
              element={{
                default: "subtitle-1",
                sm: "h4",
              }}
              weight={{
                default: "bold",
                sm: "semibold",
              }}
              className="text-natural-950"
            >
              {intl("complete-profile.title")}
            </Typography>
            <Typography
              element={{
                default: "tiny-text",
                sm: "body",
              }}
              weight={{
                default: "semibold",
                sm: "regular",
              }}
              className="text-natural-700"
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
