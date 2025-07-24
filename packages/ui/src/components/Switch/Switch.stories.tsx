import type { Meta, StoryObj } from "@storybook/react";
import { Switch } from "@/components/Switch";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";

type Component = typeof Switch;

const meta: Meta<Component> = {
  title: "Switch",
  component: Switch,
  parameters: { layout: "centered" },
  decorators: [DarkStoryWrapper],
};

export const PrimaryLarge: StoryObj<Component> = {
  args: { id: "switch", size: "large" },
};

export const PrimaryMedium: StoryObj<Component> = {
  args: { id: "switch", size: "medium" },
};

export const PrimarySmall: StoryObj<Component> = {
  args: { id: "switch" },
};

export const DisabledChecked: StoryObj<Component> = {
  args: { id: "switch", disabled: true, checked: true },
};

export const DisabledUnchecked: StoryObj<Component> = {
  args: { id: "switch", disabled: true, checked: false },
};

export default meta;
