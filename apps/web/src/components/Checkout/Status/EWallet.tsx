import React, { useEffect, useMemo } from "react";
import { Typography } from "@litespace/ui/Typography";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Button } from "@litespace/ui/Button";
import { getQr } from "@/lib/cache";
import { useOnError } from "@/hooks/error";
import { useCancelUnpaidOrder } from "@litespace/headless/fawry";
import { useToast } from "@litespace/ui/Toast";
import { useTransactionStatus } from "@litespace/headless/transaction";
import { ITransaction } from "@litespace/types";

const PayWithEWalletStatus: React.FC<{
  transactionId: number;
}> = ({ transactionId }) => {
  const intl = useFormatMessage();
  const toast = useToast();
  const { updates } = useTransactionStatus(transactionId);

  const qr = useMemo(() => {
    return getQr();
  }, []);

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

  useEffect(() => {
    const lastUpdate = updates.pop();
    if (!lastUpdate) return;
    if (lastUpdate.status === ITransaction.Status.Paid)
      toast.success({ title: intl("checkout.payment.succeeded") });
    else if (lastUpdate.status !== ITransaction.Status.New)
      toast.success({ title: intl("checkout.payment.failed") });
  }, [updates, toast, intl]);

  return (
    <div className="flex flex-col items-center justify-center gap-6 max-w-[435px]">
      {qr !== "" ? (
        <>
          <img src={qr || ""} width={224} height={224} className="mb-4" />

          <div className="flex flex-col gap-2">
            <Typography
              tag="h1"
              className="text-subtitle-2 font-bold text-center"
            >
              {intl("checkout.status.ewallet.title")}
            </Typography>

            <Typography tag="p" className="text-body font-normal text-center">
              {intl("checkout.status.ewallet.description")}
            </Typography>
          </div>

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
        </>
      ) : null}

      {qr === "" ? (
        <>
          <div className="flex flex-col gap-2">
            <Typography
              tag="h1"
              className="text-subtitle-2 font-bold text-center"
            >
              {intl("checkout.status.ewallet.title-2")}
            </Typography>

            <Typography tag="p" className="text-body font-normal text-center">
              {intl("checkout.status.ewallet.description-2")}
            </Typography>
          </div>

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
        </>
      ) : null}
    </div>
  );
};

export default PayWithEWalletStatus;
