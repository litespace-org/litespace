import { StoryObj, Meta } from "@storybook/react";
import { ForgetPasswordDialog } from "@/components/ForgetPasswordDialog";
import React, { useState } from "react";
import { Button } from "@/components/Button";

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

export const ForgetPassword: Story = {
  render() {
    const [open, setOpen] = useState(false);
    const [sentCode, setSentCode] = useState<boolean>(false);
    const [sendingCode, setSendingCode] = useState<boolean>(false);
    const [resettingPassword, setResettingPassword] = useState(false);

    return (
      <>
        <Button onClick={() => setOpen(true)}>forget password</Button>
        <ForgetPasswordDialog
          open={open}
          close={() => setOpen(false)}
          sendCode={() => {
            setSendingCode(true);
            setTimeout(() => {
              setSendingCode(false);
              setSentCode(true);
            }, 3000);
          }}
          sendingCode={sendingCode}
          sentCode={sentCode}
          resendCode={() => setSentCode(false)}
          resetPassword={(newPassword) => {
            setResettingPassword(true);
            setTimeout(() => {
              setResettingPassword(false);
              console.log(newPassword);
              setOpen(false);
            }, 3000);
          }}
          resettingPassword={resettingPassword}
        />
      </>
    );
  },
};

export default meta;
