import React, { useCallback } from "react";
import { ITransaction, Void } from "@litespace/types";
import PayWithCardStatus from "@/components/Checkout/Status/Card";
import PayWithEWalletStatus from "@/components/Checkout/Status/EWallet";
import PayWithFawryStatus from "@/components/Checkout/Status/Fawry";
import { useOnError } from "@/hooks/error";
import { useToast } from "@litespace/ui/Toast";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useCancelUnpaidOrder } from "@litespace/headless/fawry";

const StatusContainer: React.FC<{
  transactionId: number;
  paymentMethod: ITransaction.PaymentMethod;
  providerRefNum: number | null;
  syncing: boolean;
  sync: Void;
}> = ({ paymentMethod, transactionId, providerRefNum, syncing, sync }) => {
  const intl = useFormatMessage();
  const toast = useToast();

  const onError = useOnError({
    type: "mutation",
    handler(payload) {
      toast.error({
        id: "cancel-ewallet-payment",
        title: intl("checkout.payment.cancel-error"),
        description: intl(payload.messageId),
      });
    },
  });

  const cancelUnpaidOrder = useCancelUnpaidOrder({
    onError,
    onSuccess() {
      sync();
    },
  });

  const cancel = useCallback(() => {
    cancelUnpaidOrder.mutate({ transactionId });
  }, [cancelUnpaidOrder, transactionId]);

  if (paymentMethod === ITransaction.PaymentMethod.Card)
    return (
      <PayWithCardStatus
        cancel={cancel}
        canceling={cancelUnpaidOrder.isPending}
        disabled={syncing}
      />
    );

  if (paymentMethod === ITransaction.PaymentMethod.EWallet)
    return (
      <PayWithEWalletStatus
        canceling={cancelUnpaidOrder.isPending}
        disabled={syncing}
        cancel={cancel}
      />
    );

  if (paymentMethod === ITransaction.PaymentMethod.Fawry && providerRefNum)
    return (
      <PayWithFawryStatus
        orderRefNum={providerRefNum}
        canceling={cancelUnpaidOrder.isPending}
        cancel={cancel}
        syncing={syncing}
      />
    );

  throw new Error("unsupported or invalid payment method, should never happen");
};

export default StatusContainer;
