import Logo from "@litespace/assets/Logo";
import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import React from "react";

const Idle: React.FC<{ setStatus: () => void }> = ({ setStatus }) => {
  const intl = useFormatMessage();

  return (
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
              {intl("tutor-onboarding.steps.intro-video.script-1")}
            </Typography>
            <Typography
              tag="p"
              className="text-body font-normal text-natural-700"
            >
              {intl("tutor-onboarding.steps.intro-video.script-2")}
            </Typography>
            <Typography
              tag="p"
              className="text-body font-normal text-natural-700"
            >
              {intl("tutor-onboarding.steps.intro-video.script-3")}
            </Typography>
          </div>
        </div>
        <Button size="large" onClick={setStatus}>
          <Typography tag="span" className="text ">
            {intl("tutor-onboarding.steps.intro-video.start-recording")}
          </Typography>
        </Button>
      </div>
    </div>
  );
};

export default Idle;
