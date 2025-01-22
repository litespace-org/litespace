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
import { Loader } from "@/components/Loading";
// import { useMediaQueries } from "@/hooks/media";

export const VideoPlayer: React.FC<{ src?: string }> = ({ src }) => {
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

  // const { md } = useMediaQueries();

  return (
    <div
      id={CONTAINER_ID}
      ref={containerRef}
      className="tw-w-full tw-aspect-video tw-relative tw-rounded-lg tw-overflow-hidden"
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
        ref={videoRef}
        src={src}
        className="tw-w-full tw-h-full data-[ready=true]:tw-cursor-pointer"
      />
      {readyState > 1 && paused && currentTime === 0 ? (
        <div className="tw-absolute tw-top-1/2 tw-left-1/2 -tw-translate-x-1/2 -tw-translate-y-1/2">
          <PlayButton togglePlay={togglePlay} />
        </div>
      ) : null}
      {currentTime !== 0 ? (
        <div className="tw-absolute tw-bottom-0 tw-left-0 tw-w-full tw-h-[56px] tw-flex tw-items-center tw-justify-center tw-py-2 tw-px-4 tw-gap-2">
          <div className="tw-grow tw-bg-background-video tw-py-1 tw-px-2 tw-h-10 tw-rounded tw-flex tw-items-center tw-gap-4">
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
            className="tw-w-16 tw-h-10 tw-bg-background-video tw-flex tw-justify-center tw-items-center tw-rounded"
          >
            {paused ? <Play /> : <Pause />}
          </button>
        </div>
      ) : null}
      {status !== "error" ? (
        <span
          className={cn(
            readyState < 2 ? "tw-opacity-100" : "tw-opacity-0 tw-hidden",
            "tw-absolute tw-z-[8] tw-transition-opacity  tw-duration-300 tw-top-1/2 tw-left-1/2 -tw-translate-x-1/2 -tw-translate-y-1/2"
          )}
        >
          <Loader size="medium" />
        </span>
      ) : null}
      {status === "error" ? (
        <div className="tw-absolute tw-top-0 tw-h-full tw-w-full tw-bg-natural-700 tw-flex tw-justify-center tw-items-center">
          <div className="tw-flex tw-flex-col tw-items-center tw-gap-4">
            <span className="tw-w-12 tw-h-12 tw-p-1 tw-overflow-hidden tw-rounded-full tw-bg-destructive-200 tw-shadow-exclaimation-mark-video tw-items-center tw-justify-center tw-flex">
              <ExclaimationMarkCircle />
            </span>
            <Typography
              element="tiny-text"
              className="tw-font-semibold tw-text-natural-50"
            >
              {intl("media.video.error")}
            </Typography>
          </div>
        </div>
      ) : null}
    </div>
  );
};
