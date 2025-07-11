import React from "react";
import { VideoDialog } from "@/components/Dialog";
import { VideoPlayer } from "@/components/VideoPlayer/V2";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import type { Meta, StoryObj } from "@storybook/react";

type Component = typeof VideoDialog;
type Story = StoryObj<Component>;

const meta: Meta<Component> = {
  title: "Dialog/VideoDialog",
  component: VideoDialog,
  decorators: [DarkStoryWrapper],
  args: {
    children: (
      <VideoPlayer src="https://files.vidstack.io/sprite-fight/720p.mp4" />
    ),
  },
};

export const Primary: Story = {
  args: {
    open: true,
    className: "w-[600px]",
    close: () => alert("closing..."),
    headless: true,
  },
};

export default meta;
