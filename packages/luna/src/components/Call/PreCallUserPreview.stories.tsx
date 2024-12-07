import type { Meta, StoryObj } from "@storybook/react";
import { PreCallUserPreview } from "@/components/Call/PreCallUserPreview";
import { faker } from "@faker-js/faker/locale/ar";
import React, { useEffect, useState } from "react";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";

type Component = typeof PreCallUserPreview;

const meta: Meta<Component> = {
  title: "PreCallUserPreview",
  component: PreCallUserPreview,
  parameters: { layout: "centered" },
  decorators: [DarkStoryWrapper],
};

type ComponentProps = {
  stream: MediaStream | null;
  user: {
    id: number;
    imageUrl: string | null;
    name: string | null;
  };
};

const videoUrl =
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4";

async function getMediaStreamFromVideo(url: string) {
  // Create a video element
  const video = document.createElement("video");
  video.src = url;
  video.crossOrigin = "anonymous";
  video.autoplay = true;
  video.muted = true; // Mute to avoid autoplay restrictions

  // Wait for the video to load metadata
  await new Promise((resolve, reject) => {
    video.onloadedmetadata = resolve;
    video.onerror = reject;
  });
  // Create a canvas element
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");

  // Draw the video onto the canvas periodically
  function drawFrame() {
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
    requestAnimationFrame(drawFrame); // Continue drawing frames
  }
  drawFrame();

  // eslint-disable-next-line storybook/context-in-play-function
  video.play();

  // Capture the canvas as a MediaStream
  const mediaStream = canvas.captureStream(60); // 30 fps
  return mediaStream;
}

export const WithVideo: StoryObj<Component> = {
  args: {
    user: {
      id: 5,
      name: faker.person.fullName(),
      imageUrl: "https://picsum.photos/1900",
    },
  },
  render(props: ComponentProps) {
    const [stream, setStream] = useState<MediaStream | null>(null);
    useEffect(() => {
      async function getStream() {
        if (!videoUrl) return;
        const stream = await getMediaStreamFromVideo(videoUrl);
        setStream(stream);
      }

      getStream();
    }, []);
    return (
      <div className="tw-flex tw-justify-center tw-flex-col tw-items-center tw-w-[800px]">
        <PreCallUserPreview {...props} stream={stream} />
      </div>
    );
  },
};

export const WithoutVideo: StoryObj<Component> = {
  args: {
    user: {
      id: 5,
      name: faker.person.fullName(),
      imageUrl: "https://picsum.photos/1900",
    },
  },
  render(props: ComponentProps) {
    return (
      <div className="tw-flex tw-justify-center tw-flex-col tw-items-center tw-w-[800px]">
        <PreCallUserPreview {...props} />
      </div>
    );
  },
};

export default meta;
