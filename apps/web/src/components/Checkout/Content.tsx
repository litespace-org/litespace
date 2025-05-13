import React, { useCallback, useEffect } from "react";
import Logo from "@litespace/assets/LogoV3";
import { Typography } from "@litespace/ui/Typography";
import { useFindLastTransaction } from "@litespace/headless/transaction";
import { Loading, LoadingError } from "@litespace/ui/Loading";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useOnError } from "@/hooks/error";
import StatusContainer from "@/components/Checkout/Status";
import Tabs from "@/components/Checkout/Tabs";
import { IPlan, ITransaction, Void, Wss } from "@litespace/types";
import { useFindPlanById } from "@litespace/headless/plans";
import { useHotkeys } from "react-hotkeys-hook";
import { useSyncPaymentStatus } from "@litespace/headless/fawry";
import { env } from "@/lib/env";
import { useSocket } from "@litespace/headless/socket";
import { useLogger } from "@litespace/headless/logger";
import { Button } from "@litespace/ui/Button";
import CheckCircleV2 from "@litespace/assets/CheckCircleV2";
import { Link } from "react-router-dom";
import { Web } from "@litespace/utils/routes";

const Content: React.FC<{
  planId: number;
  period: IPlan.PeriodLiteral;
  userPhone: string | null;
}> = ({ planId, period, userPhone }) => {
  const transaction = useFindLastTransaction();
  const plan = useFindPlanById(planId);

  useOnError({
    type: "query",
    error: transaction.query.error,
    keys: transaction.keys,
  });

  useOnError({
    type: "query",
    error: plan.query.error,
    keys: plan.keys,
  });

  return (
    <div className="h-full gap-8 flex flex-col items-center mt-[15vh]">
      <Header />
      <Body
        userPhone={userPhone}
        period={period}
        plan={{
          loading: plan.query.isLoading,
          error: plan.query.isError,
          data: plan.query.data,
          refetch: plan.query.refetch,
        }}
        transaction={{
          fetching: transaction.query.isFetching,
          loading: transaction.query.isLoading,
          error: transaction.query.isError,
          data: transaction.query.data || null,
          refetch: transaction.query.refetch,
        }}
      />
    </div>
  );
};

export default Content;

const Header: React.FC = () => {
  const intl = useFormatMessage();
  return (
    <div dir="ltr" className="flex flex-row gap-4 items-center justify-center">
      <Logo className="w-14 h-14 fill-brand-500" />
      <Typography tag="p" className="text-h4 text-brand-500 font-bold">
        {intl("labels.litespace")}
      </Typography>
    </div>
  );
};

const Body: React.FC<{
  period: IPlan.PeriodLiteral;
  userPhone: string | null;
  plan: {
    loading: boolean;
    error: boolean;
    data?: IPlan.Self;
    refetch: Void;
  };
  transaction: {
    fetching: boolean;
    loading: boolean;
    error: boolean;
    data: ITransaction.Self | null;
    refetch: Void;
  };
}> = ({ plan, transaction, period, userPhone }) => {
  const intl = useFormatMessage();
  const logger = useLogger();
  // =================== sync payment manually =====================
  const syncPayment = useSyncPaymentStatus({});

  useHotkeys(
    "ctrl+s",
    () => {
      if (!transaction.data) return;
      syncPayment.mutate({ transactionId: transaction.data.id });
    },
    {
      preventDefault: true,
      enabled: !!transaction.data && env.client !== "production",
    },
    [transaction.data, syncPayment]
  );

  useHotkeys(
    "ctrl+f",
    () => {
      window
        .open(
          "https://developer.fawrystaging.com/public/pay-order/index.php",
          "_blank"
        )
        ?.focus();
    },
    {
      preventDefault: true,
      enabled: env.client !== "production",
    }
  );

  // =================== handle transaction status updates =====================
  const socket = useSocket();

  const onTransactionStatusUpdate = useCallback(
    (payload: Wss.EventPayload<Wss.ServerEvent.TransactionStatusUpdate>) => {
      logger.debug("transaction status update", payload);
      transaction.refetch();
    },
    [logger, transaction]
  );

  useEffect(() => {
    socket?.on(
      Wss.ServerEvent.TransactionStatusUpdate,
      onTransactionStatusUpdate
    );

    return () => {
      socket?.off(
        Wss.ServerEvent.TransactionStatusUpdate,
        onTransactionStatusUpdate
      );
    };
  }, [onTransactionStatusUpdate, socket]);

  if (plan.loading || transaction.loading) return <Loading size="small" />;

  if (plan.error || transaction.error || !plan.data)
    return (
      <LoadingError
        error={intl("checkout.loading-error")}
        size="small"
        retry={() => {
          if (plan.error || !plan.data) plan.refetch();
          if (transaction.error) transaction.refetch();
        }}
      />
    );

  if (transaction.data?.status === ITransaction.Status.Paid)
    return <TransactionDone />;

  if (transaction.data?.status === ITransaction.Status.New)
    return (
      <StatusContainer
        transactionId={transaction.data.id}
        paymentMethod={transaction.data.paymentMethod}
        providerRefNum={transaction.data.providerRefNum}
        sync={transaction.refetch}
        syncing={transaction.fetching}
      />
    );

  return (
    <Tabs
      plan={plan.data}
      period={period}
      phone={userPhone}
      sync={transaction.refetch}
      syncing={transaction.fetching}
    />
  );
};

const TransactionDone: React.FC = () => {
  const intl = useFormatMessage();
  return (
    <div className="flex flex-col gap-4 items-center justify-center">
      <div className="flex items-center gap-2">
        <CheckCircleV2 className="w-6 h-6 stroke-brand-500" />
        <Typography tag="h1" className="text-subtitle-2 font-bold">
          {intl("checkout.payment.done")}
        </Typography>
      </div>

      <div className="flex gap-4">
        <Link to={Web.Tutors}>
          <Button
            type="main"
            variant="primary"
            size="large"
            htmlType="submit"
            className="w-[209.5px]"
          >
            {intl("checkout.payment.done.book-lesson-now")}
          </Button>
        </Link>
        <Link to={Web.Root}>
          <Button
            type="main"
            variant="secondary"
            size="large"
            htmlType="submit"
            className="w-[209.5px]"
          >
            {intl("checkout.payment.done.main-page")}
          </Button>
        </Link>
      </div>
    </div>
  );
};
