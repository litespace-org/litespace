import type { Meta, StoryObj } from "@storybook/react";
import { VideoPlayer } from "@/components/VideoPlayer/V2/VideoPlayer";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";

type Component = typeof VideoPlayer;

const meta: Meta<Component> = {
  title: "VideoPlayer/V2",
  component: VideoPlayer,
  parameters: { layout: "centered" },
  decorators: [DarkStoryWrapper],
};

export const Primary: StoryObj<Component> = {
  args: {
    src: "https://files.vidstack.io/sprite-fight/720p.mp4",
  },
};

export const WithThumbnail: StoryObj<Component> = {
  args: {
    src: "https://files.vidstack.io/sprite-fight/720p.mp4",
    poster:
      "https://ddz4ak4pa3d19.cloudfront.net/cache/8d/ed/8ded94a514ca466ea5f819824fbe14ab.jpg",
  },
};

export const InvalidVideoUrl: StoryObj<Component> = {
  args: {
    src: "",
  },
};

export default meta;
