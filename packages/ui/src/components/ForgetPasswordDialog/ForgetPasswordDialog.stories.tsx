import { StoryObj, Meta } from "@storybook/react";
import { ForgetPasswordDialog } from "@/components/ForgetPasswordDialog";
import React from "react";

const meta: Meta<typeof ForgetPasswordDialog> = {
  title: "ForgetPasswordDialog",
  component: ForgetPasswordDialog,
  decorators: [
    (Story) => (
      <div>
        <Story />
      </div>
    ),
  ],
};

type Story = StoryObj<typeof ForgetPasswordDialog>;

export const Primary: Story = {
  args: {
    open: true,
    submittingState: "idle",
    setEmail: (val) => console.log(val),
    setCode: (val) => console.log(val),
    setPassword: (password) => console.log(password),
    resend: () => console.log("resending..."),
    close: () => console.log("closing..."),
  },
};

export const Loading: Story = {
  args: {
    open: true,
    submittingState: "loading",
    setEmail: (val) => console.log(val),
    setCode: (val) => console.log(val),
    setPassword: (password) => console.log(password),
    resend: () => console.log("resending..."),
    close: () => console.log("closing..."),
  },
};

export default meta;
