import React from "react";
import { LogoHeader } from "@/components/TutorOnboarding/Steps/IntroVideo/Idle";
import { Typography } from "@litespace/ui/Typography";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { VideoPlayer } from "@litespace/ui/VideoPlayer";
import { useRecord } from "@/components/TutorOnboarding/Steps/IntroVideo/hooks";

const PreRecord: React.FC<{ setStatus: () => void }> = ({ setStatus }) => {
  const intl = useFormatMessage();

  const { videoRef } = useRecord();

  return (
    <div className="flex-1 flex flex-col items-center gap-10 mt-[60px]">
      <LogoHeader />
      <div className="flex flex-col gap-2 items-center text-center">
        <div className="flex flex-col gap-2">
          <Typography tag="h3" className="text-h3 font-bold text-natural-950">
            {intl("tutor-onboarding.steps.intro-video.title")}
          </Typography>
          <Typography
            tag="p"
            className="text-body font-normal text-natural-700"
          >
            {intl("tutor-onboarding.steps.intro-video.pre-recording.desc")}
          </Typography>
        </div>
        <VideoPlayer ref={videoRef} />
        <video
          muted
          autoPlay
          playsInline
          ref={videoRef}
          className="aspect-video rounded-md overflow-hidden"
          style={{ transform: "scale(-1,1)" }}
        />
      </div>
    </div>
  );
};

export default PreRecord;
