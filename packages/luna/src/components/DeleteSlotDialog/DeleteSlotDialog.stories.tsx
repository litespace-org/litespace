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
  confirm: (slotId: number) => alert("deleting: " + slotId),
};

export const Primary: Story = {
  args: {
    slotId: 1,
    opened: true,
    ...actions,
  },
};

export const Confirming: Story = {
  args: {
    slotId: 1,
    opened: true,
    confirming: true,
    ...actions,
  },
};

export default meta;
