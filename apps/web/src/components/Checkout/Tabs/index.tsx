import React, { useMemo } from "react";
import { IPlan, Void } from "@litespace/types";
import { Tabs } from "@litespace/ui/Tabs";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import PayWithCardTab from "@/components/Checkout/Tabs/Card";
import PayWithEWalletTab from "@/components/Checkout/Tabs/EWallet";
import PayWithFawryTab from "@/components/Checkout/Tabs/Fawry";
import { useSearchParams } from "react-router-dom";

type Tab = "card" | "ewallet" | "fawry";

function isValidTab(tab: string): tab is Tab {
  return tab === "card" || tab === "ewallet" || tab === "fawry";
}

const TapsContainer: React.FC<{
  planId: number;
  period: IPlan.PeriodLiteral;
  phone: string | null;
  sync: Void;
  syncing: boolean;
}> = ({ planId, period, phone, syncing, sync }) => {
  const intl = useFormatMessage();
  const [params, setParams] = useSearchParams({});

  const tab = useMemo((): Tab => {
    const tab = params.get("tab");
    if (!tab || !isValidTab(tab)) return "card";
    return tab;
  }, [params]);

  return (
    <div>
      <div className="flex items-center justify-center mb-8">
        <Tabs<Tab>
          tab={tab}
          setTab={(tab) => setParams({ tab })}
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

      {tab === "card" ? (
        <PayWithCardTab phone={phone} period={period} planId={planId} />
      ) : null}

      {tab === "ewallet" ? (
        <PayWithEWalletTab
          phone={phone}
          period={period}
          planId={planId}
          syncing={syncing}
          sync={sync}
        />
      ) : null}

      {tab === "fawry" ? (
        <PayWithFawryTab
          phone={phone}
          period={period}
          planId={planId}
          syncing={syncing}
          sync={sync}
        />
      ) : null}
    </div>
  );
};

export default TapsContainer;
