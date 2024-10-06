import type { Meta, StoryObj } from "@storybook/react";
import { VideoPlayer } from "@/components/VideoPlayer";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";

type Component = typeof VideoPlayer;

const meta: Meta<Component> = {
  title: "VideoPlayer",
  component: VideoPlayer,
  parameters: { layout: "centered" },
  decorators: [DarkStoryWrapper],
};

export const Primary: StoryObj<Component> = {
  args: {
    src: "https://files.vidstack.io/sprite-fight/720p.mp4",
  },
};

export const InvalidVideoUrl: StoryObj<Component> = {
  args: {
    src: "",
  },
};

export default meta;
