import { Button } from "@/components/Button";
import { ConfirmationCode } from "@/components/ConfirmationCode";
import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks";
import { useMakeValidators } from "@/hooks/validation";
import { validateConfirmationCode } from "@/lib/validate";
import { useForm } from "@litespace/headless/form";
import React from "react";
import Actions from "@/components/ForgetPasswordDialog/Actions";
import { Void } from "@litespace/types";
import { flow } from "lodash";

type Form = {
  code: number;
};

export const Code: React.FC<{
  email: string;
  sendingCode: boolean;
  resend: () => void;
  next: (code: number) => void;
  close: Void;
}> = ({ sendingCode, email, resend, next, close }) => {
  const intl = useFormatMessage();

  const validators = useMakeValidators({
    code: {
      required: true,
      validate: validateConfirmationCode,
    },
  });

  const form = useForm<Form>({
    defaults: { code: 0 },
    validators,
    resetOnSubmit: true,
    onSubmit(data) {
      next(data.code);
    },
  });

  return (
    <form onSubmit={form.onSubmit}>
      <Typography
        tag="h5"
        className="text-tiny md:text-caption font-semibold text-natural-950 mb-6"
      >
        {intl("forget-password-dialog.desc.code")}
      </Typography>
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
                {email}
              </Typography>
            ),
          })}
        </Typography>
        <ConfirmationCode
          disabled={sendingCode}
          setCode={(code) => form.set("code", code)}
          autoFocus
        />
        <Button
          onClick={resend}
          variant="tertiary"
          size="medium"
          className="mx-auto"
          disabled={sendingCode}
          htmlType="button"
        >
          <Typography
            tag="span"
            className="text-caption font-medium text-natural-600"
          >
            {intl("verify-email-dialog.resend")}
          </Typography>
        </Button>
      </div>

      <Actions
        confirmId="forget-password-dialog.submit"
        close={flow(form.reset, close)}
      />
    </form>
  );
};

export default Code;
