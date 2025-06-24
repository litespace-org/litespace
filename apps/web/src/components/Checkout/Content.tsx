import React, { useCallback, useEffect } from "react";
import Logo from "@litespace/assets/Logo";
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
import { useSubscription } from "@litespace/headless/context/subscription";
import cn from "classnames";
import { useToast } from "@litespace/ui/Toast";

const Content: React.FC<{
  userId: number;
  planId: number;
  period: IPlan.PeriodLiteral;
  userPhone: string | null;
}> = ({ userId, planId, period, userPhone }) => {
  const transaction = useFindLastTransaction();
  const plan = useFindPlanById(planId);
  const { info: subscription } = useSubscription();

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
    <div className="h-full gap-4 md:gap-8 flex flex-col items-center mt-0 md:mt-[8vh] lg:mt-[15vh] mx-auto">
      <Header />
      <Body
        userId={userId}
        subscribed={!!subscription}
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

const Header: React.FC = () => {
  const intl = useFormatMessage();
  return (
    <Link
      to={Web.Root}
      dir="ltr"
      className={cn(
        "flex flex-row gap-4 items-center justify-center",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500 rounded-md"
      )}
    >
      <Logo className="w-14 h-14" />
      <Typography tag="p" className="text-h4 text-brand-500 font-bold">
        {intl("labels.litespace")}
      </Typography>
    </Link>
  );
};

const Body: React.FC<{
  userId: number;
  period: IPlan.PeriodLiteral;
  userPhone: string | null;
  subscribed: boolean;
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
}> = ({ userId, plan, transaction, period, userPhone, subscribed }) => {
  const intl = useFormatMessage();
  const logger = useLogger();
  const toast = useToast();

  // =================== sync payment manually =====================
  const syncPayment = useSyncPaymentStatus({
    onSuccess() {
      transaction.refetch();
    },
  });

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
      if (payload.status === ITransaction.Status.Failed)
        toast.error({
          title: intl("checkout.transaction.failed.title"),
          description: intl("checkout.transaction.failed.desc"),
        });

      logger.debug("transaction status update", payload);
      transaction.refetch();
    },
    [intl, logger, toast, transaction]
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

  if (plan.loading || transaction.loading) return <Loading size="large" />;

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

  if (transaction.data?.status === ITransaction.Status.Paid && subscribed)
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
      userId={userId}
      plan={plan.data}
      period={period}
      phone={userPhone}
      sync={transaction.refetch}
      syncing={transaction.fetching}
      transactionId={transaction.data?.id}
      transactionStatus={transaction.data?.status}
    />
  );
};

const TransactionDone: React.FC = () => {
  const intl = useFormatMessage();
  return (
    <div className="flex flex-col gap-6 md:gap-4 items-center justify-center">
      <div className="flex flex-col md:flex-row items-center gap-2">
        <CheckCircleV2 className="w-6 h-6 stroke-brand-500" />
        <Typography tag="h1" className="text-subtitle-1 font-bold">
          {intl("checkout.payment.done")}
        </Typography>
      </div>

      <div className="flex gap-4">
        <Link to={Web.Tutors} tabIndex={-1}>
          <Button type="main" variant="primary" size="large">
            <Typography tag="span" className="text text-body font-medium">
              {intl("checkout.payment.done.book-lesson-now")}
            </Typography>
          </Button>
        </Link>
        <Link to={Web.Root} tabIndex={-1}>
          <Button type="main" variant="secondary" size="large">
            <Typography tag="span" className="text text-body font-medium">
              {intl("checkout.payment.done.main-page")}
            </Typography>
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Content;
