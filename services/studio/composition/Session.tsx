import React, { useMemo } from "react";
import {
  AbsoluteFill,
  OffthreadVideo,
  Sequence,
  staticFile,
  useVideoConfig,
} from "remotion";
import zod from "zod";
import dayjs from "@/lib/dayjs";
import { compose, Layout, Video } from "@/lib/compose";
import { first } from "lodash";

const videoSchema = zod.object({
  id: zod.number().positive().int(),
  start: zod.string().datetime(),
  duration: zod.number(),
  userId: zod.number().positive().int(),
  src: zod.string(),
  screen: zod.boolean().optional(),
});

export const schema = zod.object({
  videos: zod.array(videoSchema),
});

export type Props = zod.infer<typeof schema>;

const SingleUser: React.FC<{
  src: string;
  start: number;
  end: number;
}> = ({ src, start, end }) => {
  return (
    <div className="w-full h-full">
      <OffthreadVideo src={staticFile(src)} startFrom={start} endAt={end} />
    </div>
  );
};

const DualUser: React.FC<{
  videos: Array<{
    src: string;
    start: number;
    end: number;
  }>;
}> = ({ videos }) => {
  return (
    <div className="flex flex-row items-center justify-center">
      {videos.map((video, idx) => (
        <OffthreadVideo
          className="w-1/2 border border-natural-100"
          key={idx}
          src={staticFile(video.src)}
          startFrom={video.start}
          endAt={video.end}
        />
      ))}
    </div>
  );
};

const PresenterScreen: React.FC<{
  presenter: {
    src: string;
    start: number;
    end: number;
  };
  screen: {
    src: string;
    start: number;
    end: number;
  };
}> = ({ presenter, screen }) => {
  return (
    <div className="w-full h-full relative">
      <div className="w-full h-full">
        <OffthreadVideo
          src={staticFile(screen.src)}
          startFrom={screen.start}
          endAt={screen.end}
        />
      </div>

      <div className="absolute bottom-6 right-6 aspect-video w-[500px] rounded-lg overflow-hidden">
        <OffthreadVideo
          src={staticFile(presenter.src)}
          startFrom={presenter.start}
          endAt={presenter.end}
        />
      </div>
    </div>
  );
};

const CoPresenterScreen: React.FC<{
  presenters: Array<{
    src: string;
    start: number;
    end: number;
  }>;
  screen: {
    src: string;
    start: number;
    end: number;
  };
}> = ({ presenters, screen }) => {
  return (
    <div className="flex flex-row gap-10">
      <div className="flex flex-col items-center justify-center gap-10 w-[500px] flex-shrink-0">
        {presenters.map((presenter, idx) => (
          <OffthreadVideo
            className="rounded-lg overflow-hidden"
            key={idx}
            src={staticFile(presenter.src)}
            startFrom={presenter.start}
            endAt={presenter.end}
          />
        ))}
      </div>
      <div className="flex items-center justify-center">
        <OffthreadVideo
          className="rounded-lg overflow-hidden"
          src={staticFile(screen.src)}
          startFrom={screen.start}
          endAt={screen.end}
        />
      </div>
    </div>
  );
};

const View: React.FC<{
  layout: Layout;
}> = ({ layout }) => {
  if (layout.type === "single-user") {
    const video = first(layout.videos);
    if (!video) return null;
    return <SingleUser src={video.src} {...video.frames} />;
  }

  if (layout.type === "dual-user")
    return (
      <DualUser
        videos={layout.videos.map((video) => ({
          src: video.src,
          ...video.frames,
        }))}
      />
    );

  if (layout.type === "presenter-screen") {
    const presenter = layout.videos.find((video) => !video.screen);
    const screen = layout.videos.find((video) => video.screen);
    if (!presenter || !screen) return null;
    return (
      <PresenterScreen
        presenter={{
          src: presenter.src,
          ...presenter.frames,
        }}
        screen={{
          src: screen.src,
          ...screen.frames,
        }}
      />
    );
  }

  if (layout.type === "co-presenter-screen") {
    const presenters = layout.videos.filter((video) => !video.screen);
    const screen = layout.videos.find((video) => video.screen);
    if (!screen) return null;
    return (
      <CoPresenterScreen
        screen={{
          src: screen.src,
          ...screen.frames,
        }}
        presenters={presenters.map((presenter) => ({
          src: presenter.src,
          ...presenter.frames,
        }))}
      />
    );
  }

  return null;
};

const Session: React.FC<Props> = ({ videos }) => {
  const { fps } = useVideoConfig();
  const layouts = useMemo(() => {
    // convert raw iso date to dayjs date
    const converted: Video[] = videos.map((video) => ({
      ...video,
      start: dayjs(video.start),
    }));

    return compose(converted, fps);
  }, [fps, videos]);

  return (
    <AbsoluteFill
      dir="rtl"
      className="flex items-center justify-center bg-natural-50 text-center"
    >
      {layouts.map((layout, idx) => {
        return (
          <Sequence
            key={idx}
            showInTimeline
            from={layout.start}
            name={layout.type}
            durationInFrames={layout.duration}
          >
            <View layout={layout} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export default Session;
