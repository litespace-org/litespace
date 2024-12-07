import type { Meta, StoryObj } from "@storybook/react";
import { PreCall } from "@/components/Call";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";

type Component = typeof PreCall;

const meta: Meta<Component> = {
  title: "PreCall",
  component: PreCall,
  parameters: { layout: "centered" },
  decorators: [DarkStoryWrapper],
};

export const Primary: StoryObj<Component> = {
  args: {},
};

export default meta;
