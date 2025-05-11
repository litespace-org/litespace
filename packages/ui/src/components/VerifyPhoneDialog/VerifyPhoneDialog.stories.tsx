import { VerifyPhoneDialog } from "@/components/VerifyPhoneDialog";
import { Meta, StoryObj } from "@storybook/react";
import React from "react";

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
    onClose: () => alert("closing"),
    open: true,
    resending: false,
    sendCode: () => {},
    sendingCode: false,
    sentCode: false,
    unresolvedPhone: false,
    verifyCode: (val) => alert(val),
    verifyingCode: false,
  },
};

export const SendingCode: Story = {
  args: {
    phone: "0111111111",
    open: true,
    onClose: () => alert("closing"),
    resending: false,
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
    phone: "0111111111",
    open: true,
    onClose: () => alert("closing"),
    resending: false,
    sendCode: () => {},
    sendingCode: false,
    sentCode: false,
    unresolvedPhone: true,
    verifyCode: (val) => alert(val),
    verifyingCode: false,
  },
};

export const ConfirmationCode: Story = {
  args: {
    phone: "01111111111",
    onClose: () => alert("closing"),
    open: true,
    resending: false,
    sendCode: () => {},
    sendingCode: false,
    sentCode: true,
    unresolvedPhone: false,
    verifyCode: (val) => alert(val),
    verifyingCode: false,
  },
};

export default meta;
