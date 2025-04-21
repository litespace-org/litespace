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
    sending: false,
    verifiying: false,

    resend: () => console.log("resending email..."),
    verify: (code) => console.log(`code: ${code}`),
    close: () => console.log("close dialog..."),
  },
};

export const Sending: Story = {
  args: {
    open: true,
    email: faker.internet.email(),
    sending: true,
    verifiying: false,
    resend: () => console.log("resending email..."),
    verify: (code) => console.log(`code: ${code}`),
    close: () => console.log("close dialog..."),
  },
};

export const Verifing: Story = {
  args: {
    open: true,
    email: faker.internet.email(),
    sending: false,
    verifiying: true,
    resend: () => console.log("resending email..."),
    verify: (code) => console.log(`code: ${code}`),
    close: () => console.log("close dialog..."),
  },
};

export default meta;
