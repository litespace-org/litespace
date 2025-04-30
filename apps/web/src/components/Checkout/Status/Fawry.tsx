import React, { useCallback } from "react";
import { Typography } from "@litespace/ui/Typography";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Button } from "@litespace/ui/Button";
import Copy from "@litespace/assets/Copy";
import { useToast } from "@litespace/ui/Toast";
import { useCancelUnpaidOrder } from "@litespace/headless/fawry";
import { useOnError } from "@/hooks/error";

const PayWithFawryStatus: React.FC<{
  orderRefNum: string;
  transactionId: number;
}> = ({ orderRefNum: refNum, transactionId }) => {
  const intl = useFormatMessage();
  const toast = useToast();

  const copyRefNum = useCallback(() => {
    navigator.clipboard.writeText(refNum);
    toast.success({ title: intl("labels.copied-successfully") });
  }, [toast, refNum, intl]);

  const onError = useOnError({
    type: "mutation",
    handler(payload) {
      toast.error({ title: intl(payload.messageId) });
    },
  });

  const cancel = useCancelUnpaidOrder({
    onSuccess() {
      window.location.reload();
    },
    onError,
  });

  return (
    <div className="flex flex-col items-center justify-center gap-6 max-w-[435px]">
      <Typography tag="h1" className="text-subtitle-2 font-bold">
        {intl("checkout.status.fawry.title")}
      </Typography>

      <Typography tag="p" className="text-body font-normal text-center">
        {intl("checkout.status.fawry.description")}
      </Typography>

      <button
        className="flex items-center p-3 gap-2.5 bg-natural-50 rounded-xl shadow-checkout-ref-num"
        onClick={copyRefNum}
      >
        <Copy width={24} height={24} />

        <div className="flex flex-row-reverse gap-2">
          <Typography tag="span" className="text-subtitle-2 font-semibold">
            {refNum.substring(0, Math.floor(refNum.length / 3))}
          </Typography>
          <Typography tag="span" className="text-subtitle-2 font-semibold">
            {refNum.substring(
              Math.floor(refNum.length / 3),
              2 * Math.floor(refNum.length / 3)
            )}
          </Typography>
          <Typography tag="span" className="text-subtitle-2 font-semibold">
            {refNum.substring(2 * Math.floor(refNum.length / 3))}
          </Typography>
        </div>
      </button>

      <Typography tag="span" className="text-tiny font-normal text-center">
        {intl("checkout.status.fawry.note")}
      </Typography>

      <Button
        type="main"
        size="large"
        htmlType="submit"
        className="w-full"
        disabled={cancel.isPending}
        loading={cancel.isPending}
        onClick={() => cancel.mutate({ transactionId })}
      >
        {intl("labels.close-and-retry")}
      </Button>
    </div>
  );
};

export default PayWithFawryStatus;
