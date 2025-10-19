import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import { Link } from "react-router-dom";
import { Web } from "@litespace/utils/routes";
import { useSubscription } from "@litespace/headless/context/subscription";
import cn from "classnames";
import { useToast } from "@litespace/ui/Toast";
import {
  Tab,
  TxTypeDataQuery,
  TxTypePayload,
} from "@/components/Checkout/types";
import { useFindTutorInfo } from "@litespace/headless/tutor";
import Success from "@/components/Checkout/Success";
import { track } from "@/lib/analytics";
import LessonBookedDialog from "@/components/Checkout/LessonBookedDialog";

const Content: React.FC<{
  userId: number;
  userPhone: string | null;
  txTypePayload: TxTypePayload;
  tab: Tab;
  setTab(tab: Tab): void;
}> = ({ userId, txTypePayload, userPhone, tab, setTab }) => {
  const transaction = useFindLastTransaction();
  const txTypeDataQuery = useTxTypeDataQuery(txTypePayload);
  const [txStateChanged, setTxStateChanged] = useState(false);

  const logger = useLogger();
  const toast = useToast();
  const intl = useFormatMessage();
  const subscription = useSubscription();

  useOnError({
    type: "query",
    error: transaction.error,
    keys: transaction.keys,
  });

  // ====== handle transaction status updates ======
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
      setTxStateChanged(true);
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

  return (
    <div className="h-full gap-4 md:gap-8 flex flex-col items-center mt-[15vh] mx-auto">
      <Header />

      <Body
        userId={userId}
        userPhone={userPhone}
        txTypeDataQuery={txTypeDataQuery}
        tab={tab}
        setTab={setTab}
        transaction={{
          fetching: transaction.isFetching,
          loading: transaction.isLoading,
          error: transaction.isError,
          data: transaction.data || null,
          refetch: transaction.refetch,
        }}
      />

      <LessonBookedDialog
        open={
          txTypePayload.type === "paid-lesson" &&
          transaction.data?.type === ITransaction.Type.PaidLesson &&
          transaction.data?.status === ITransaction.Status.Paid &&
          txStateChanged
        }
      />
    </div>
  );
};

const Header: React.FC = () => {
  const intl = useFormatMessage();
  return (
    <Link
      onClick={() => {
        track("leave_checkout", "checkout", "user_clicked_the_logo");
      }}
      to={Web.Root}
      dir="ltr"
      className={cn(
        "flex flex-row gap-4 items-center justify-center",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500 rounded-md"
      )}
    >
      <Logo className="w-10 h-10 md:w-14 md:h-14" />
      <Typography
        tag="p"
        className="text-subtitle-2 md:text-h4 text-brand-500 font-bold"
      >
        {intl("labels.litespace")}
      </Typography>
    </Link>
  );
};

const Body: React.FC<{
  userId: number;
  userPhone: string | null;
  txTypeDataQuery: TxTypeDataQuery;
  tab: Tab;
  setTab(tab: Tab): void;
  transaction: {
    fetching: boolean;
    loading: boolean;
    error: boolean;
    data: ITransaction.Self | null;
    refetch: Void;
  };
}> = ({ userId, txTypeDataQuery, transaction, userPhone, tab, setTab }) => {
  const intl = useFormatMessage();

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

  if (
    transaction.data?.status === ITransaction.Status.Paid &&
    transaction.data.type === ITransaction.Type.PaidPlan
  )
    return <Success type={transaction.data.type} />;

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
      tab={tab}
      setTab={setTab}
    />
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
