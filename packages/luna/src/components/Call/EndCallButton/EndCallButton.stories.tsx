import type { Meta, StoryObj } from "@storybook/react";
import { EndCallButton } from "@/components/Call/EndCallButton";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import React from "react";
type Component = typeof EndCallButton;

const meta: Meta<Component> = {
  component: EndCallButton,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="tw-w-[278px] tw-h-[341px]">
        <Story />
      </div>
    ),
    DarkStoryWrapper,
  ],
};

export const Primary: StoryObj<Component> = {
  args: {},
};

export default meta;
