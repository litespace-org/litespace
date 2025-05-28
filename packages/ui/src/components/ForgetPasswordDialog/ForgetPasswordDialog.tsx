import { Dialog } from "@/components/Dialog";
import Email from "@/components/ForgetPasswordDialog/Steps/Email";
import Code from "@/components/ForgetPasswordDialog/Steps/Code";
import Password from "@/components/ForgetPasswordDialog/Steps/Password";
import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import { Void } from "@litespace/types";
import cn from "classnames";
import React, { useMemo, useState } from "react";

type Step = "email" | "code" | "password";
type Payload = { code: number; password: string };

export const ForgetPasswordDialog: React.FC<{
  open: boolean;
  close: Void;
  sendCode: (email: string) => void;
  sendingCode: boolean;
  sentCode: boolean;
  resendCode: (email: string) => void;
  resetPassword: (payLoad: Payload) => void;
  resettingPassword: boolean;
}> = ({
  open,
  sendCode,
  sendingCode,
  sentCode,
  resendCode,
  resetPassword,
  resettingPassword,
  close,
}) => {
  const intl = useFormatMessage();
  const { sm } = useMediaQuery();
  const [email, setEmail] = useState<string>("");
  const [code, setCode] = useState<number>(0);

  const step = useMemo((): Step => {
    if (sentCode && code) return "password";
    if (sentCode && !code) return "code";
    setCode(0);
    return "email";
  }, [code, sentCode]);

  return (
    <Dialog
      position={sm ? "center" : "bottom"}
      open={open}
      close={close}
      title={
        <Typography
          tag="span"
          className="text-body md:text-subtitle-1 font-bold text-natural-950"
        >
          {intl("forget-password-dialog.title")}
        </Typography>
      }
      className={cn(sm ? "w-[512px]" : "w-full")}
    >
      <div className="pt-2">
        {step === "email" ? (
          <Email
            sendCode={(email: string) => {
              setEmail(email);
              sendCode(email);
            }}
            sendingCode={sendingCode}
            close={close}
          />
        ) : null}

        {step === "code" ? (
          <Code
            email={email}
            resend={() => resendCode(email)}
            sendingCode={sendingCode}
            next={(code) => setCode(code)}
            close={close}
          />
        ) : null}

        {step === "password" ? (
          <Password
            resetPassword={(password) => {
              resetPassword({ password, code });
            }}
            resettingPassword={resettingPassword}
            close={close}
          />
        ) : null}
      </div>
    </Dialog>
  );
};

export default ForgetPasswordDialog;
