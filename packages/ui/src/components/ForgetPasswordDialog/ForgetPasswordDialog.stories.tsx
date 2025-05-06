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
    resetPassword: (payload) => alert(JSON.stringify(payload)),
    resettingPassword: false,
  },
  render(props) {
    const [sendingCode, setSendingCode] = useState<boolean>(false);
    return (
      <ForgetPasswordDialog
        {...props}
        sendCode={() => {
          setSendingCode(true);
          setTimeout(() => {
            setSendingCode(false);
          }, 500);
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
    resettingPassword: false,
  },
};

export default meta;
