import { VerifyPhoneDialog } from "@/components/VerifyPhoneDialog";
import { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";

type Component = typeof VerifyPhoneDialog;

const meta: Meta<Component> = {
  title: "VerifyPhoneDialog",
  component: VerifyPhoneDialog,
  decorators: [
    (Story) => {
      return (
        <div>
          <Story />
        </div>
      );
    },
  ],
};

type Story = StoryObj<Component>;

export const WithoutPhoneNumber: Story = {
  args: {
    close: () => alert("closing"),
    sendingCode: false,
    unresolvedPhone: false,
    verifyCode: (val) => alert(val),
    verifyingCode: false,
  },
  render: (props) => {
    const [sentCode, setSentCode] = useState(false);

    return (
      <VerifyPhoneDialog
        {...props}
        sendCode={() => setSentCode(true)}
        sentCode={sentCode}
      />
    );
  },
};

export const SendingCode: Story = {
  args: {
    phone: "01234567890",
    close: () => alert("closing"),
    sendCode: (payload) => alert(payload),
    sendingCode: true,
    sentCode: false,
    unresolvedPhone: false,
    verifyCode: (val) => alert(val),
    verifyingCode: false,
  },
};

export const UnresolvedPhone: Story = {
  args: {
    phone: "01234567890",
    close: () => alert("closing"),
    sendCode: () => {},
    sendingCode: false,
    sentCode: false,
    unresolvedPhone: true,
    verifyCode: (val) => alert(val),
    verifyingCode: false,
  },
};

export default meta;
