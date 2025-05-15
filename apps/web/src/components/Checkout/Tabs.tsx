import React, { useMemo } from "react";
import { IPlan, Void } from "@litespace/types";
import { Tabs } from "@litespace/ui/Tabs";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useSearchParams } from "react-router-dom";
import Plan from "@/components/Checkout/Plan";
import Card from "@/components/Checkout/Forms/Card";
import EWallet from "@/components/Checkout/Forms/EWallet";
import Fawry from "@/components/Checkout/Forms/Fawry";

type Tab = "card" | "ewallet" | "fawry";

function isValidTab(tab: string): tab is Tab {
  return tab === "card" || tab === "ewallet" || tab === "fawry";
}

const TapsContainer: React.FC<{
  plan: IPlan.Self;
  period: IPlan.PeriodLiteral;
  phone: string | null;
  sync: Void;
  syncing: boolean;
}> = ({ plan, period, phone, syncing, sync }) => {
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
        tab={tab}
        plan={plan}
        phone={phone}
        period={period}
        syncing={syncing}
        sync={sync}
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
    <div className="flex items-center justify-center mb-8">
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
  tab: Tab;
  plan: IPlan.Self;
  phone: string | null;
  period: IPlan.PeriodLiteral;
  syncing: boolean;
  sync: Void;
}> = ({ tab, phone, period, syncing, sync, plan }) => {
  return (
    <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-10 lg:min-w-[1004px] px-10">
      <PaymentPannel
        planId={plan.id}
        tab={tab}
        phone={phone}
        period={period}
        syncing={syncing}
        sync={sync}
      />
      <PlansPannel plan={plan} period={period} />
    </div>
  );
};

const PaymentPannel: React.FC<{
  tab: Tab;
  planId: number;
  phone: string | null;
  period: IPlan.PeriodLiteral;
  syncing: boolean;
  sync: Void;
}> = ({ tab, planId, phone, period, syncing, sync }) => {
  return (
    <div className="w-full md:flex-1 flex flex-col">
      {tab === "card" ? (
        <Card planId={planId} phone={phone} period={period} />
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
