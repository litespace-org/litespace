import React from "react";
import cn from "classnames";
import { Spinner } from "@/icons/Spinner";
import { AlertCircle, Pause, Play, Maximize, Minimize } from "react-feather";
import SoundController from "@/components/VideoPlayer/SoundController";
import Time from "@/components/VideoPlayer/Time";
import Speed from "@/components/VideoPlayer/Speed";
import { CONTAINER_ID, Status, useVideo } from "@/components/VideoPlayer/video";
import Progress from "@/components/VideoPlayer/Progress";
import Overlay from "@/components/VideoPlayer/Overlay";

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
        "tw-relative tw-w-full tw-h-full tw-flex tw-flex-col tw-flex-1 tw-rounded-md tw-overflow-hidden tw-@container"
      )}
    >
      <span
        data-loading={readyState <= 1 && status !== Status.Error}
        className="tw-hidden tw-absolute tw-top-1/2 tw-left-1/2 -tw-translate-x-1/2 -tw-translate-y-1/2 tw-z-[1] tw-text-white data-[loading=true]:tw-block"
      >
        <Spinner />
      </span>

      {status === Status.Loaded ? <Overlay onClick={togglePlay} /> : null}

      <div
        data-status={status}
        className={cn(
          "tw-opacity-0 tw-transition-opacity tw-duration-300 tw-ease-linear data-[status=loaded]:tw-opacity-100",
          "tw-flex-1 tw-h-full tw-w-full"
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
            "data-[ready=true]:tw-cursor-pointer tw-absolute tw-w-full tw-h-full tw-z-[3]"
          )}
        />

        <div
          id="player-controls"
          className={cn(
            "tw-flex tw-flex-col tw-gap-2 tw-absolute tw-bottom-0 tw-left-0 tw-z-[5] tw-w-full tw-pb-2"
          )}
        >
          <Progress
            set={setCurrentTime}
            current={currentTime}
            duration={duration}
          />
          <div className="tw-flex tw-flex-row-reverse tw-items-center tw-justify-between tw-gap-2 tw-text-white tw-px-2">
            <div className="tw-flex tw-flex-row-reverse tw-gap-2">
              <button
                className={cn(
                  "tw-flex tw-items-center tw-justify-center tw-h-[30px] tw-w-[30px] focus:tw-outline-none",
                  "focus:tw-ring-background-control tw-rounded-md focus:tw-ring-1 focus-visible:tw-border-foreground-muted focus-visible:tw-ring-background-control"
                )}
                onClick={togglePlay}
              >
                {paused ? (
                  <Play className="tw-w-4 tw-h-4 @lg:tw-w-5 @lg:tw-h-5" />
                ) : (
                  <Pause className="tw-w-4 tw-h-4 @lg:tw-w-5 @lg:tw-h-5" />
                )}
              </button>

              <SoundController
                toggle={toggleSound}
                setVolume={setVolume}
                volume={volume}
                muted={muted}
              />
            </div>

            <div className="tw-flex tw-items-center tw-justify-center tw-flex-row-reverse tw-gap-2 tw-flex-shrink-0">
              <Time total={duration} current={currentTime} />
              <Speed set={setPlaybackRate} rate={playbackRate} />
              <button
                onClick={toggleSize}
                className={cn(
                  "focus:tw-outline-none focus:tw-ring-background-control tw-rounded-md focus:tw-ring-1 focus-visible:tw-border-foreground-muted focus-visible:tw-ring-background-control"
                )}
              >
                {fullscreen ? (
                  <Minimize className="tw-w-5 tw-h-5" />
                ) : (
                  <Maximize className="tw-w-5 tw-h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        data-status={status}
        className={cn(
          "tw-absolute tw-inset-0 tw-w-full tw-h-full tw-flex tw-items-center tw-justify-center",
          "tw-opacity-0 -tw-z-[1] data-[status=error]:tw-opacity-100 data-[status=error]:tw-z-[2] tw-transition-opacity tw-duration-300"
        )}
      >
        <AlertCircle className="tw-w-9 tw-h-9" />
      </div>

      <span
        data-status={status}
        className={cn(
          "tw-opacity-100 tw-transition-opacity tw-duration-300 data-[status=loaded]:tw-opacity-0 data-[status=error]:tw-opacity-0",
          "tw-absolute tw-z-[1] tw-top-1/2 tw-left-1/2 -tw-translate-x-1/2 -tw-translate-y-1/2"
        )}
      >
        <Spinner className="tw-text-foreground" />
      </span>
    </div>
  );
};
