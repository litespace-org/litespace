import type { Meta, StoryObj } from "@storybook/react";
import { Switch } from "@/components/Switch";
import { DarkStoryWrapper } from "@/Internal/DarkWrapper";

type Component = typeof Switch;

const meta: Meta<Component> = {
  title: "Switch",
  component: Switch,
  parameters: { layout: "centered" },
  decorators: [DarkStoryWrapper],
};

export const Primary: StoryObj<Component> = {
  args: { id: "switch" },
};

export default meta;
