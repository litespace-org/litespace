import type { Meta, StoryObj } from "@storybook/react";
import { Popover } from "@/components/Popover";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import { Button } from "@/components/Button";
import ar from "@/locales/ar-eg.json";
import React from "react";

type Component = typeof Popover;

const meta: Meta<Component> = {
  title: "Popover",
  component: Popover,
  parameters: { layout: "centered" },
  decorators: [DarkStoryWrapper],
};

export const Primary: StoryObj<Component> = {
  args: {
    children: <Button>{ar["global.labels.go"]}</Button>,
    content: (
      <p className="w-full">
        {ar["page.tutor.onboarding.book.interview.success.title"]}
      </p>
    ),
  },
};

export default meta;
