import { Dialog } from "@/components/Dialog";
import { Typography } from "@/components/Typography";
import {
  useFormatMessage,
  useValidateEmail,
  useValidatePassword,
} from "@/hooks";
import { IConfirmationCode, Void } from "@litespace/types";
import React, { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/Button";
import { ConfirmationCode } from "@/components/ConfirmationCode";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import cn from "classnames";
import { Input, Password } from "@/components/Input";
import { useForm } from "@litespace/headless/form";
import { isValidEmail, isValidPassword } from "@litespace/utils";

type Step = "email" | "code" | "password";

/**
 * The dialog is made of two forms:
 * 1. Forget password form: user should enter his email.
 * 2. Reset password form: user enter the confirmation code and the password.
 */
export const ForgetPasswordDialog: React.FC<{
  open: boolean;
  close: Void;
  sendCode: (payload: IConfirmationCode.SendForgetPasswordEmailPayload) => void;
  sendingCode: boolean;
  resetPassword: (payload: { code: number; password: string }) => void;
  resettingPassword: boolean;
}> = ({
  open,
  sendCode,
  sendingCode,
  resetPassword,
  resettingPassword,
  close,
}) => {
  const intl = useFormatMessage();
  const { sm } = useMediaQuery();
  const validateEmail = useValidateEmail(true);
  const validatePassword = useValidatePassword(true);

  const [step, setStep] = useState<Step>("email");

  const forgetPasswordForm = useForm<{ email: string }>({
    defaults: { email: "" },
    validators: { email: validateEmail },
    onSubmit: async (data) => {
      if (!isValidEmail(data.email)) return;
      try {
        await sendCode({ email: data.email });
        setStep("code");
      } catch (err) {
        console.log(err);
        setStep("email");
      }
    },
  });

  const resetPasswordForm = useForm<{ code: number; password: string }>({
    defaults: { code: 0, password: "" },
    validators: { password: validatePassword },
    onSubmit(data) {
      if (!isValidPassword(data.password) || !data.code) return;
      return resetPassword(data);
    },
  });

  const onSubmit = useCallback(() => {
    if (step === "email") forgetPasswordForm.submit();
    if (step === "password") resetPasswordForm.submit();
  }, [forgetPasswordForm, resetPasswordForm, step]);

  const isEmpty = useMemo(
    () =>
      (step === "email" && !forgetPasswordForm.state.email) ||
      (step === "code" && !resetPasswordForm.state.code) ||
      (step === "password" && !resetPasswordForm.state.password),
    [
      step,
      forgetPasswordForm.state.email,
      resetPasswordForm.state.code,
      resetPasswordForm.state.password,
    ]
  );

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
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
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
            autoFocus
            id="email"
            placeholder={intl("forget-password-dialog.email.placeholder")}
            label={intl("forget-password-dialog.email.label")}
            onChange={(e) => forgetPasswordForm.set("email", e.target.value)}
            state={forgetPasswordForm.errors?.email ? "error" : undefined}
            helper={forgetPasswordForm.errors?.email}
            idleDir="rtl"
            autoComplete="off"
            disabled={sendingCode}
            inputSize="large"
            value={forgetPasswordForm.state.email}
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
                    {forgetPasswordForm.state.email}
                  </Typography>
                ),
              })}
            </Typography>

            <ConfirmationCode
              disabled={sendingCode || resettingPassword}
              setCode={(code) => {
                resetPasswordForm.set("code", code);
                setStep("password");
              }}
              autoFocus
            />

            <Button
              onClick={() => {
                resetPasswordForm.reset();
                forgetPasswordForm.reset();
                setStep("email");
              }}
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
          <Password
            autoFocus
            id="password"
            idleDir="rtl"
            autoComplete="off"
            label={intl("forget-password-dialog.password.label")}
            placeholder={intl("forget-password-dialog.password.placeholder")}
            onChange={(e) => resetPasswordForm.set("password", e.target.value)}
            value={resetPasswordForm.state.password}
            state={resetPasswordForm.errors?.password ? "error" : undefined}
            helper={resetPasswordForm.errors?.password}
          />
        ) : null}

        <div className="flex gap-4 md:gap-6 mt-8 md:mt-12">
          <Button
            onClick={onSubmit}
            size="large"
            className="flex-1"
            loading={sendingCode || resettingPassword}
            disabled={sendingCode || resettingPassword || isEmpty}
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
            disabled={sendingCode || resettingPassword}
          >
            <Typography tag="span" className="text-body font-medium">
              {intl("labels.cancel")}
            </Typography>
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default ForgetPasswordDialog;
