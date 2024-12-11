import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import DeleteDialog from "@/components/TutorCard/DeleteDialog";

type Story = StoryObj<typeof DeleteDialog>;

const meta: Meta<typeof DeleteDialog> = {
  title: "TutorCard/DeleteDialog",
  component: DeleteDialog,
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
  },
};

export default meta;
