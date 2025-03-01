import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from "@/components/Checkbox";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import ar from "@/locales/ar-eg.json";

type Component = typeof Checkbox;

const meta: Meta<Component> = {
  title: "Checkbox",
  component: Checkbox,
  parameters: { layout: "centered" },
  decorators: [DarkStoryWrapper],
};

export const Primary: StoryObj<Component> = {
  args: {
    id: "sunday",
    label: ar["global.days.sun"],
  },
};

export const PrimaryDisabled: StoryObj<Component> = {
  args: {
    id: "sunday",
    label: ar["global.days.sun"],
    checked: false,
    disabled: true,
  },
};

export const PrimaryCheckedDisabled: StoryObj<Component> = {
  args: {
    id: "sunday",
    label: ar["global.days.sun"],
    checked: true,
    disabled: true,
  },
};

export default meta;
