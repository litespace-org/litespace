import React from "react";
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
  return (
    <Tabs
      className="gap-10"
      tab="1"
      tabs={[
        {
          id: "1",
          label: intl("checkout.tabs.paywithcard"),
          view: <PayWithCardTab planId={planId} period={period} phone={phone} />,
        },
        {
          id: "2",
          label: intl("checkout.tabs.ewallet"),
          view: <PayWithEWalletTab phone={phone} />,
        },
        {
          id: "3",
          label: intl("checkout.tabs.fawry"),
          view: <PayWithFawryTab phone={phone} />,
        },
      ]}
    />
  );
};

export default TapsContainer;
