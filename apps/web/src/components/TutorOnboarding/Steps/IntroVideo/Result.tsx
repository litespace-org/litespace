import React from "react";
import { LogoHeader } from "@/components/TutorOnboarding/Steps/IntroVideo/Record";
import { Typography } from "@litespace/ui/Typography";
import { useFormatMessage } from "@litespace/ui/hooks/intl";

export const Result: React.FC = () => {
  const intl = useFormatMessage();

  return (
    <div>
      <div className="_flex-1 flex flex-col gap-10 items-center mt-[60px] w-[681px] mx-auto">
        <LogoHeader />
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

export default Result;
