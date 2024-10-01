import React from "react";
import { VideoPlayer } from "../VideoPlayer";
import { asFullAssetUrl } from "@/lib/atlas";

const Video: React.FC<{
  video?: string | null;
  name?: string | null;
}> = ({ video, name }) => {
  if (!video || !name) return;
  return (
    <div className="aspect-[9/16]">
      <VideoPlayer src={asFullAssetUrl(video)} />
    </div>
  );
};

export default Video;
