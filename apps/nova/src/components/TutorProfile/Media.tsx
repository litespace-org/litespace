import { UserOnlineStatus, OnlineStatus } from "@litespace/luna/OnlineStatus";
import { VideoPlayer } from "@litespace/luna/VideoPlayer";
import { orUndefined } from "@litespace/sol/utils";
import React from "react";

export const Image: React.FC<{
  image: string | null;
  status: UserOnlineStatus;
}> = ({ image, status }) => {
  if (!image) return null;
  return (
    <div className="relative w-56 h-56 rounded-full lg:w-72 lg:h-72 shrink-0">
      <div className="w-full h-full overflow-hidden rounded-full shadow-xl ring ring-background-selection">
        <img
          src={orUndefined(image)}
          className="inline-block object-cover w-full h-full"
        />
      </div>
      <OnlineStatus
        status={status}
        className="w-4 h-4 bottom-2 left-12 lg:bottom-4 lg:w-5 lg:h-5"
      />
    </div>
  );
};

export const Video: React.FC<{ video: string | null }> = ({ video }) => {
  if (!video) return;
  return (
    <div className="aspect-[9/16] w-full">
      <VideoPlayer src={video} />
    </div>
  );
};
