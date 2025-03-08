import React from "react";
import { Typography } from "@litespace/ui/Typography";
import Ellipse from "@/components/Ellipse";
import { LocalId } from "@/locales/request";
import cn from "classnames";
import { useFormatMessage } from "@/hooks/intl";

const Hero: React.FC<{
  title: LocalId;
  description: LocalId;
}> = ({ title, description }) => {
  const intl = useFormatMessage();
  return (
    <div
      className={cn("bg-brand-900 pt-[72px] lg:pt-[80px] px-4 overflow-hidden")}
    >
      <Ellipse className="flex flex-col items-center text-center gap-6 md:gap-12 py-14 md:py-20 lg:py-[124px]">
        <div className="mx-auto flex flex-col items-center text-center gap-4 md:gap-10 max-w-[328px] sm:max-w-[770px] md:max-w-[808px]">
          <Typography
            tag="h1"
            className="text-natural-50 text-subtitle-1 sm:text-h2 font-bold"
          >
            {intl(title)}
          </Typography>
          <Typography
            tag="p"
            className={cn(
              "text-natural-50 text-body sm:text-subtitle-1 font-medium"
            )}
          >
            {intl(description)}
          </Typography>
        </div>
      </Ellipse>
    </div>
  );
};

export default Hero;
