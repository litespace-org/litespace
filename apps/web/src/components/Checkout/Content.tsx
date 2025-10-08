import React, { useCallback, useEffect, useMemo } from "react";
import Logo from "@litespace/assets/Logo";
import { Typography } from "@litespace/ui/Typography";
import { useFindLastTransaction } from "@litespace/headless/transaction";
import { Loading, LoadingError } from "@litespace/ui/Loading";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useOnError } from "@/hooks/error";
import StatusContainer from "@/components/Checkout/Status";
import Tabs from "@/components/Checkout/Tabs";
import { ITransaction, Void, Wss } from "@litespace/types";
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
import { TxTypeDataQuery, TxTypePayload } from "@/components/Checkout/types";
import { useFindTutorInfo } from "@litespace/headless/tutor";

const Content: React.FC<{
  userId: number;
  userPhone: string | null;
  txTypePayload: TxTypePayload;
}> = ({ userId, txTypePayload, userPhone }) => {
  const transaction = useFindLastTransaction();
  const txTypeDataQuery = useTxTypeDataQuery(txTypePayload);
  const { info: subscription } = useSubscription();

  useOnError({
    type: "query",
    error: transaction.query.error,
    keys: transaction.keys,
  });

  return (
    <div className="h-full gap-4 md:gap-8 flex flex-col items-center mt-0 md:mt-[8vh] lg:mt-[15vh] mx-auto">
      <Header />
      <Body
        userId={userId}
        subscribed={!!subscription}
        userPhone={userPhone}
        txTypeDataQuery={txTypeDataQuery}
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
  userPhone: string | null;
  subscribed: boolean;
  txTypeDataQuery: TxTypeDataQuery;
  transaction: {
    fetching: boolean;
    loading: boolean;
    error: boolean;
    data: ITransaction.Self | null;
    refetch: Void;
  };
}> = ({ userId, txTypeDataQuery, transaction, userPhone, subscribed }) => {
  const intl = useFormatMessage();
  const logger = useLogger();
  const toast = useToast();
  const subscription = useSubscription();

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
  const { socket } = useSocket();

  const onTransactionStatusUpdate = useCallback(
    (payload: Wss.EventPayload<Wss.ServerEvent.TransactionStatusUpdate>) => {
      if (payload.status === ITransaction.Status.Failed)
        toast.error({
          title: intl("checkout.transaction.failed.title"),
          description: intl("checkout.transaction.failed.desc"),
        });

      logger.debug("transaction status update", payload);
      transaction.refetch();
      subscription.refetch();
    },
    [intl, logger, toast, transaction, subscription]
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

  if (txTypeDataQuery.loading || transaction.loading)
    return <Loading size="large" />;

  if (txTypeDataQuery.error || transaction.error || !txTypeDataQuery.data)
    return (
      <LoadingError
        error={intl("checkout.loading-error")}
        size="small"
        retry={() => {
          if (txTypeDataQuery.error || !txTypeDataQuery.data)
            txTypeDataQuery.refetch();
          if (transaction.error) transaction.refetch();
        }}
      />
    );

  if (transaction.data?.status === ITransaction.Status.Paid && subscribed)
    return <TransactionDone />;

  if (transaction.data?.status === ITransaction.Status.Processed)
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
      txTypeData={txTypeDataQuery}
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

function useTxTypeDataQuery(txTypePayload: TxTypePayload): TxTypeDataQuery {
  const plan = useFindPlanById(
    txTypePayload.type === "paid-plan" ? txTypePayload.planId : undefined
  );
  const tutor = useFindTutorInfo(
    txTypePayload.type === "paid-lesson" ? txTypePayload.tutorId : undefined
  );

  useOnError({
    type: "query",
    error: plan.error,
    keys: plan.keys,
  });

  useOnError({
    type: "query",
    error: tutor.error,
    keys: tutor.keys,
  });

  return useMemo((): TxTypeDataQuery => {
    if (txTypePayload.type === "paid-lesson")
      return {
        type: "paid-lesson",
        data: {
          tutor: tutor.data,
          slotId: txTypePayload.slotId,
          start: txTypePayload.start,
          duration: txTypePayload.duration,
        },
        loading: tutor.isLoading,
        fetching: tutor.isFetching,
        error: tutor.isError,
        refetch: tutor.refetch,
      };

    return {
      type: "paid-plan",
      data: { plan: plan.data, period: txTypePayload.period },
      loading: plan.isLoading,
      fetching: tutor.isFetching,
      error: plan.isError,
      refetch: plan.refetch,
    };
  }, [
    plan.data,
    plan.isError,
    plan.isLoading,
    plan.refetch,
    tutor.data,
    tutor.isError,
    tutor.isFetching,
    tutor.isLoading,
    tutor.refetch,
    txTypePayload,
  ]);
}

export default Content;
