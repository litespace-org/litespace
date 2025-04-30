import React from "react";
import Plan from "@/components/Checkout/Plan";
import Payment from "@/components/Checkout/Forms/EWallet";
import { IPlan } from "@litespace/types";

const PayWithEWalletTab: React.FC<{
  planId: number;
  period: IPlan.PeriodLiteral;
  phone: string | null;
  onStateChange: (pending: boolean) => void;
}> = ({ phone, planId, period, onStateChange }) => {
  return (
    <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-10 lg:min-w-[1004px] px-10">
      <div className="w-full md:flex-1 flex flex-col">
        <Payment
          phone={phone}
          planId={planId}
          period={period}
          onStateChange={onStateChange}
        />
      </div>
      <div className="w-full md:flex-1 flex flex-col">
        <Plan />
      </div>
    </div>
  );
};

export default PayWithEWalletTab;
