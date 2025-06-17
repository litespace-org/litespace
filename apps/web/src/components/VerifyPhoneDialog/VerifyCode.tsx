import { Typography } from "@litespace/ui/Typography";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { ConfirmationCode } from "@litespace/ui/ConfirmationCode";
import { Button } from "@litespace/ui/Button";
import { IConfirmationCode, IUser, Void } from "@litespace/types";
import React from "react";
import { PHONE_METHOD_TO_INTL_MSG_ID } from "@/components/VerifyPhoneDialog/utils";
import { useForm } from "@litespace/headless/form";
import { useMakeValidators } from "@litespace/ui/hooks/validation";
import { validateConfirmationCode } from "@litespace/ui/lib/validate";

type Props = {
  phone: string;
  resend: Void;
  resending: boolean;
  verifing: boolean;
  method: IUser.NotificationMethodLiteral;
  verifyCode: (payload: IConfirmationCode.VerifyPhoneCodeApiPayload) => void;
  close: Void;
};

type Form = {
  code: number;
};

export const VerifyCode: React.FC<Props> = ({
  phone,
  resend,
  resending,
  verifing,
  method,
  close,
  verifyCode,
}) => {
  const intl = useFormatMessage();

  const validators = useMakeValidators<Form>({
    code: {
      required: true,
      validate: validateConfirmationCode,
    },
  });

  const form = useForm<Form>({
    defaults: {
      code: 0,
    },
    validators,
    onSubmit(data) {
      verifyCode({ code: data.code, method });
    },
  });

  return (
    <form onSubmit={form.onSubmit}>
      <Typography
        tag="p"
        className="text-caption mt-2 font-semibold text-natural-950"
      >
        {intl.rich("verify-phone-dialog.confirm-code.description", {
          method: (
            <Typography tag="span">
              {intl(PHONE_METHOD_TO_INTL_MSG_ID[method])}
            </Typography>
          ),
        })}
      </Typography>
      <div className="my-12 flex flex-col items-center gap-6">
        <Typography tag="p" className="text-natural-600 font-semibold">
          {intl.rich("verify-phone-dialog.phone", {
            phone: (
              <Typography tag="span" className="text-natural-950">
                {phone}
              </Typography>
            ),
          })}
        </Typography>

        <ConfirmationCode
          setCode={(code) => form.set("code", code)}
          disabled={verifing}
          error={!!form.errors.code}
        />

        <div className="flex justify-center text-natural-700 items-center">
          <Button
            onClick={resend}
            disabled={verifing || resending}
            loading={resending}
            className="font-medium"
            variant="secondary"
            type="natural"
            size="small"
            htmlType="button"
          >
            <Typography tag="p" className="flex font-medium">
              {intl("verify-phone-dialog.resend")}
            </Typography>
          </Button>
        </div>
      </div>

      <div className="flex gap-6 mt-6 w-full">
        <Button
          disabled={verifing || !form.state.code}
          loading={verifing}
          size="large"
          className="grow"
        >
          {intl("labels.confirm")}
        </Button>
        <Button
          disabled={verifing}
          onClick={close}
          variant="secondary"
          size="large"
          className="grow"
        >
          {intl("labels.cancel")}
        </Button>
      </div>
    </form>
  );
};
