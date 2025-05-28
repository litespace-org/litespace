import { Input } from "@/components/Input";
import { useFormatMessage } from "@/hooks";
import { useMakeValidators } from "@/hooks/validation";
import { validateEmail } from "@/lib/validate";
import { useForm } from "@litespace/headless/form";
import React from "react";
import { Typography } from "@/components/Typography";
import { Void } from "@litespace/types";
import Actions from "@/components/ForgetPasswordDialog/Actions";
import { flow } from "lodash";

export const Email: React.FC<{
  sendCode: (email: string) => void;
  sendingCode: boolean;
  close: Void;
}> = ({ sendCode, sendingCode, close }) => {
  const intl = useFormatMessage();
  const validators = useMakeValidators({
    email: { required: true, validate: validateEmail },
  });

  const form = useForm<{ email: string }>({
    defaults: { email: "" },
    validators,
    onSubmit() {
      sendCode(form.state.email);
    },
  });

  return (
    <form onSubmit={form.onSubmit}>
      <Typography
        tag="h5"
        className="text-tiny md:text-caption font-semibold text-natural-950 mb-6"
      >
        {intl("forget-password-dialog.desc.email")}
      </Typography>
      <Input
        autoFocus
        id="email"
        placeholder={intl("forget-password-dialog.email.placeholder")}
        label={intl("forget-password-dialog.email.label")}
        onChange={(e) => form.set("email", e.target.value)}
        state={form.errors?.email ? "error" : undefined}
        helper={form.errors?.email}
        idleDir="rtl"
        autoComplete="true"
        disabled={sendingCode}
        inputSize="large"
        value={form.state.email}
      />
      <Actions
        loading={sendingCode}
        confirmId="forget-password-dialog.submit"
        close={flow(form.reset, close)}
      />
    </form>
  );
};

export default Email;
