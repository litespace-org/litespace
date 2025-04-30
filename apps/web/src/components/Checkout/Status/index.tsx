import React, { useEffect } from "react";
import { ITransaction } from "@litespace/types";
import PayWithCardStatus from "@/components/Checkout/Status/Card";
import PayWithEWalletStatus from "@/components/Checkout/Status/EWallet";
import PayWithFawryStatus from "@/components/Checkout/Status/Fawry";
import { useSyncPaymentStatus } from "@litespace/headless/fawry";
import { env } from "@/lib/env";

const StatusContainer: React.FC<{
  tx: ITransaction.Self;
}> = ({ tx }) => {
  const syncMutate = useSyncPaymentStatus({});

  useEffect(() => {
    if (env.server === "local") {
      syncMutate.mutate({ transactionId: tx.id });
    }
  }, [syncMutate, tx.id]);

  if (tx.paymentMethod === ITransaction.PaymentMethod.Card)
    return <PayWithCardStatus transactionId={tx.id} />;

  if (tx.paymentMethod === ITransaction.PaymentMethod.EWallet)
    return <PayWithEWalletStatus transactionId={tx.id} />;

  if (tx.paymentMethod === ITransaction.PaymentMethod.Fawry)
    return (
      <PayWithFawryStatus
        orderRefNum={tx.providerRefNum?.toString() || ""}
        transactionId={tx.id}
      />
    );
};

export default StatusContainer;
