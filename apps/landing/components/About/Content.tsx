import React from "react";
import { Typography } from "@litespace/ui/Typography";
import { useFormatMessage } from "@/hooks/intl";
import { Highlight } from "@/components/Common/Highlight";

const Content: React.FC = () => {
  const intl = useFormatMessage();
  return (
    <div className="px-4 pt-[100px] max-w-screen-lg mx-auto">
      <Typography
        tag="h1"
        className="font-bold text-subtitle-1 sm:text-h4 mb-6"
      >
        {intl("about/content/heading")}
      </Typography>
      <Typography tag="p" className="font-normal text-body sm:text-subtitle-1">
        <Highlight id="about/content/paragraph/1" />
      </Typography>

      <br />

      <Typography tag="p" className="font-normal text-body sm:text-subtitle-1">
        <Highlight id="about/content/paragraph/2" />
      </Typography>
    </div>
  );
};

export default Content;
