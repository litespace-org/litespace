import { useRecord } from "@/components/TutorOnboarding/Steps/IntroVideo/hooks";
import { Void } from "@litespace/types";
import { Button } from "@litespace/ui/Button";
import { Optional } from "@litespace/ui/Optional";
import { VideoPlayer } from "@litespace/ui/VideoPlayer";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Logo from "@litespace/assets/Logo";
import { Typography } from "@litespace/ui/Typography";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import RecordCircle from "@litespace/assets/RecordCircle";
import VideoClip from "@litespace/assets/VideoClip";
import Timer from "@litespace/assets/Timer";
import { ConfirmationDialog } from "@litespace/ui/ConfirmationDialog";
import { SECONDS_IN_MINUTE } from "@litespace/utils";
import dayjs from "@/lib/dayjs";

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

export const Record: React.FC = () => {
  const {
    capture,
    record,
    state,
    captureRef,
    recordingRef,
    previewRef,
    starting,
    preview,
    upload,
  } = useRecord();

  console.log({ state });

  return (
    <div className="w-full py-14 px-6 flex flex-col items-center">
      <Optional show={state === "idle"}>
        <Idle capture={capture} />
      </Optional>

      <Optional show={state === "capturing"}>
        <Capturing record={record} starting={starting} videoRef={captureRef} />
      </Optional>

      <Optional show={state === "recording"}>
        <Recording
          recordingRef={recordingRef}
          stop={preview}
          isRecording={state === "recording"}
        />
      </Optional>

      <Optional show={state === "preview"}>
        <Preview previewRef={previewRef} upload={upload} reset={capture} />
      </Optional>
    </div>
  );
};

const Idle: React.FC<{ capture: Void }> = ({ capture }) => {
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
        <Button size="large" onClick={capture}>
          <Typography tag="span" className="text ">
            {intl("tutor-onboarding.steps.intro-video.start-recording")}
          </Typography>
        </Button>
      </div>
    </div>
  );
};

const Capturing: React.FC<{
  record: Void;
  starting: boolean;
  videoRef: React.RefObject<HTMLVideoElement>;
}> = ({ record, starting, videoRef }) => {
  const intl = useFormatMessage();

  return (
    <div className="flex flex-col gap-10 items-center">
      <LogoHeader />
      <div className="flex flex-col items-center">
        <div className="flex flex-col gap-2 items-center text-center max-w-[541px] mb-8">
          <Typography tag="h3" className="text-h3 text-natural-950 font-bold">
            {intl("tutor-onboarding.steps.intro-video.title")}
          </Typography>
          <Typography
            tag="p"
            className="text-body font-normal text-natural-700"
          >
            {intl("tutor-onboarding.steps.intro-video.pre-recording.desc")}
          </Typography>
        </div>
        <div className="relative rounded-xl overflow-hidden h-[387px] max-w-[688px] w-full mb-6">
          <div className="flex gap-2 bg-natural-50 rounded-lg absolute top-4 left-4 p-[10px] z-10">
            <Timer className="w-6 h-6 [&>*]:stroke-natural-800" />
            <Typography
              tag="span"
              className="text-body font-medium text-natural-800"
            >
              00:00
            </Typography>
          </div>
          <video
            muted
            autoPlay
            playsInline
            ref={videoRef}
            className="w-full rounded-md overflow-hidden "
            style={{ transform: "scale(-1,1)" }}
          />
        </div>

        <Button
          size="large"
          onClick={record}
          loading={starting}
          disabled={starting}
          startIcon={<RecordCircle className="icon" />}
        >
          <Typography
            tag="span"
            className="text text-natura-50 text-body font-medium"
          >
            {intl("tutor-onboarding.steps.intro-video.start-recording.btn")}
          </Typography>
        </Button>
      </div>
    </div>
  );
};

