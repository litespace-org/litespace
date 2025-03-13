import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import { Steps } from "@/components/TutorOnboarding/Steps";

type Story = StoryObj<typeof Steps>;

const meta: Meta<typeof Steps> = {
  title: "TutorOnboarding/Steps",
  component: Steps,
  decorators: [
    (Story) => (
      <div className="">
        <Story />
      </div>
    ),
  ],
};

export const Primary: Story = {
  args: {
    open: true,
    close: () => alert("close"),
    onDelete: () => alert("delete rating"),
  },
};

export default meta;
