import type { Meta, StoryObj } from "@storybook/react";
import { ThemeSwitch } from "@/components/Switch";

type Component = typeof ThemeSwitch;

const meta: Meta<Component> = {
  title: "ThemeSwitch",
  component: ThemeSwitch,
  parameters: { layout: "centered" },
  decorators: [],
};

export const Primary: StoryObj<Component> = {
  args: { id: "switch" },
};

export default meta;
