import type { Meta, StoryObj } from "@storybook/react";
import { VerifyNotificationMethodDialog } from "@/components/VerifyNotificationMethodDialog/VerifyNotificationMethodDialog";
import { faker } from "@faker-js/faker/locale/ar";

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
    sending: false,
    verifyCode: () => {},
    verifing: false,
  },
};

export const OnPhone: Story = {
  args: {
    close: () => {},
    method: "telegram",
    phone: null,
    sendCode: () => {},
    sending: false,
    verifyCode: () => {},
    verifing: false,
  },
};

export const SendingCode: Story = {
  args: {
    close: () => {},
    method: "telegram",
    phone: null,
    sendCode: () => {},
    sending: true,
    verifyCode: () => {},
    verifing: false,
  },
};

export const OnCode: Story = {
  args: {
    close: () => {},
    method: "telegram",
    phone: faker.phone.number(),
    sendCode: () => {},
    sending: false,
    verifyCode: () => {},
    verifing: false,
  },
};

export const VerifyingCode: Story = {
  args: {
    close: () => {},
    method: "telegram",
    phone: faker.phone.number(),
    sendCode: () => {},
    sending: false,
    verifyCode: () => {},
    verifing: true,
  },
};

export default meta;
