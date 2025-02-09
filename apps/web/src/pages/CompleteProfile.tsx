import { useFormatMessage } from "@litespace/ui/hooks/intl";
import React from "react";
import Header from "@/components/Auth/Header";
import { Typography } from "@litespace/ui/Typography";
import Aside from "@/components/Auth/Aside";
import Form from "@/components/CompleteProfile/Form";

const Complete: React.FC = () => {
  const intl = useFormatMessage();

  return (
    <div className="flex flex-row gap-8 h-full p-6">
      <main className="flex flex-col items-center flex-1 flex-shrink-0 w-full">
        <Header />
        <div className="flex-1 flex flex-col gap-6 justify-center w-full">
          <div className="flex flex-col gap-2 text-center max-w-[645px] mx-auto">
            <Typography
              element="h4"
              weight="semibold"
              className="text-natural-950"
            >
              {intl("complete-profile.title")}
            </Typography>
            <Typography
              element="body"
              weight="regular"
              className="text-natural-700"
            >
              {intl("complete-profile.description")}
            </Typography>
          </div>
          <Form />
        </div>
      </main>
      <Aside />
    </div>
  );
};

export default Complete;
