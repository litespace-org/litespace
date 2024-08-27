import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "@/components/Card";
import { DarkStoryWrapper } from "@/Internal/DarkWrapper";
import ar from "@/locales/ar-eg.json";

type Component = typeof Card;

const meta: Meta<Component> = {
  title: "Card",
  component: Card,
  parameters: { layout: "centered" },
  decorators: [DarkStoryWrapper],
};

export const Primary: StoryObj<Component> = {
  args: {
    children: ar["global.notify.schedule.update.success"],
  },
};

export default meta;
