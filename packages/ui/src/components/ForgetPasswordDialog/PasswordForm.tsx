import { Password } from "@/components/Input";
import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks";
import { useMakeValidators } from "@/hooks/validation";
import { isValidPassword } from "@/lib/validate";
import { useForm } from "@litespace/headless/form";
import React, { useCallback } from "react";
import { DialogActions } from "@/components/ForgetPasswordDialog";
import { Void } from "@litespace/types";

export const PasswordForm: React.FC<{
  resetPassword: (password: string) => void;
  resettingPassword: boolean;
  close: Void;
}> = ({ resetPassword, resettingPassword, close }) => {
  const intl = useFormatMessage();

  const validators = useMakeValidators({
    password: {
      required: true,
      validate: isValidPassword,
    },
  });

  const form = useForm<{ password: string }>({
    defaults: {
      password: "",
    },
    validators,
    onSubmit() {
      resetPassword(form.state.password);
    },
  });

  const onClose = useCallback(() => {
    close();
    form.reset();
  }, [close, form]);

  return (
    <>
      <Typography
        tag="h5"
        className="text-tiny md:text-caption font-semibold text-natural-950 mb-6"
      >
        {intl("forget-password-dialog.desc.password")}
      </Typography>
      <Password
        autoFocus
        id="password"
        idleDir="rtl"
        autoComplete="off"
        label={intl("forget-password-dialog.password.label")}
        placeholder={intl("forget-password-dialog.password.placeholder")}
        onChange={(e) => form.set("password", e.target.value)}
        value={form.state.password}
        state={form.errors?.password ? "error" : undefined}
        helper={form.errors?.password}
      />
      <DialogActions
        loading={resettingPassword}
        confirmId="labels.confirm"
        submit={form.submit}
        close={onClose}
      />
    </>
  );
};

export default PasswordForm;
