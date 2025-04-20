import { Typography } from "@litespace/ui/Typography";
import { Animate } from "@/components/Common/Animate";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { ConfirmationCode } from "@litespace/ui/ConfirmationCode";
import { Button } from "@litespace/ui/Button";
import { IUser, Void } from "@litespace/types";
import { useCallback, useState } from "react";

type VerifyCodeProps = {
  phoneNumber: string | null;
  sendVerificationCode: Void;
  verifing: boolean;
  verifyCode: (code: number) => void;
  activeMethod: IUser.NotificationMethodLiteral | null;
  close: Void;
};

export function VerifyCode({
  phoneNumber,
  activeMethod,
  sendVerificationCode,
  verifing,
  close,
  verifyCode,
}: VerifyCodeProps) {
  const intl = useFormatMessage();
  const [code, setCode] = useState<number>();
  const verifyConfirmationCode = useCallback(
    (code: number | undefined) => {
      if (!activeMethod || !code) return;

      verifyCode(code);
    },
    [activeMethod, verifyCode]
  );

  return (
    <Animate>
      <Typography
        tag="p"
        className="text-caption mt-2 font-semibold text-natural-950"
      >
        {intl("notification-method.dialog.code.description")}
      </Typography>
      <div className="mt-6 mb-12 flex flex-col items-center gap-6">
        <Typography className="text-natural-600 font-semibold" tag="p">
          {intl.rich("notification-method.dialog.code.enter-code", {
            phone: (
              <Typography tag="span" className="text-natural-950">
                {phoneNumber}
              </Typography>
            ),
          })}
        </Typography>
        <ConfirmationCode
          setCode={(code) => {
            setCode(code);
            verifyConfirmationCode(code);
          }}
          autoFocus={true}
          disabled={verifing}
        />

        <div className="flex justify-center text-natural-700 items-center">
          <Typography tag="p" className="flex font-medium">
            {intl.rich("notification-method.dialog.code.never-recieved", {
              resend: (
                <Button
                  onClick={sendVerificationCode}
                  disabled={verifing}
                  className="font-medium"
                  variant="tertiary"
                  size="small"
                >
                  {intl("notification-method.dialog.code.resend")}
                </Button>
              ),
            })}
          </Typography>
        </div>
      </div>

      <div className="flex gap-6 mt-6 w-full">
        <Button
          onClick={() => verifyConfirmationCode(code)}
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
    </Animate>
  );
}
