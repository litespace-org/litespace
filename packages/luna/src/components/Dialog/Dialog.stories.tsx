import type { Meta, StoryObj } from "@storybook/react";
import { Dialog } from "@/components/Dialog";
import React from "react";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import { Typography } from "@/components/Typography";
import { faker } from "@faker-js/faker/locale/ar";

type Component = typeof Dialog;
type Story = StoryObj<Component>;

const meta: Meta<Component> = {
  title: "Dialog",
  component: Dialog,
  decorators: [DarkStoryWrapper],
};

const title = (
  <div>
    <Typography
      element="subtitle-2"
      weight="bold"
      className=" tw-text-natural-950"
    >
      {faker.lorem.words(5)}
    </Typography>
  </div>
);

const children = (
  <div>
    <div className="tw-my-2">
      <Typography>{faker.lorem.lines(12)}</Typography>
    </div>
  </div>
);

export const Primary: Story = {
  args: {
    trigger: <button>trigger</button>,
    className: "tw-w-[600px]",
    close: () => {},
    title,
    children,
  },
};

export const PositionedAtBottom: Story = {
  args: {
    open: true,
    className: "tw-w-full",
    position: "bottom",
    close: () => {},
    children,
    title,
  },
};

export default meta;
