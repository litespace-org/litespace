import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import { DeleteRating } from "@/components/TutorFeedback";

type Story = StoryObj<typeof DeleteRating>;

const meta: Meta<typeof DeleteRating> = {
  title: "TutorFeedback/DeleteRating",
  component: DeleteRating,
  decorators: [
    (Story) => (
      <div style={{ width: "400px" }}>
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
