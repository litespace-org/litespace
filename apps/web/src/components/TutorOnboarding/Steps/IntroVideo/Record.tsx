import React, { useState } from "react";
import { Void } from "@litespace/types";
import { Button } from "@litespace/ui/Button";
import { useRecord } from "@/components/TutorOnboarding/Steps/IntroVideo/hooks";
import { Optional } from "@litespace/ui/Optional";
import { VideoPlayer } from "@litespace/ui/VideoPlayer";
// import { LogoHeader } from "./Idle";
import { Typography } from "@litespace/ui/Typography";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import Logo from "@litespace/assets/Logo";

export const LogoHeader = () => {
  const intl = useFormatMessage();

  return (
    <div className="flex gap-4">
      <Typography tag="h4" className="text-h4 text-brand-500 font-bold">
        {intl("labels.litespace")}
      </Typography>
      <Logo className="w-14 h-14" />
    </div>
  );
};

export const Record: React.FC<{ setStatus: (val: "pending") => void }> = ({
  setStatus,
}) => {
  const { record, state, videoRef, previewRef, starting, preview, upload } =
    useRecord();

  // console.log(state);

  const [initialized, setInitialized] = useState(false);

  return (
    <div className="w-full py-14 px-6 flex flex-col items-center">
      <Optional show={state === "idle" && !initialized}>
        <PreIdle initialize={() => setInitialized(true)} />
      </Optional>
      <Optional show={state === "idle" && initialized}>
        <Idle
          record={record}
          starting={starting}
          previewRef={previewRef}
          videoRef={videoRef}
        />
      </Optional>
      <Optional show={state === "recording"}>
        <Recording videoRef={videoRef} stop={preview} />
      </Optional>
      <Optional show={state === "preview"}>
        <Preview previewRef={previewRef} upload={upload} reset={record} />
      </Optional>
    </div>
  );
};

const PreIdle: React.FC<{ initialize: Void }> = ({ initialize }) => {
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
        <Button size="large" onClick={initialize}>
          <Typography tag="span" className="text ">
            {intl("tutor-onboarding.steps.intro-video.start-recording")}
          </Typography>
        </Button>
      </div>
    </div>
  );
};

const Idle: React.FC<{
  record: Void;
  starting: boolean;
  videoRef: React.RefObject<HTMLVideoElement>;
  previewRef: React.RefObject<HTMLVideoElement>;
}> = ({ record, starting, videoRef, previewRef }) => {
  const intl = useFormatMessage();

  return (
    <div className="flex flex-col gap-10 items-center">
      <LogoHeader />
      <div className="flex flex-col gap-2 items-center text-center">
        <Typography tag="h3" className="text-h3 text-natural-950 font-bold">
          {intl("tutor-onboarding.steps.intro-video.title")}
        </Typography>
        <Typography tag="p" className="text-body font-normal text-natural-700">
          {intl("tutor-onboarding.steps.intro-video.pre-recording.desc")}
        </Typography>
      </div>
      <div className="mt-8">
        <video
          muted
          autoPlay
          playsInline
          ref={videoRef}
          className="aspect-video rounded-md overflow-hidden"
          style={{ transform: "scale(-1,1)" }}
        />
        <VideoPlayer ref={previewRef} />
      </div>

      <Button onClick={record} loading={starting} disabled={starting}>
        Record
      </Button>
    </div>
  );
};

const Recording: React.FC<{
  videoRef: React.RefObject<HTMLVideoElement>;
  stop: Void;
}> = ({ videoRef, stop }) => {
  return (
    <div className="flex flex-col gap-3">
      <video
        muted
        autoPlay
        playsInline
        ref={videoRef}
        className="aspect-video rounded-md overflow-hidden"
        style={{ transform: "scale(-1,1)" }}
      />

      <div className="flex items-center justify-center">
        <Button onClick={stop} size="medium">
          Stop
        </Button>
      </div>
    </div>
  );
};

const Preview: React.FC<{
  previewRef: React.RefObject<HTMLVideoElement>;
  upload: Void;
  reset: Void;
}> = ({ previewRef, upload, reset }) => {
  return (
    <div className="flex flex-col gap-3">
      <VideoPlayer ref={previewRef} />
      <div className="flex flex-row items-center justify-center gap-3">
        <Button size="medium" onClick={upload}>
          Upload
        </Button>
        <Button size="medium" variant="secondary" onClick={reset}>
          Rest
        </Button>
      </div>
    </div>
  );
};

export default Record;
