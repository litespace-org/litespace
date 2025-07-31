import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import dayjs from "@/lib/dayjs";
import Logo from "@litespace/assets/Logo";
import RecordCircle from "@litespace/assets/RecordCircle";
import Timer from "@litespace/assets/Timer";
import VideoClip from "@litespace/assets/VideoClip";
import { Void } from "@litespace/types";
import { Button } from "@litespace/ui/Button";
import { ConfirmationDialog } from "@litespace/ui/ConfirmationDialog";
import { Typography } from "@litespace/ui/Typography";
import { VideoPlayer } from "@litespace/ui/VideoPlayer";
import { useToast } from "@litespace/ui/Toast";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useCreateIntroVideo } from "@litespace/headless/introVideos";
import { useOnError } from "@/hooks/error";

type View = "pre-record" | "record" | "post-record";

export const Record: React.FC<{ onUploadSuccess: Void }> = ({
  onUploadSuccess,
}) => {
  const intl = useFormatMessage();
  const [view, setView] = useState<View>("pre-record");
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedSeconds, setRecordedSeconds] = useState<number>(0);

  return (
    <div className="w-full flex flex-col items-center pb-6 px-6">
      <div className="flex-1 flex flex-col gap-10 items-center mt-[60px] lg:w-[681px] mx-auto">
        <div className="flex gap-4">
          <Typography tag="h4" className="text-h4 text-brand-500 font-bold">
            {intl("labels.litespace")}
          </Typography>
          <Logo className="w-14 h-14" />
        </div>

        {view === "pre-record" ? (
          <PreRecord next={() => setView("record")} />
        ) : null}

        {view === "record" ? (
          <InRecord
            next={(blob: Blob, dur: number) => {
              setView("post-record");
              setRecordedBlob(blob);
              setRecordedSeconds(dur);
            }}
          />
        ) : null}

        {view === "post-record" && recordedBlob ? (
          <PostRecord
            prev={() => setView("record")}
            videoSrc={URL.createObjectURL(recordedBlob)}
            recordedBlob={recordedBlob}
            recordedSeconds={recordedSeconds}
            onUploadSuccess={onUploadSuccess}
          />
        ) : null}
      </div>
    </div>
  );
};

const PreRecord: React.FC<{ next: Void }> = ({ next }) => {
  const intl = useFormatMessage();

  return (
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
      <Button size="large" onClick={next}>
        <Typography tag="span">
          {intl("tutor-onboarding.steps.intro-video.start-recording")}
        </Typography>
      </Button>
    </div>
  );
};

const InRecord: React.FC<{ next: (b: Blob, dur: number) => void }> = ({
  next,
}) => {
  const intl = useFormatMessage();

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [seconds, setSeconds] = useState<number>(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);

  // ========== Recording Logic ===========
  const startRecording = useCallback(() => {
    if (!stream) return;
    const recorder = new MediaRecorder(stream);
    recorder.start();
    setRecorder(recorder);
  }, [setRecorder, stream]);

  const stopRecording = () => {
    if (!recorder) return;
    recorder.ondataavailable = (e) => next(e.data, seconds);
    recorder.stop();
    setRecorder(null);
  };

  // ========== Capturing Media Logic ===========
  useEffect(() => {
    if (!videoRef.current) return;
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: true,
      })
      .then((stream) => {
        setStream(stream);
        if (videoRef.current) videoRef.current.srcObject = stream;
      });
  }, [intl]);

  // ========== Timing Logic ===========
  useEffect(() => {
    if (recorder) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }

    if (!recorder && intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      setSeconds(0);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [recorder]);

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
    <div className="flex flex-col items-center">
      <div className="flex flex-col gap-2 items-center text-center max-w-[541px] mb-8">
        <Typography tag="h3" className="text-h3 text-natural-950 font-bold">
          {intl("tutor-onboarding.steps.intro-video.title")}
        </Typography>
        <Typography tag="p" className="text-body font-normal text-natural-700">
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
          ref={videoRef}
          className="w-full rounded-md overflow-hidden"
          style={{ transform: "scale(-1,1)" }}
          muted
          autoPlay
          playsInline
        />
      </div>

      {!recorder ? (
        <Button
          size="large"
          onClick={startRecording}
          startIcon={<RecordCircle className="icon" />}
          className="text-natura-50 text-body font-medium"
          disabled={!stream}
        >
          {intl("tutor-onboarding.steps.intro-video.start-recording.btn")}
        </Button>
      ) : null}

      {recorder ? (
        <Button
          size="large"
          type="error"
          onClick={stopRecording}
          startIcon={<RecordCircle className="icon" />}
          className="text-natura-50 text-body font-medium"
        >
          {intl("tutor-onboarding.steps.intro-video.stop-recording.btn")}
        </Button>
      ) : null}
    </div>
  );
};

const PostRecord: React.FC<{
  videoSrc: string;
  prev: Void;
  recordedBlob: Blob;
  recordedSeconds: number;
  onUploadSuccess: Void;
}> = ({ prev, videoSrc, recordedBlob, recordedSeconds, onUploadSuccess }) => {
  const intl = useFormatMessage();
  const toast = useToast();
  const [open, setOpen] = useState(false);

  const onError = useOnError({
    type: "mutation",
    handler: ({ messageId }) =>
      toast.error({
        title: intl("labels.file-upload-failed"),
        description: intl(messageId),
      }),
  });

  const { mutation, abort, progress } = useCreateIntroVideo({
    onSuccess: onUploadSuccess,
    onError,
  });

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col gap-2 items-center text-center max-w-[541px] mb-8">
        <Typography tag="h3" className="text-h3 text-natural-950 font-bold">
          {intl("tutor-onboarding.steps.intro-video.title")}
        </Typography>
        <Typography tag="p" className="text-body font-normal text-natural-700">
          {intl("tutor-onboarding.steps.intro-video.pre-recording.desc")}
        </Typography>
      </div>

      <VideoPlayer
        className="min-h-[405px] w-full max-w-[720px]"
        src={videoSrc}
      />

      <div className="mx-auto mt-8 flex flex-row [&>*]:flex-1 max-w-[270px] w-full items-center justify-center gap-2">
        <Button
          size="large"
          onClick={() =>
            mutation.mutate({
              duration: Math.floor(recordedSeconds / 60),
              video: recordedBlob,
            })
          }
        >
          {intl("tutor-onboarding.steps.intro-video.upload-video")}
        </Button>

        <Button
          size="large"
          variant="secondary"
          className="text-body font-medium text-brand-600"
          onClick={() => setOpen(true)}
        >
          {intl("labels.try-again")}
        </Button>
      </div>

      <ConfirmationDialog
        type="warning"
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
              setOpen(false);
              prev();
            },
          },
          secondary: {
            label: intl("labels.cancel"),
            onClick: () => setOpen(false),
          },
        }}
      />

      <ConfirmationDialog
        open={mutation.isPending}
        title={intl("onboarding.intro-video.confirmation-dialog.video-title")}
        progress={{
          label: intl("labels.upload.video"),
          value: progress,
        }}
        actions={{
          primary: {
            label: intl("labels.cancel"),
            onClick: () => abort(),
          },
        }}
        close={abort}
        closable={mutation.isPending}
        type={mutation.status === "error" ? "error" : "main"}
        icon={<VideoClip />}
      />
    </div>
  );
};
