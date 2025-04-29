import React from "react";
import Plan from "@/components/Checkout/Plan";
import Payment from "@/components/Checkout/PaymentWithEWallet";

const PayWithEWalletTab: React.FC<{
  phone: string | null;
}> = ({ phone }) => {
  return (
    <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-10 lg:min-w-[1004px] px-10">
      <div className="w-full md:flex-1 flex flex-col">
        <Payment phone={phone} />
      </div>
      <div className="w-full md:flex-1 flex flex-col">
        <Plan />
      </div>
    </div>
  );
};

export default PayWithEWalletTab;
