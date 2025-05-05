import React from "react";
import { IPlan } from "@litespace/types";
import Plan from "@/components/Checkout/Plan";
import Payment from "@/components/Checkout/Forms/Card";

const PayWithCardTab: React.FC<{
  planId: number;
  period: IPlan.PeriodLiteral;
  phone: string | null;
}> = ({ planId, period, phone }) => {
  return (
    <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-10 lg:min-w-[1004px] px-10">
      <div className="w-full md:flex-1 flex flex-col">
        <Payment planId={planId} period={period} phone={phone} />
      </div>
      <div className="w-full md:flex-1 flex flex-col">
        <Plan />
      </div>
    </div>
  );
};

export default PayWithCardTab;
