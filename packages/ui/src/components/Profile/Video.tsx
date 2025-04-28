import React from "react";
import { VideoPlayer } from "@/components/VideoPlayer";
import { optional } from "@litespace/utils";

const Video: React.FC<{
  video?: string | null;
  name?: string | null;
}> = ({ video, name }) => {
  if (!video || !name) return;
  return (
    <div className="aspect-[9/16]">
      <VideoPlayer src={optional(video)} />
    </div>
  );
};

export default Video;
