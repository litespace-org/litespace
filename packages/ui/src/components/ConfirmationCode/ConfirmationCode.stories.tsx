import React from "react";
import { StoryObj, Meta } from "@storybook/react";
import { ConfirmationCode } from "@/components/ConfirmationCode";

const meta: Meta<typeof ConfirmationCode> = {
  title: "ConfirmationCode",
  component: ConfirmationCode,
  decorators: [
    (Story) => (
      <div>
        <Story />
      </div>
    ),
  ],
};

type Story = StoryObj<typeof ConfirmationCode>;

export const Primary: Story = {
  args: {
    disabled: false,
    setCode: (value) => alert(value),
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    setCode: (value) => alert(value),
  },
};

export default meta;
