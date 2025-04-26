import React from "react";
import { Typography } from "@litespace/ui/Typography";
import Logo from "@litespace/assets/Logo";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import PaymentForm from "@/components/Checkout/PaymentForm";
import PlanInfo from "@/components/Checkout/PlanInfo";

const Checkout: React.FC = () => {
  const intl = useFormatMessage();

  return (
    <div className="h-full gap-6 flex flex-col items-center mt-[10%]">
      <div
        dir="ltr"
        className="flex flex-row gap-4 items-center justify-center"
      >
        <Logo className="w-14 h-14" />
        <Typography tag="p" className="text-h4 text-brand-700 font-bold">
          {intl("labels.litespace")}
        </Typography>
      </div>

      <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-10 w-full px-10">
        <div className="w-full md:flex-1 flex flex-col max-w-[464px]">
          <PaymentForm />
        </div>
        <div className="w-full md:flex-1 flex flex-col max-w-[530px]">
          <PlanInfo />
        </div>
      </div>
    </div>
  );
};

export default Checkout;
