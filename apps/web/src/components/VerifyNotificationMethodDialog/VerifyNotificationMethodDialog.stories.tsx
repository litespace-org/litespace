import type { Meta, StoryObj } from "@storybook/react";
import { VerifyNotificationMethodDialog } from "@/components/VerifyNotificationMethodDialog/VerifyNotificationMethodDialog";

type Component = typeof VerifyNotificationMethodDialog;
type Story = StoryObj<Component>;

const meta: Meta<Component> = {
  title: "VerifyNotificationMethodDialog",
  component: VerifyNotificationMethodDialog,
  parameters: { layout: "centered" },
};

export const Primary: Story = {
  args: {
    close: () => {},
    method: null,
    phone: null,
    sendCode: () => {},
    sendingCode: false,
    sentCode: false,
    verifyCode: () => {},
    verifing: false,
  },
};

export const WithMethod: Story = {
  args: {
    close: () => {},
    method: "telegram",
    phone: null,
    sendCode: () => {},
    sendingCode: false,
    sentCode: false,
    verifyCode: () => {},
    verifing: false,
  },
};

export const SendingCode: Story = {
  args: {
    close: () => {},
    method: "telegram",
    phone: "01012345678",
    sendCode: () => {},
    sendingCode: true,
    sentCode: false,
    verifyCode: () => {},
    verifing: false,
  },
};

export const WithPhone: Story = {
  args: {
    close: () => {},
    method: "telegram",
    phone: "01012345678",
    sendCode: () => {},
    sendingCode: false,
    sentCode: false,
    verifyCode: () => {},
    verifing: false,
  },
};

export const VerifyingCode: Story = {
  args: {
    close: () => {},
    method: "telegram",
    phone: "01012345678",
    sendCode: () => {},
    sendingCode: false,
    sentCode: true,
    verifyCode: () => {},
    verifing: true,
  },
};

export const ResendingCode: Story = {
  args: {
    close: () => {},
    method: "telegram",
    phone: "01012345678",
    sendCode: () => {},
    sendingCode: true,
    sentCode: true,
    verifyCode: () => {},
    verifing: false,
  },
};

export const UnresolvedPhone: Story = {
  args: {
    close: () => {},
    method: "telegram",
    phone: "01012345678",
    sendCode: () => {},
    sendingCode: false,
    sentCode: true,
    verifyCode: () => {},
    verifing: false,
    unresolvedPhone: true,
  },
};

export default meta;
