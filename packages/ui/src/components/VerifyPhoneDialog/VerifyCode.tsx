import { Typography } from "@litespace/ui/Typography";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { ConfirmationCode } from "@litespace/ui/ConfirmationCode";
import { Button } from "@litespace/ui/Button";
import { Void } from "@litespace/types";
import React, { useState } from "react";

type Props = {
  phone: string;
  resend: Void;
  resending: boolean;
  verifing: boolean;
  byWhatsapp: boolean;
  verifyCode: (code: number) => void;
  close: Void;
};

export const VerifyCode: React.FC<Props> = ({
  phone,
  resend,
  resending,
  verifing,
  byWhatsapp,
  close,
  verifyCode,
}) => {
  const intl = useFormatMessage();
  const [code, setCode] = useState<number | null>(null);

  return (
    <div>
      <Typography
        tag="p"
        className="text-caption mt-2 font-semibold text-natural-950"
      >
        {intl.rich("verify-phone-dialog.confirm-code.description", {
          method: (
            <Typography tag="span">
              {byWhatsapp
                ? intl("verify-phone-dialog.whatsapp")
                : intl("verify-phone-dialog.telegram")}
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
          setCode={setCode}
          autoFocus={true}
          disabled={verifing}
        />

        <div className="flex justify-center text-natural-700 items-center">
          <Button
            onClick={resend}
            disabled={verifing || resending}
            className="font-medium"
            variant="tertiary"
            size="small"
          >
            <Typography tag="p" className="flex font-medium">
              {resending
                ? intl("verify-phone-dialog.resending")
                : intl("verify-phone-dialog.resend")}
            </Typography>
          </Button>
        </div>
      </div>

      <div className="flex gap-6 mt-6 w-full">
        <Button
          onClick={() => {
            if (!code) return;
            verifyCode(code);
          }}
          disabled={verifing || !code}
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
    </div>
  );
};
