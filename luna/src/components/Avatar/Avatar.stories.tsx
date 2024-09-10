import type { Meta, StoryObj } from "@storybook/react";
import { Avatar } from "@/components/Avatar";
import { DarkStoryWrapper } from "@/Internal/DarkWrapper";
import React from "react";

type Component = typeof Avatar;

const meta: Meta<Component> = {
  title: "Avatar",
  component: Avatar,
  argTypes: {
    src: { control: "text" },
    alt: { control: "text" },
  },
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story: React.FC) =>
      DarkStoryWrapper(() => (
        <div className="w-[400px] h-[400px]">
          <Story />
        </div>
      )),
  ],
};

const url = "https://picsum.photos/1900";

export const Primary: StoryObj<Component> = {
  args: {
    src: url,
    alt: "My Avtar",
  },
};

export const Fallback: StoryObj<Component> = {
  args: {
    src: "",
  },
};

export default meta;
