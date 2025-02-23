// TODO: convert this component to server component once the Typography task is done
"use client";

import React from "react";
import { useFormatMessage } from "@/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import Ellipse from "@/components/Ellipse";
import cn from "classnames";

const Hero: React.FC = () => {
  const intl = useFormatMessage();
  return (
    <div
      className={cn(
        "relative flex items-center justify-center gap-12 bg-brand-900 overflow-hidden",
        "pt-[136px] pb-[56px] sm:pt-[160px] sm:pb-[80px] md:pt-[204px] md:pb-[88px]"
      )}
    >
      <Ellipse className="flex flex-col items-center text-center gap-6 md:gap-12 px-4 md:px-0 z-20">
        <div className="mx-auto flex flex-col items-center text-center gap-10 max-w-[328px] sm:max-w-[770px] md:max-w-[1224px]">
          <Typography
            weight="bold"
            tag="h1"
            className="text-natural-50 text-[1.5rem] md:text-[3rem]"
          >
            {intl("terms/hero/title")}
          </Typography>
          <Typography
            tag="p"
            weight="medium"
            className="text-natural-50 text-[1rem] md:text-[1.5rem] px-4 sm:px-8"
          >
            {intl("terms/hero/description")}
          </Typography>
        </div>
      </Ellipse>
    </div>
  );
};

export default Hero;
