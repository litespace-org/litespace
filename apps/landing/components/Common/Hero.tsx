import React from "react";
import { Typography } from "@litespace/ui/Typography";
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
      className={cn(
        "pt-32 pb-14 md:pt-[136px] md:pb-16 lg:pt-[186px] lg:pb-14 px-4 md:px-8 lg:max-w-screen-xl mx-auto overflow-hidden",
        "flex flex-col items-center text-center gap-4 lg:gap-10"
      )}
    >
      <Typography
        tag="h1"
        className="text-natural-950 text-subtitle-1 md:text-h2 font-bold"
      >
        {intl.rich(title, {
          highlight: (chunks) => (
            <Typography tag="span" className="text-brand-500">
              {chunks}
            </Typography>
          ),
        })}
      </Typography>
      <Typography
        tag="p"
        className={cn(
          "text-natural-700 text-body md:text-subtitle-2 lg:text-subtitle-1 font-medium md:font-semibold lg:font-medium"
        )}
      >
        {intl(description)}
      </Typography>
    </div>
  );
};

export default Hero;
