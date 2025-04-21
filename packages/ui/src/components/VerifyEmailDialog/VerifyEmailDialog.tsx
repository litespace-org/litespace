import { Button } from "@/components/Button";
import { ConfirmationCode } from "@/components/ConfirmationCode";
import { Dialog } from "@/components/Dialog";
import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import { Void } from "@litespace/types";
import cn from "classnames";
import React, { useState } from "react";
import { isValidConfirmationCode } from "@litespace/utils/validation";

export const VerifyEmailDialog: React.FC<{
  email: string;
  open: boolean;
  sending: boolean;
  verifiying: boolean;
  verify: (value: number) => void;
  close: Void;
  resend: Void;
}> = ({ email, open, sending, verifiying, verify, resend, close }) => {
  const intl = useFormatMessage();
  const { sm } = useMediaQuery();
  const [code, setCode] = useState<number>(0);

  return (
    <Dialog
      position={sm ? "center" : "bottom"}
      title={
        <Typography
          tag="p"
          className="text-body md:text-subtitle-1 font-bold text-natural-950"
        >
          {intl("verify-email-dialog.title")}
        </Typography>
      }
      open={open}
      close={close}
      className={cn(sm ? "w-[512px]" : "w-full")}
    >
      <div className="mt-4 sm:mt-2 flex flex-col ">
        <Typography
          tag="h3"
          className="text-tiny md:text-caption font-semibold text-natural-950"
        >
          {intl("verify-email-dialog.desc")}
        </Typography>
        <div className="flex flex-col gap-6 justify-center text-center my-6">
          <Typography
            tag="span"
            className="text-caption font-semibold text-natural-600"
          >
            {intl.rich("verify-email-dialog.email", {
              email: (
                <Typography
                  tag="span"
                  className="text-natural-950 font-semibold text-caption"
                >
                  {email}
                </Typography>
              ),
            })}
          </Typography>

          <div className="mx-auto">
            <ConfirmationCode
              disabled={sending || verifiying}
              setCode={(code) => {
                setCode(code);
                verify(code);
              }}
            />
          </div>

          <Button
            onClick={() => {
              resend();
              setCode(0);
            }}
            variant="tertiary"
            size="medium"
            className="mx-auto"
            disabled={sending || verifiying}
            loading={sending}
          >
            <Typography
              tag="span"
              className="text-caption font-semibold text-natural-600"
            >
              {intl("verify-email-dialog.resend")}
            </Typography>
          </Button>
        </div>
        <div className="flex gap-4 md:gap-6">
          <Button
            onClick={() => {
              if (code) verify(code);
            }}
            size="large"
            className="flex-1"
            disabled={verifiying || sending || !isValidConfirmationCode(code)}
            loading={verifiying}
          >
            {intl("labels.confirm")}
          </Button>
          <Button
            onClick={close}
            size="large"
            variant="secondary"
            className="flex-1"
            disabled={sending || verifiying}
          >
            {intl("labels.cancel")}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
