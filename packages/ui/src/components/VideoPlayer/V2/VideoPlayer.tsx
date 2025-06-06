import React from "react";
import { CONTAINER_ID, useVideo } from "@/components/VideoPlayer/V2/video";
import Play from "@litespace/assets/Play";
import Pause from "@litespace/assets/Pause";
import SettingsScrew from "@litespace/assets/SettingsScrew";
import ExclaimationMarkCircle from "@litespace/assets/ExclaimationMarkCircle";
import cn from "classnames";
import SettingsMenu from "@/components/VideoPlayer/V2/SettingsMenu";
import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks";
import { AudioController } from "@/components/VideoPlayer/V2/AudioController";
import { VideoProgressbar } from "@/components/VideoPlayer/V2/VideoProgressbar";
import { PlayButton } from "@/components/VideoPlayer/V2/PlayButton";
import { Loading } from "@/components/Loading";
import mergeRefs from "merge-refs";

type Props = React.VideoHTMLAttributes<HTMLVideoElement>;

export const VideoPlayer = React.forwardRef<HTMLVideoElement, Props>(
  ({ className, ...props }, ref) => {
    const intl = useFormatMessage();

    const {
      togglePlay,
      onTimeUpdate,
      setVolume,
      onCanPlay,
      onError,
      setPlaybackRate,
      videoRef,
      containerRef,
      paused,
      volume,
      muted,
      currentTime,
      duration,
      playbackRate,
      readyState,
      onProgress,
      buffered,
      status,
      progressRef,
      seekingHandlers,
    } = useVideo();

    return (
      <div
        id={CONTAINER_ID}
        ref={containerRef}
        className="relative w-full aspect-video rounded-lg overflow-hidden"
      >
        <video
          playsInline
          onProgress={onProgress}
          onCanPlay={onCanPlay}
          onError={onError}
          onTimeUpdate={onTimeUpdate}
          data-ready={readyState >= 2}
          onClick={togglePlay}
          muted={muted}
          ref={mergeRefs(videoRef, ref)}
          className={cn(
            "w-full h-full data-[ready=true]:cursor-pointer",
            className
          )}
          {...props}
        />

        {readyState > 1 && paused && currentTime === 0 ? (
          <div
            className={cn(
              "absolute top-0 w-full h-full",
              "flex justify-center items-center"
            )}
          >
            <PlayButton togglePlay={togglePlay} />
          </div>
        ) : null}
        {currentTime !== 0 ? (
          <div className="absolute bottom-0 left-0 w-full h-[56px] flex items-center justify-center py-2 px-4 gap-2">
            <div className="grow bg-background-video py-1 px-2 h-10 rounded flex items-center gap-4">
              <SettingsMenu
                setPlaybackSpeed={setPlaybackRate}
                playbackSpeed={playbackRate}
              >
                <SettingsScrew />
              </SettingsMenu>
              <AudioController setVolume={setVolume} volume={volume} />
              <VideoProgressbar
                currentTime={currentTime}
                duration={duration}
                progressRef={progressRef}
                buffered={buffered}
                seekingHandlers={seekingHandlers}
              />
            </div>

            <button
              onClick={togglePlay}
              className="w-16 h-10 bg-background-video flex justify-center items-center rounded"
            >
              {paused ? <Play className="w-4 h-[18px]" /> : <Pause />}
            </button>
          </div>
        ) : null}
        {status !== "error" ? (
          <span
            className={cn(
              readyState < 2 ? "opacity-100" : "opacity-0 hidden",
              "absolute z-[8] transition-opacity  duration-300 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            )}
          >
            <Loading size="medium" />
          </span>
        ) : null}
        {status === "error" ? (
          <div className="absolute top-0 h-full w-full bg-natural-700 flex justify-center items-center">
            <div className="flex flex-col items-center gap-4">
              <span className="w-12 h-12 p-1 overflow-hidden rounded-full bg-destructive-200 shadow-exclaimation-mark-video items-center justify-center flex">
                <ExclaimationMarkCircle />
              </span>
              <Typography
                tag="span"
                className="font-semibold text-center px-4 text-natural-50 text-tiny"
              >
                {intl("media.video.error")}
              </Typography>
            </div>
          </div>
        ) : null}
      </div>
    );
  }
);
