import {
  OnlineStatus,
  UserOnlineStatus,
  VideoPlayer,
  asFullAssetUrl,
} from "@litespace/luna";
import React from "react";

export const Image: React.FC<{
  image: string | null;
  status: UserOnlineStatus;
}> = ({ image, status }) => {
  if (!image) return null;
  return (
    <div className="relative rounded-full w-56 h-56 lg:w-72 lg:h-72 shrink-0">
      <div className="rounded-full overflow-hidden shadow-xl ring ring-background-selection w-full h-full">
        <img
          src={asFullAssetUrl(image)}
          className="inline-block object-cover w-full h-full"
        />
      </div>
      <OnlineStatus
        status={status}
        className="bottom-2 left-12 lg:bottom-4 w-4 h-4 lg:w-5 lg:h-5"
      />
    </div>
  );
};

export const Video: React.FC<{ video: string | null }> = ({ video }) => {
  if (!video) return;
  return (
    <div className="aspect-[9/16] w-full">
      <VideoPlayer src={asFullAssetUrl(video)} />
    </div>
  );
};
