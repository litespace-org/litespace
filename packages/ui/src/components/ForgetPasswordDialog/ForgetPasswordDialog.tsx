import { Dialog } from "@/components/Dialog";
import { Typography } from "@/components/Typography";
import {
  useFormatMessage,
  // useValidateEmail,
  // useValidatePassword,
} from "@/hooks";
import { Void } from "@litespace/types";
import React, { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { ConfirmationCode } from "@/components/ConfirmationCode";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import cn from "classnames";
import { Input } from "@/components/Input";

type SubmitState = "idle" | "loading" | "success" | "error";

export const ForgetPasswordDialog: React.FC<{
  open: boolean;
  close: Void;
  setEmail: (email: string) => void;
  settingEmailState: SubmitState;
  setCode: (code: number) => void;
  settingCodeState: SubmitState;
  setPassword: (password: string) => void;
  settingPasswordState: SubmitState;
  /**
   * Resend the confirmation code again
   */
  resend: Void;
  reset: Void;
}> = ({
  open,
  settingCodeState,
  settingEmailState,
  settingPasswordState,
  setEmail,
  setCode,
  setPassword,
  resend,
  reset,
  close,
}) => {
  const intl = useFormatMessage();
  const { sm } = useMediaQuery();
  const [step, setStep] = useState<"email" | "code" | "password">("email");
  const [newEmail, setNewEmail] = useState<string>("");
  const [newCode, setNewCode] = useState<number>(0);
  const [newPassword, setNewPassword] = useState<string>("");

  const onSubmit = useCallback(() => {
    if (step === "email") {
      setEmail(newEmail);
      setNewPassword("");
    }

    if (step === "code") {
      setCode(newCode);
    }

    if (step === "password") {
      setPassword(newPassword);
    }
  }, [newCode, newEmail, newPassword, setCode, setEmail, setPassword, step]);

  useEffect(() => {
    if (settingEmailState === "success") setStep("code");
    if (settingCodeState === "success") setStep("password");
    if (settingPasswordState === "success") {
      close();
      reset();
    }
  }, [close, reset, settingCodeState, settingEmailState, settingPasswordState]);

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
      className={cn(sm ? "w-[584px]" : "w-full")}
    >
      {/* <Form className="mt-2" onSubmit={handleSubmit(onSubmit)}> */}
      <Typography
        tag="h5"
        className="text-tiny md:text-caption font-semibold text-natural-950 mb-6"
      >
        {step === "email" ? intl("forget-password-dialog.desc.email") : null}
        {step === "code" ? intl("forget-password-dialog.desc.code") : null}
        {step === "password"
          ? intl("forget-password-dialog.desc.password")
          : null}
      </Typography>
      {step === "email" ? (
        <Input
          placeholder={intl("forget-password-dialog.email.placeholder")}
          className="placeholder:text-end"
          label={intl("forget-password-dialog.email.label")}
          idleDir="ltr"
          onChange={(e) => setNewEmail(e.target.value)}
        />
      ) : null}

      {step === "code" ? (
        <div className="text-center flex flex-col items-center gap-6">
          <Typography
            tag="span"
            className="text-caption font-semibold text-natural-600"
          >
            {intl.rich("forget-password-dialog.email", {
              email: (
                <Typography
                  tag="span"
                  className="text-caption font-semibold text-natural-950"
                >
                  {newEmail}
                </Typography>
              ),
            })}
          </Typography>
          <ConfirmationCode
            disabled={false}
            setCode={(code) => setNewCode(code)}
            autoFocus
          />
          <Button
            onClick={resend}
            variant="tertiary"
            size="medium"
            className="mx-auto"
          >
            <Typography
              tag="span"
              className="text-caption font-medium text-natural-600"
            >
              {intl("verify-email-dialog.resend")}
            </Typography>
          </Button>
        </div>
      ) : null}

      {step === "password" ? (
        <Input
          label={intl("forget-password-dialog.password.label")}
          placeholder={intl("forget-password-dialog.password.placeholder")}
          idleDir="ltr"
          className="placeholder:text-end"
          onChange={(e) => setNewPassword(e.target.value)}
        />
      ) : null}

      <div className="flex gap-4 md:gap-6 mt-8 md:mt-12">
        <Button
          onClick={onSubmit}
          size="large"
          className="flex-1"
          loading={
            (step === "email" && settingEmailState === "loading") ||
            (step === "code" && settingCodeState === "loading") ||
            (step === "password" && settingPasswordState === "loading")
          }
          disabled={
            (step === "email" && !newEmail) ||
            (step === "email" && settingEmailState === "loading") ||
            (step === "code" && !newCode) ||
            (step === "code" && settingCodeState === "loading") ||
            (step === "password" && !newPassword) ||
            (step === "password" && settingPasswordState === "loading")
          }
        >
          <Typography tag="span" className="text-body font-medium">
            {step === "email" ? intl("forget-password-dialog.submit") : null}
            {step === "code" || step === "password"
              ? intl("labels.confirm")
              : null}
          </Typography>
        </Button>
        <Button
          htmlType="button"
          onClick={close}
          size="large"
          variant="secondary"
          className="flex-1"
        >
          <Typography tag="span" className="text-body font-medium">
            {intl("labels.cancel")}
          </Typography>
        </Button>
      </div>
      {/* </Form> */}
    </Dialog>
  );
};

export default ForgetPasswordDialog;
