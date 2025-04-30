import React, { useState } from "react";
import { IPlan } from "@litespace/types";
import { Tabs } from "@litespace/ui/Tabs";
import { useFormatMessage } from "@litespace/ui/hooks/intl";

import PayWithCardTab from "@/components/Checkout/Tabs/Card";
import PayWithEWalletTab from "@/components/Checkout/Tabs/EWallet";
import PayWithFawryTab from "@/components/Checkout/Tabs/Fawry";

const TapsContainer: React.FC<{
  planId: number;
  period: IPlan.PeriodLiteral;
  phone: string | null;
}> = ({ planId, period, phone }) => {
  const intl = useFormatMessage();
  const [disabled, setDisabled] = useState(false);
  return (
    <Tabs
      className="gap-10"
      tab="1"
      tabs={[
        {
          id: "1",
          label: intl("checkout.tabs.paywithcard"),
          view: (
            <PayWithCardTab
              phone={phone}
              period={period}
              planId={planId}
              onStateChange={(pending) => setDisabled(pending)}
            />
          ),
        },
        {
          id: "2",
          label: intl("checkout.tabs.ewallet"),
          view: (
            <PayWithEWalletTab
              phone={phone}
              period={period}
              planId={planId}
              onStateChange={(pending) => setDisabled(pending)}
            />
          ),
        },
        {
          id: "3",
          label: intl("checkout.tabs.fawry"),
          view: (
            <PayWithFawryTab
              phone={phone}
              period={period}
              planId={planId}
              onStateChange={(pending) => setDisabled(pending)}
            />
          ),
        },
      ]}
      disabled={disabled}
    />
  );
};

export default TapsContainer;
