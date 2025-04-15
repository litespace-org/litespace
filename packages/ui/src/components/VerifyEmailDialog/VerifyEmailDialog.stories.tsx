import React from "react";
import { StoryObj, Meta } from "@storybook/react";
import { VerifyEmailDialog } from "@/components/VerifyEmailDialog";
import { faker } from "@faker-js/faker/locale/ar";

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
    email: faker.internet.email(),
    loading: false,
    resend: () => alert("resending email..."),
    verify: (val) => alert(`verifing value of ${val}`),
    close: () => alert("closing dialog..."),
  },
};

export default meta;
