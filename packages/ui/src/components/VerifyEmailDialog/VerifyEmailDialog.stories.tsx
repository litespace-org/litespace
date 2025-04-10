import React from "react";
import { StoryObj, Meta } from "@storybook/react";
import { VerifyEmailDialog } from "@/components/VerifyEmailDialog";

const meta: Meta<typeof VerifyEmailDialog> = {
  title: "VerifyEmailDialog",
  component: VerifyEmailDialog,
  decorators: [
    (Story) => (
      <div>
        <Story />
      </div>
    ),
  ],
};

type Story = StoryObj<typeof VerifyEmailDialog>;

export const Primary: Story = {
  args: {
    open: true,
    email: "someone@litespace.org",
    code: 12345,
    loading: false,
    resend: () => alert("resending email..."),
    verify: (val) => alert(`verifing value of ${val}`),
    close: () => alert("closing dialog..."),
  },
};

export default meta;
