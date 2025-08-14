import React, { useCallback, useMemo, useState } from "react";
import { Typography } from "@litespace/ui/Typography";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Button } from "@litespace/ui/Button";
import Copy from "@litespace/assets/Copy";
import CopyCheck from "@litespace/assets/CopyCheck";
import { Void } from "@litespace/types";
import cn from "classnames";

/**
 * Split the oreder ref number into 3 parts for readability.
 *
 * @note the oreder ref number is made of 9 digits.
 */
function asParts(orderRefNum: string) {
  const ref = orderRefNum.toString();
  return [ref.substring(0, 3), ref.substring(3, 6), ref.substring(6)];
}

const Status: React.FC<{
  orderRefNum: string;
  cancel: Void;
  canceling: boolean;
  syncing: boolean;
}> = ({ orderRefNum, cancel, canceling, syncing }) => {
  const intl = useFormatMessage();
  const [copied, setCopied] = useState<boolean>(false);

  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(orderRefNum.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 1_500);
  }, [orderRefNum]);

  const parts = useMemo(() => asParts(orderRefNum), [orderRefNum]);

  return (
    <div className="flex flex-col items-center justify-center gap-6 max-w-[435px] mt-2 lg:mt-0">
      <Typography tag="h1" className="text-subtitle-1 font-bold text-center">
        {intl("checkout.status.fawry.title")}
      </Typography>

      <Typography tag="p" className="text-body font-normal text-center">
        {intl("checkout.status.fawry.description")}
      </Typography>

      <button
        className={cn(
          "flex items-center p-3 gap-2.5 bg-natural-50 rounded-xl border border-natural-700",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        )}
        onClick={copy}
      >
        {copied ? (
          <CopyCheck className="w-6 h-6 [&>*]:fill-natural-700" />
        ) : (
          <Copy className="w-6 h-6 [&>*]:stroke-natural-700" />
        )}

        <div className="flex flex-row-reverse gap-2">
          {parts.map((part, index) => (
            <Typography
              key={index}
              tag="span"
              className="text-subtitle-2 font-semibold"
            >
              {part}
            </Typography>
          ))}
        </div>
      </button>

      <Typography tag="span" className="text-tiny font-normal text-center">
        {intl("checkout.status.fawry.note")}
      </Typography>

      <Button
        type="main"
        size="large"
        htmlType="submit"
        disabled={canceling || syncing}
        loading={canceling}
        onClick={cancel}
        className="w-full sm:w-auto"
      >
        <Typography tag="span" className="text text-body font-medium">
          {intl("checkout.payment.cancel-and-retry")}
        </Typography>
      </Button>
    </div>
  );
};

export default Status;
