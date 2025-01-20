import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import { DeleteSlotDialog } from "@/components/DeleteSlotDialog";

type Story = StoryObj<typeof DeleteSlotDialog>;

const meta: Meta<typeof DeleteSlotDialog> = {
  title: "DeleteSlotDialog",
  component: DeleteSlotDialog,
  decorators: [
    (Story) => (
      <div>
        <Story />
      </div>
    ),
  ],
};

const actions = {
  close: () => alert("close..."),
  confirm: () => alert("deleting..."),
};

export const Primary: Story = {
  args: {
    opened: true,
    severity: "normal",
    ...actions,
  },
};

export const HighSeveritySlot: Story = {
  args: {
    opened: true,
    severity: "high",
    ...actions,
  },
};

export const Deleting: Story = {
  args: {
    opened: true,
    deleting: true,
    severity: "normal",
    ...actions,
  },
};

export default meta;
