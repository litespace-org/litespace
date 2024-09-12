import React from "react";
import cn from "classnames";
import Spinner from "@/icons/Spinner";
import { AlertCircle, Pause, Play, Maximize, Minimize } from "react-feather";
import SoundController from "@/components/VideoPlayer/SoundController";
import Time from "@/components/VideoPlayer/Time";
import Speed from "@/components/VideoPlayer/Speed";
import { CONTAINER_ID, useVideo } from "@/components/VideoPlayer/video";
import Progress from "@/components/VideoPlayer/Progress";
import Overlay from "./Overlay";

// l-1 => spinner
// l-2 => error
// l-3 => video
// l-4 => overlay
// l-5 => controls

export const VideoPlayer: React.FC<{ src?: string }> = ({ src }) => {
  const {
    togglePlay,
    onTimeUpdate,
    toggleSound,
    setVolume,
    onCanPlay,
    onError,
    setPlaybackRate,
    setCurrentTime,
    toggleSize,
    videoRef,
    containerRef,
    paused,
    volume,
    muted,
    currentTime,
    duration,
    status,
    playbackRate,
    readyState,
    fullscreen,
  } = useVideo();

  return (
    <div
      ref={containerRef}
      id={CONTAINER_ID}
      className={cn(
        "relative w-full h-full flex flex-col flex-1 rounded-md overflow-hidden"
      )}
    >
      <span
        data-loading={readyState <= 1}
        className="hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1] text-white data-[loading=true]:block"
      >
        <Spinner />
      </span>
      <Overlay onClick={togglePlay} />
      <div
        data-status={status}
        className={cn(
          "opacity-0 transition-opacity duration-300 ease-linear data-[status=loaded]:opacity-100",
          "flex-1 h-full w-full"
        )}
      >
        <video
          data-ready={readyState >= 2}
          src={src}
          playsInline
          onCanPlay={onCanPlay}
          onError={onError}
          onTimeUpdate={onTimeUpdate}
          ref={videoRef}
          onClick={togglePlay}
          className={cn(
            "data-[ready=true]:cursor-pointer absolute w-full h-full z-[3]"
          )}
        />

        <div
          id="player-controls"
          className={cn(
            "flex flex-col gap-2 absolute bottom-0 left-0 z-[5] w-full pb-2"
            // "bg-gradient-to-t from-gray-400 from-20% to-80% to-gray-100 "
          )}
        >
          <Progress
            set={setCurrentTime}
            current={currentTime}
            duration={duration}
          />
          <div className="flex flex-row-reverse items-center justify-between gap-4 text-white px-4">
            <div className="flex flex-row-reverse gap-2">
              <button
                className={cn(
                  "flex items-center justify-center h-[30px] w-[30px] focus:outline-none",
                  "focus:ring-background-control rounded-md focus:ring-1 focus-visible:border-foreground-muted focus-visible:ring-background-control"
                )}
                onClick={togglePlay}
              >
                {paused ? <Play /> : <Pause />}
              </button>

              <SoundController
                toggle={toggleSound}
                setVolume={setVolume}
                volume={volume}
                muted={muted}
              />
            </div>

            <div className="flex items-center justify-center flex-row-reverse gap-4">
              <Time total={duration} current={currentTime} />
              <Speed set={setPlaybackRate} rate={playbackRate} />
              <button
                onClick={toggleSize}
                className={cn(
                  "focus:outline-none focus:ring-background-control rounded-md focus:ring-1 focus-visible:border-foreground-muted focus-visible:ring-background-control"
                )}
              >
                {fullscreen ? <Minimize /> : <Maximize />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        data-status={status}
        className={cn(
          "absolute inset-0 w-full h-full flex items-center justify-center bg-destructive-300",
          "opacity-0 -z-[1] data-[status=error]:opacity-100 data-[status=error]:z-[2] transition-opacity duration-300"
        )}
      >
        <AlertCircle className="text-destructive-600" />
      </div>

      <span
        data-status={status}
        className={cn(
          "opacity-100 transition-opacity duration-300 data-[status=loaded]:opacity-0 data-[status=error]:opacity-0",
          "absolute z-[1] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        )}
      >
        <Spinner className="text-foreground" />
      </span>
    </div>
  );
};
