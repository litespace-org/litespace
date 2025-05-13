import { StoryObj, Meta } from "@storybook/react";
import { ForgetPasswordDialog } from "@/components/ForgetPasswordDialog";
import React, { useState } from "react";

type Component = typeof ForgetPasswordDialog;
type Story = StoryObj<Component>;

const meta: Meta<Component> = {
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

export const Primary: Story = {
  args: {
    open: true,
    sendCode: (email) => console.log(email),
    sendingCode: false,
    sentCode: false,
    resetPassword: (payload) => alert(JSON.stringify(payload)),
    resetSendCode: () => {},
    resettingPassword: false,
  },
  render(props) {
    const [sentCode, setSentCode] = useState<boolean>(false);
    const [sendingCode, setSendingCode] = useState<boolean>(false);
    return (
      <ForgetPasswordDialog
        {...props}
        sendCode={() => {
          setSendingCode(true);
          setSentCode(false);
          setTimeout(() => {
            setSendingCode(false);
            setSentCode(true);
          }, 500);
        }}
        sentCode={sentCode}
        resetSendCode={() => {
          setSentCode(false);
          setSendingCode(false);
        }}
        sendingCode={sendingCode}
      />
    );
  },
};

export const SendingCode: Story = {
  args: {
    open: true,
    sendCode: (email) => console.log(email),
    sendingCode: true,
    resetPassword: (payload) => alert(JSON.stringify(payload)),
    resetSendCode: () => {},
    resettingPassword: false,
  },
};

export const SentCode: Story = {
  args: {
    open: true,
    sendCode: (email) => console.log(email),
    sendingCode: false,
    sentCode: true,
    resetPassword: (payload) => console.log(payload),
    resetSendCode: () => {},
    resettingPassword: false,
  },
  render(props) {
    const [sentCode, setSentCode] = useState<boolean>(false);
    return (
      <ForgetPasswordDialog
        {...props}
        sendCode={() => setSentCode(true)}
        sentCode={sentCode}
        resetSendCode={() => setSentCode(false)}
      />
    );
  },
};

export default meta;
