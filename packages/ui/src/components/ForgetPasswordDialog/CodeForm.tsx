import { Button } from "@/components/Button";
import { ConfirmationCode } from "@/components/ConfirmationCode";
import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks";
import { useMakeValidators } from "@/hooks/validation";
import { isValidConfirmationCode } from "@/lib/validate";
import { useForm } from "@litespace/headless/form";
import React, { useCallback } from "react";
import { DialogActions } from "@/components/ForgetPasswordDialog";
import { Void } from "@litespace/types";

export const CodeForm: React.FC<{
  email: string;
  sendingCode: boolean;
  resendCode: (email: string) => void;
  next: (code: number) => void;
  close: Void;
}> = ({ email, sendingCode, resendCode, next, close }) => {
  const intl = useFormatMessage();

  const validators = useMakeValidators({
    code: {
      required: true,
      validate: isValidConfirmationCode,
    },
  });

  const form = useForm<{ code: number }>({
    defaults: {
      code: 0,
    },
    validators,
    onSubmit() {
      next(form.state.code);
      form.reset();
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
          onClick={() => resendCode(email)}
          variant="tertiary"
          size="medium"
          className="mx-auto"
          disabled={sendingCode}
        >
          <Typography
            tag="span"
            className="text-caption font-medium text-natural-600"
          >
            {intl("verify-email-dialog.resend")}
          </Typography>
        </Button>
      </div>
      <DialogActions
        confirmId="forget-password-dialog.submit"
        submit={form.submit}
        close={onClose}
      />
    </>
  );
};

export default CodeForm;
