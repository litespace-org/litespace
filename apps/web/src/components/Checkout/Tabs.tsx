import React, { useMemo } from "react";
import { IPlan, ITransaction, Void } from "@litespace/types";
import { Tabs } from "@litespace/ui/Tabs";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useSearchParams } from "react-router-dom";
import Plan from "@/components/Checkout/Plan";
import Card from "@/components/Checkout/Forms/Card";
import EWallet from "@/components/Checkout/Forms/EWallet";
import Fawry from "@/components/Checkout/Forms/Fawry";
import PayWithPaymob from "@/components/Checkout/PayWithPaymob";
import { PLAN_PERIOD_LITERAL_TO_PLAN_PERIOD } from "@litespace/utils";
import { env } from "@/lib/env";

type Tab = "card" | "ewallet" | "fawry";

function isValidTab(tab: string): tab is Tab {
  return tab === "card" || tab === "ewallet" || tab === "fawry";
}

const TapsContainer: React.FC<{
  userId: number;
  plan: IPlan.Self;
  period: IPlan.PeriodLiteral;
  phone: string | null;
  sync: Void;
  syncing: boolean;
  transactionId?: number;
  transactionStatus?: ITransaction.Status;
}> = ({
  userId,
  plan,
  period,
  phone,
  syncing,
  sync,
  transactionId,
  transactionStatus,
}) => {
  const [params, setParams] = useSearchParams({});

  const tab = useMemo((): Tab => {
    const tab = params.get("tab");
    if (!tab || !isValidTab(tab)) return "card";
    return tab;
  }, [params]);

  return (
    <div>
      <Header tab={tab} setTab={(tab) => setParams({ tab })} />
      <Body
        userId={userId}
        tab={tab}
        plan={plan}
        phone={phone}
        period={period}
        syncing={syncing}
        sync={sync}
        transactionId={transactionId}
        transactionStatus={transactionStatus}
      />
    </div>
  );
};

const Header: React.FC<{ tab: Tab; setTab(tab: Tab): void }> = ({
  tab,
  setTab,
}) => {
  const intl = useFormatMessage();
  return (
    <div className="flex items-center justify-center md:w-fit mx-auto mb-4 md:mb-10 lg:mb-8">
      <Tabs<Tab>
        tab={tab}
        setTab={setTab}
        tabs={[
          {
            id: "card",
            label: intl("checkout.tabs.paywithcard"),
          },
          {
            id: "ewallet",
            label: intl("checkout.tabs.ewallet"),
          },
          {
            id: "fawry",
            label: intl("checkout.tabs.fawry"),
          },
        ]}
      />
    </div>
  );
};

const Body: React.FC<{
  userId: number;
  tab: Tab;
  plan: IPlan.Self;
  phone: string | null;
  period: IPlan.PeriodLiteral;
  syncing: boolean;
  sync: Void;
  transactionId?: number;
  transactionStatus?: ITransaction.Status;
}> = ({
  userId,
  tab,
  phone,
  period,
  syncing,
  sync,
  plan,
  transactionId,
  transactionStatus,
}) => {
  return (
    <div className="flex flex-col justify-center items-center w-full">
      {tab !== "fawry" && env.client !== "production" ? (
        <PayWithPaymob
          className="mb-4"
          planId={plan.id}
          planPeriod={PLAN_PERIOD_LITERAL_TO_PLAN_PERIOD[period]}
          paymentMethod={
            tab === "card"
              ? ITransaction.PaymentMethod.Card
              : ITransaction.PaymentMethod.EWallet
          }
        />
      ) : null}

      <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-6 md:gap-4 lg:gap-10 lg:min-w-[1004px] ">
        <PaymentPannel
          userId={userId}
          planId={plan.id}
          tab={tab}
          phone={phone}
          period={period}
          syncing={syncing}
          sync={sync}
          transactionId={transactionId}
          transactionStatus={transactionStatus}
        />
        <PlansPannel plan={plan} period={period} />
      </div>
    </div>
  );
};

const PaymentPannel: React.FC<{
  tab: Tab;
  userId: number;
  planId: number;
  phone: string | null;
  period: IPlan.PeriodLiteral;
  syncing: boolean;
  sync: Void;
  transactionId?: number;
  transactionStatus?: ITransaction.Status;
}> = ({
  tab,
  userId,
  planId,
  phone,
  period,
  syncing,
  sync,
  transactionId,
  transactionStatus,
}) => {
  return (
    <div className="w-full md:flex-1 flex flex-col">
      {tab === "card" ? (
        <Card
          transactionId={transactionId}
          transactionStatus={transactionStatus}
          userId={userId}
          planId={planId}
          phone={phone}
          period={period}
        />
      ) : null}

      {tab === "ewallet" ? (
        <EWallet
          planId={planId}
          phone={phone}
          period={period}
          syncing={syncing}
          sync={sync}
        />
      ) : null}

      {tab === "fawry" ? (
        <Fawry
          planId={planId}
          phone={phone}
          period={period}
          syncing={syncing}
          sync={sync}
        />
      ) : null}
    </div>
  );
};

const PlansPannel: React.FC<{
  plan: IPlan.Self;
  period: IPlan.PeriodLiteral;
}> = ({ plan, period }) => {
  return (
    <div className="w-full md:flex-1 flex flex-col">
      <Plan data={plan} period={period} />
    </div>
  );
};

export default TapsContainer;
