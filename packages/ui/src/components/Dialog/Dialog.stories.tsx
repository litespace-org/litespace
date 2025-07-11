import type { Meta, StoryObj } from "@storybook/react";
import { Dialog } from "@/components/Dialog";
import React from "react";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import { Typography } from "@/components/Typography";
import { faker } from "@faker-js/faker/locale/ar";

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
      <div className="my-2">
        <Typography tag="span">{faker.lorem.lines(12)}</Typography>
      </div>
    ),
  },
};

export const Primary: Story = {
  args: {
    open: true,
    className: "w-[600px]",
    close: () => {},
  },
};

export const PositionedAtBottom: Story = {
  args: {
    open: true,
    className: "w-full",
    position: "bottom",
    close: () => {},
  },
};

export default meta;