const Recording: React.FC<{
  recordingRef: React.RefObject<HTMLVideoElement>;
  isRecording: boolean;
  stop: Void;
}> = ({ recordingRef, isRecording, stop }) => {
  const intl = useFormatMessage();
  const [running, setRunning] = useState<boolean>(false);
  const [seconds, setSeconds] = useState<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRecording) setRunning(true);
    else setRunning(false);
  }, [isRecording]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }

    if (!running && intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const formatTime = useMemo(
    () =>
      (totalSeconds: number): string => {
        const duration = dayjs.duration(totalSeconds, "seconds");

        const minutes = duration.minutes();
        const seconds = duration.seconds();

        const formattedMinutes = String(minutes).padStart(2, "0");
        const formattedSeconds = String(seconds).padStart(2, "0");

        return `${formattedMinutes}:${formattedSeconds}`;
      },
    []
  );

  return (
    <div className="flex flex-col items-center gap-10">
      <LogoHeader />
      <div className="flex flex-col items-center">
        <div className="flex flex-col gap-2 items-center text-center max-w-[541px] mb-8">
          <Typography tag="h3" className="text-h3 text-natural-950 font-bold">
            {intl("tutor-onboarding.steps.intro-video.title")}
          </Typography>
          <Typography
            tag="p"
            className="text-body font-normal text-natural-700"
          >
            {intl("tutor-onboarding.steps.intro-video.pre-recording.desc")}
          </Typography>
        </div>
        <div className="relative rounded-xl overflow-hidden h-[387px] max-w-[688px] w-full mb-6">
          <div className="flex gap-2 bg-natural-50 rounded-lg absolute top-4 left-4 p-[10px] z-10">
            <Timer className="w-6 h-6 [&>*]:stroke-natural-800" />
            <Typography
              tag="span"
              className="text-body font-medium text-natural-800"
            >
              {formatTime(seconds)}
            </Typography>
          </div>
          <video
            muted
            autoPlay
            playsInline
            ref={recordingRef}
            className="w-full rounded-md overflow-hidden "
            style={{ transform: "scale(-1,1)" }}
          />
        </div>

        <Button
          size="large"
          type="error"
          onClick={() => {
            stop();
            setRunning(false);
          }}
          // loading={starting}
          // disabled={starting}
          startIcon={<RecordCircle className="icon" />}
        >
          <Typography
            tag="span"
            className="text text-natura-50 text-body font-medium"
          >
            {intl("tutor-onboarding.steps.intro-video.stop-recording.btn")}
          </Typography>
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
  const intl = useFormatMessage();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 items-center text-center max-w-[541px] mb-8">
        <Typography tag="h3" className="text-h3 text-natural-950 font-bold">
          {intl("tutor-onboarding.steps.intro-video.title")}
        </Typography>
        <Typography tag="p" className="text-body font-normal text-natural-700">
          {intl("tutor-onboarding.steps.intro-video.pre-recording.desc")}
        </Typography>
      </div>
      <div className="relative rounded-xl overflow-hidden h-[387px] max-w-[688px] w-full mb-6">
        {/* <div className="flex gap-2 bg-natural-50 rounded-lg absolute top-4 left-4 p-[10px] z-10">
            <Timer className="w-6 h-6 [&>*]:stroke-natural-800" />
            <Typography
              tag="span"
              className="text-body font-medium text-natural-800"
            >
              {formatTime(seconds)}
            </Typography>
          </div> */}
        <VideoPlayer ref={previewRef} className="h-[387px] max-w-[688px]" />
      </div>
      <div className="mx-auto flex flex-row [&>*]:flex-1 max-w-[270px] w-full items-center justify-center gap-2">
        <Button size="large" onClick={upload}>
          <Typography tag="span" className="text">
            {intl("tutor-onboarding.steps.intro-video.upload-video")}
          </Typography>
        </Button>
        <Button size="large" variant="secondary" onClick={() => setOpen(true)}>
          <Typography
            tag="span"
            className="text text-body font-medium text-brand-600"
          >
            {intl("labels.try-again")}
          </Typography>
        </Button>
      </div>
      <ConfirmationDialog
        open={open}
        close={() => setOpen(false)}
        icon={<VideoClip className="[&>*]:stroke-warning-700" />}
        title={intl(
          "tutor-onboarding.steps.intro-video.retry-confirm-dialog.title"
        )}
        description={intl(
          "tutor-onboarding.steps.intro-video.retry-confirm-dialog.desc"
        )}
        actions={{
          primary: {
            label: intl("tutor-onboarding.steps.intro-video.re-recording"),
            onClick: () => {
              reset();
              setOpen(false);
            },
          },
          secondary: {
            label: intl("labels.cancel"),
            onClick: () => setOpen(false),
          },
        }}
      />
    </div>
  );
};

export default Record;
