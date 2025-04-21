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
    resetSentCode: () => console.log("reset"),
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
        resetSentCode={() => {
          setSentCode(false);
          setSendingCode(false);
        }}
        sentCode={sentCode}
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
    sentCode: false,
    resetPassword: (payload) => alert(JSON.stringify(payload)),
    resetSentCode: () => console.log("reset"),
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
    resetSentCode: () => console.log("reset"),
    resettingPassword: false,
  },
  render(props) {
    const [sentCode, setSentCode] = useState<boolean>(false);
    return (
      <ForgetPasswordDialog
        {...props}
        sendCode={() => setSentCode(true)}
        sentCode={sentCode}
      />
    );
  },
};

export default meta;
