import type { Meta, StoryObj } from "@storybook/react";
import { ThemeSwitch } from "@/components/ThemeSwitch";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";

type Component = typeof ThemeSwitch;

const meta: Meta<Component> = {
  title: "ThemeSwitch",
  component: ThemeSwitch,
  parameters: { layout: "centered" },
  decorators: [DarkStoryWrapper],
};

export const Primary: StoryObj<Component> = {};

export default meta;
