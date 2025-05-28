import { Password as PasswordInput } from "@/components/Input";
import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks";
import { useMakeValidators } from "@/hooks/validation";
import { validatePassword } from "@/lib/validate";
import { useForm } from "@litespace/headless/form";
import React from "react";
import Actions from "@/components/ForgetPasswordDialog/Actions";
import { Void } from "@litespace/types";
import { flow } from "lodash";

export const Password: React.FC<{
  resetPassword: (password: string) => void;
  resettingPassword: boolean;
  close: Void;
}> = ({ resetPassword, resettingPassword, close }) => {
  const intl = useFormatMessage();

  const validators = useMakeValidators({
    password: {
      required: true,
      validate: validatePassword,
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
    resetOnSubmit: true,
  });

  return (
    <form onSubmit={form.onSubmit}>
      <Typography
        tag="h5"
        className="text-tiny md:text-caption font-semibold text-natural-950 mb-6"
      >
        {intl("forget-password-dialog.desc.password")}
      </Typography>
      <PasswordInput
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
      <Actions
        loading={resettingPassword}
        confirmId="labels.confirm"
        close={flow(form.reset, close)}
      />
    </form>
  );
};

export default Password;
