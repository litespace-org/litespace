import React from "react";
import { VideoPlayer } from "@/components/VideoPlayer";
import { asFullAssetUrl } from "@/lib/backend";
import { orUndefined } from "@litespace/sol";

const Video: React.FC<{
  video?: string | null;
  name?: string | null;
}> = ({ video, name }) => {
  if (!video || !name) return;
  return (
    <div className="tw-aspect-[9/16]">
      <VideoPlayer src={orUndefined(asFullAssetUrl(video))} />
    </div>
  );
};

export default Video;
