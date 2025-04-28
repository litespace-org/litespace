import VodafoneCash from "@litespace/assets/VodafoneCash";
import EtisalatCash from "@litespace/assets/Etisalat";
import WeCash from "@litespace/assets/We";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import React from "react";
import Visa from "@litespace/assets/Visa";
import Meeza from "@litespace/assets/Meeza";
import MasterCard from "@litespace/assets/MasterCard";
import Fawry from "@litespace/assets/Fawry";

export const PaymentMethods: React.FC = () => {
  const intl = useFormatMessage();
  return (
    <div className="flex-1 shrink-0 flex flex-col gap-4 min-w-[276px]">
      <Typography
        tag="h4"
        className="text-subtitle-2 font-bold text-natural-950"
      >
        {intl("payment.methods")}
      </Typography>
      <div className="flex flex-col gap-2">
        <Typography
          tag="h6"
          className="text-caption font-bold text-natural-950"
        >
          {intl("payment.methods.wallet")}
        </Typography>
        <div className="flex gap-[10px]">
          <VodafoneCash />
          <EtisalatCash />
          <WeCash />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Typography
          tag="h6"
          className="text-caption font-bold text-natural-950"
        >
          {intl("payment.methods.cards")}
        </Typography>
        <div className="flex gap-[10px]">
          <Visa />
          <Meeza />
          <MasterCard />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Typography
          tag="h6"
          className="text-caption font-bold text-natural-950"
        >
          {intl("payment.methods.fawry")}
        </Typography>
        <Fawry />
      </div>
    </div>
  );
};

export default PaymentMethods;
