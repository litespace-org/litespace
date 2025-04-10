import React from "react";
import { StoryObj, Meta } from "@storybook/react";
import { EnterCode } from "@/components/EnterCode";

const meta: Meta<typeof EnterCode> = {
  title: "EnterCode",
  component: EnterCode,
  decorators: [
    (Story) => (
      <div>
        <Story />
      </div>
    ),
  ],
};

type Story = StoryObj<typeof EnterCode>;

export const WithAutoValidate: Story = {
  args: {
    code: 12345,
    autoValidate: true,
    setCode: (val) => alert(val),
  },
};

export const WithoutAutoValidate: Story = {
  args: {
    code: 12345,
    autoValidate: false,
    setCode: (val) => alert(val),
  },
};

export default meta;
