import React from "react";
import VideoBar from "./VideoBar";
import { Void } from "@litespace/types";
import { PreCallUserPreview } from "./PreCallUserPreview";

export const InCallUserPreview: React.FC<{
  internetProblem?: boolean;
  fullScreen: {
    enabled: boolean;
    toggle: Void;
  };
  speech: {
    speaking: boolean;
    mic: boolean;
  };
  user: {
    id: number;
    imageUrl: string | null;
    name: string | null;
  };
  stream: MediaStream | null;
  camera: boolean;
}> = ({ internetProblem, fullScreen, speech, user, stream, camera }) => {
  return (
    <div className="tw-relative">
      <VideoBar
        internetProblem={internetProblem}
        fullScreen={fullScreen}
        speech={speech}
      />
      <PreCallUserPreview user={user} stream={stream} camera={camera} />
    </div>
  );
};
