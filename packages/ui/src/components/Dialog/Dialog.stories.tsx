import type { Meta, StoryObj } from "@storybook/react";
import { Dialog } from "@/components/Dialog";
import React from "react";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import { Typography } from "@/components/Typography";
import { faker } from "@faker-js/faker/locale/ar";
import { VideoPlayer } from "@/components/VideoPlayer/V2";
import { Button } from "@/components/Button";

type Component = typeof Dialog;
type Story = StoryObj<Component>;

const meta: Meta<Component> = {
  title: "Dialog/Default",
  component: Dialog,
  decorators: [DarkStoryWrapper],
  args: {
    title: (
      <Typography
        tag="span"
        className=" text-natural-950 text-subtitle-2 text-bold"
      >
        {faker.lorem.words(5)}
      </Typography>
    ),
    children: (
      // <div className="my-2">
      <Typography tag="span">{faker.lorem.lines(212)}</Typography>
      // </div>
    ),
  },
};

export const Primary: Story = {
  args: {
    open: true,
    className: "w-[600px]",
    close: () => alert("closing..."),
    actions: (
      <div className="flex [&>*]:flex-1 gap-4">
        <Button size="large">yes</Button>
        <Button size="large" variant="secondary">
          No
        </Button>
      </div>
    ),
  },
};

export const PositionedAtBottom: Story = {
  args: {
    open: true,
    className: "w-full",
    position: "bottom",
    close: () => alert("closing..."),
  },
};

export const MediaLoading: Story = {
  args: {
    open: true,
    variant: "media",
    mediaLoading: true,
    children: (
      <VideoPlayer src="https://files.vidstack.io/sprite-fight/720p.mp4" />
    ),
    close: () => alert("closing..."),
  },
};

export const MediaError: Story = {
  args: {
    open: true,
    variant: "media",
    mediaError: true,
    mediaRefetch: () => alert("media refetching..."),
    children: (
      <VideoPlayer src="https://files.vidstack.io/sprite-fight/720p.mp4" />
    ),
    close: () => alert("closing..."),
  },
};

export const VideoDialog: Story = {
  args: {
    open: true,
    variant: "media",
    children: (
      <VideoPlayer src="https://files.vidstack.io/sprite-fight/720p.mp4" />
    ),
    close: () => alert("closing..."),
  },
};

export const ImageDialog: Story = {
  args: {
    open: true,
    variant: "media",
    children: <img src="https://picsum.photos/400/600" />,
    close: () => alert("closing..."),
  },
};

export default meta;
