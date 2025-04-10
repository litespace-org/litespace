import { Button } from "@/components/Button";
import { ConfirmationCode } from "@/components/ConfirmationCode";
import { Dialog } from "@/components/Dialog";
import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import { Void } from "@litespace/types";
import cn from "classnames";
import React, { useState } from "react";

export const VerifyEmailDialog: React.FC<{
  email: string;
  open: boolean;
  code: number;
  loading: boolean;
  verify: (val: number) => void;
  close: Void;
  resend: Void;
}> = ({ email, open, code, loading, verify, resend, close }) => {
  const intl = useFormatMessage();
  const { sm, lg } = useMediaQuery();

  const [newCode, setNewCode] = useState<number>(0);

  return (
    <Dialog
      position={sm ? "center" : "bottom"}
      title={
        <Typography
          tag="p"
          className="text-body md:text-subtitle-1 font-bold text-natural-950"
        >
          {intl("page.login-otp.title")}
        </Typography>
      }
      open={open}
      close={close}
      className={cn({ "w-full": !sm })}
    >
      <div className="mt-4 md:mt-2 flex flex-col ">
        <Typography
          tag="h3"
          className="text-tiny md:text-caption font-semibold text-natural-950"
        >
          {lg
            ? intl("page.login-otp.description.large-screens")
            : intl("page.login-otp.description.small-screens")}
        </Typography>
        <div className="flex flex-col gap-6 justify-center text-center my-8 md:my-12">
          <div>
            <Typography
              tag="span"
              className="text-caption font-semibold text-natural-600"
            >
              {intl("page.login-otp-enter")}
            </Typography>
            &nbsp;
            <Typography
              tag="span"
              className="text-caption font-semibold text-natural-950"
            >
              {email}
            </Typography>
          </div>
          <div className="max-w-56 mx-auto">
            <ConfirmationCode
              code={code}
              disabled={loading}
              setCode={(code) => setNewCode(code)}
            />
          </div>
          <div>
            <Typography
              tag="span"
              className="text-caption font-semibold text-natural-600"
            >
              {intl("page.login-otp.not-sent")}
            </Typography>
            &nbsp;
            <Typography
              tag="span"
              className="text-caption text-brand-700 font-semibold hover:cursor-pointer"
              onClick={resend}
            >
              {intl("page.login-otp.resend")}
            </Typography>
          </div>
        </div>
        <div className="flex gap-4 md:gap-6">
          <Button
            onClick={() => verify(newCode)}
            size="large"
            className="flex-1"
            disabled={
              loading || newCode.toString().length !== code.toString().length
            }
            loading={loading}
          >
            {intl("labels.confirm")}
          </Button>
          <Button
            onClick={close}
            size="large"
            variant="secondary"
            className="flex-1"
          >
            {intl("labels.cancel")}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
