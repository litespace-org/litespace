import React, { useCallback, useState } from "react";
import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks";
import { Popover } from "@/components/Popover";
import { Link } from "react-router-dom";
import cn from "classnames";
import { TELEGRAM_NUMBER } from "@litespace/utils";
import { Button } from "@/components/Button";
import { Void } from "@litespace/types";

export const UnresolvedPhone: React.FC<{
  resend: Void;
  sendingCode: boolean;
}> = ({ resend, sendingCode }) => {
  const intl = useFormatMessage();

  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    const handledNumber = TELEGRAM_NUMBER.split("-").join("");
    await navigator.clipboard.writeText(handledNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 1_500);
  }, []);

  return (
    <div className="pt-2 flex flex-col gap-6">
      <Typography
        tag="h6"
        className="text-caption font-semibold text-natural-950"
      >
        {intl("verify-phone-dialog.telegram.privacy-issue.description-1")}
      </Typography>
      <Typography
        tag="h6"
        className="text-caption font-semibold text-natural-950"
      >
        {intl("verify-phone-dialog.telegram.privacy-issue.description-2")}
      </Typography>
      <Typography
        tag="h6"
        className="text-caption font-semibold text-natural-950"
      >
        {intl.rich("verify-phone-dialog.telegram.privacy-issue.description-3", {
          phone: (
            <Popover
              content={
                <Typography tag="span">
                  {intl(
                    copied
                      ? "verify-phone-dialog.telegram.privacy-issue.copied"
                      : "verify-phone-dialog.telegram.privacy-issue.click-to-copy"
                  )}
                </Typography>
              }
            >
              <Typography
                dir="ltr"
                tag="span"
                className="hover:bg-natural-100 rounded-lg hover:cursor-pointer text-caption font-semibold text-natural-950"
                onClick={copy}
              >
                {TELEGRAM_NUMBER}
              </Typography>
            </Popover>
          ),
          value: (
            <Link to="https://web.telegram.org/a/#7479680645">
              <Typography
                dir="ltr"
                tag="span"
                className={cn(
                  "text-caption font-semibold text-brand-700",
                  'relative after:absolute after:content-["_"] after:right-0 after:left-0 after:bottom-1 after:w-full after:h-[1px] after:bg-brand-700'
                )}
              >
                @litespace_notify
              </Typography>
            </Link>
          ),
        })}
      </Typography>
      <div className="flex flex-row items-center gap-6 w-full">
        <Button
          onClick={() => resend()}
          disabled={sendingCode}
          loading={sendingCode}
          size="large"
          className="grow"
        >
          {intl("labels.try-again")}
        </Button>
        <Button
          onClick={close}
          variant="secondary"
          className="grow"
          size="large"
          disabled={sendingCode}
        >
          {intl("labels.cancel")}
        </Button>
      </div>
    </div>
  );
};

export default UnresolvedPhone;
