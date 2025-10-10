import Video from "@litespace/assets/Video";
import { Void } from "@litespace/types";
import { Button } from "@litespace/ui/Button";
import { Dialog } from "@litespace/ui/Dialog";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import { VideoPlayer } from "@litespace/ui/VideoPlayer";
import React, { useMemo, useState } from "react";

const VideoListDialog: React.FC<{
  urls: string[];
  open?: boolean;
  close: Void;
}> = ({ urls, open, close }) => {
  const intl = useFormatMessage();
  const [videoIndex, setVideoIndex] = useState<number>(0);
  const videoUrl = useMemo(
    () => urls[videoIndex] || undefined,
    [urls, videoIndex]
  );

  return (
    <Dialog
      title={
        <div className="flex gap-2 items-center">
          <Video className="w-6 h-6 [&>*]:stroke-natural-950" />
          <Typography
            tag="span"
            className="text-subtitle-2 font-bold text-natural-950"
          >
            {intl("dashboard.lessons.files")}
          </Typography>
        </div>
      }
      className="w-[512px]"
      open={open}
      close={() => {
        close();
        setVideoIndex(0);
      }}
    >
      <div className="flex flex-col gap-4 mt-4">
        <VideoPlayer src={videoUrl} />
        <div className="flex flex-row items-center justify-start gap-2">
          <Button
            disabled={videoIndex <= 0}
            onClick={() => {
              const index = videoIndex <= 0 ? videoIndex : videoIndex - 1;
              setVideoIndex(index);
            }}
            variant="secondary"
            type="natural"
          >
            {intl("labels.prev")}
          </Button>
          <Button
            disabled={videoIndex >= urls.length - 1}
            onClick={() => {
              const index =
                videoIndex >= urls.length - 1 ? videoIndex : videoIndex + 1;
              setVideoIndex(index);
            }}
            variant="secondary"
            type="natural"
          >
            {intl("labels.next")}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default VideoListDialog;
