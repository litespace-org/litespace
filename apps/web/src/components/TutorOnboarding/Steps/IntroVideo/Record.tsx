import React from "react";
import { Void } from "@litespace/types";
import { Button } from "@litespace/ui/Button";
import { useRecord } from "@/components/TutorOnboarding/Steps/IntroVideo/hooks";
import { Optional } from "@litespace/ui/Optional";
import { VideoPlayer } from "@litespace/ui/VideoPlayer";

export const Record: React.FC = () => {
  const { record, state, videoRef, previewRef, starting, preview, upload } =
    useRecord();

  return (
    <div className="w-full py-14 px-6 flex flex-col items-center">
      <Optional show={state === "idle"}>
        <Idle record={record} starting={starting} />
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

const Idle: React.FC<{ record: Void; starting: boolean }> = ({
  record,
  starting,
}) => {
  return (
    <div>
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
