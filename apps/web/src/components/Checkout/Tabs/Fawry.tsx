import React from "react";
import Plan from "@/components/Checkout/Plan";
import Payment from "@/components/Checkout/Forms/Fawry";
import { IPlan, Void } from "@litespace/types";

const PayWithFawryTab: React.FC<{
  plan: IPlan.Self;
  period: IPlan.PeriodLiteral;
  phone: string | null;
  syncing: boolean;
  sync: Void;
}> = ({ phone, plan, period, syncing, sync }) => {
  return (
    <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-10 lg:min-w-[1004px] px-10">
      <div className="w-full md:flex-1 flex flex-col">
        <Payment
          phone={phone}
          planId={plan.id}
          period={period}
          syncing={syncing}
          sync={sync}
        />
      </div>
      <div className="w-full md:flex-1 flex flex-col">
        <Plan data={plan} period={period} />
      </div>
    </div>
  );
};

export default PayWithFawryTab;
