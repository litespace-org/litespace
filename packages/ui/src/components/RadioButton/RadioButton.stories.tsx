import { StoryObj, Meta } from "@storybook/react";
import { RadioButton } from "@/components/RadioButton";
import React from "react";

const meta: Meta<typeof RadioButton> = {
  title: "RadioButton",
  component: RadioButton,
  decorators: [
    (Story) => (
      <div>
        <Story />
      </div>
    ),
  ],
};

type Story = StoryObj<typeof RadioButton>;

export const Primary: Story = {
  args: {
    name: "plan",
    onChange: () => {},
  },
};

export const MultiButtons: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <RadioButton name="plan-1" />
      <RadioButton name="plan-2" />
      <RadioButton name="plan-3" />
    </div>
  ),
};

export default meta;
