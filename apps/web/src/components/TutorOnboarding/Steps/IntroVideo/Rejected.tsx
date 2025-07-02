import React from "react";
import { Typography } from "@litespace/ui/Typography";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import Logo from "@litespace/assets/Logo";

export const Rejected: React.FC = () => {
  const intl = useFormatMessage();

  return (
    <div className="w-full flex flex-col items-center pb-6 px-6">
      <div className="_flex-1 flex flex-col gap-10 items-center mt-[60px] lg:w-[681px] mx-auto">
        <div className="flex gap-4">
          <Typography tag="h4" className="text-h4 text-brand-500 font-bold">
            {intl("labels.litespace")}
          </Typography>
          <Logo className="w-14 h-14" />
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Typography tag="h3" className="text-h3 font-bold text-natural-950">
              {intl("tutor-onboarding.steps.intro-video.title")}
            </Typography>
            <div className="flex flex-col gap-4">
              <Typography
                tag="p"
                className="text-body font-normal text-natural-700"
              >
                {intl("tutor-onboarding.steps.intro-video.rejected.desc")}
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rejected;
