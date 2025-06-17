"use client";

import VodafoneCash from "@litespace/assets/VodafoneCash";
import EtisalatCash from "@litespace/assets/Etisalat";
import WeCash from "@litespace/assets/We";
import { useFormatMessage } from "@/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import React from "react";
import Visa from "@litespace/assets/Visa";
import Meeza from "@litespace/assets/Meeza";
import MasterCard from "@litespace/assets/MasterCard";
import Fawry from "@litespace/assets/Fawry";

export const PaymentMethods: React.FC = () => {
  const intl = useFormatMessage();
  return (
    <div className="flex flex-col gap-4 w-fit flex-shrink-0">
      <Typography
        tag="h4"
        className="text-subtitle-2 font-bold text-natural-950"
      >
        {intl("payment/methods")}
      </Typography>
      <div className="flex flex-col gap-2">
        <Typography
          tag="h6"
          className="text-caption font-bold text-natural-950"
        >
          {intl("payment/methods/wallet")}
        </Typography>
        <div className="flex gap-[10px] items-center">
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
          {intl("payment/methods/cards")}
        </Typography>
        <div className="flex gap-[10px] items-center">
          <Visa className="h-[27px] w-[83px] lg:h-[30px] lg:w-[91px] shrink-0" />
          <Meeza className="h-[31px] w-[64px] lg:h-[34px] lg:w-[71px] shrink-0" />
          <MasterCard className="h-[32px] w-[53px] lg:h-[36px] lg:w-[58px] shrink-0" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Typography
          tag="h6"
          className="text-caption font-bold text-natural-950"
        >
          {intl("payment/methods/fawry")}
        </Typography>
        <Fawry />
      </div>
    </div>
  );
};

export default PaymentMethods;
