import React from "react";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import { Button } from "@litespace/ui/Button";

const PlanInfo: React.FC = () => {
  const intl = useFormatMessage();

  return (
    <div className="flex flex-col gap-4 py-6 shadow-plan-info rounded-2xl">
      <Typography tag="h1" className="text-subtitle-1 font-bold px-6">
        {intl("page.checkout.plan.summary")}
      </Typography>

      <div className="flex flex-col gap-2 px-6">
        <Typography tag="h2" className="text-subtitle-2 font-semibold">
          {intl("page.checkout.plan.period")}
        </Typography>
        <Typography
          tag="span"
          className="text-caption lg:text-body font-normal"
        >
          {intl("page.checkout.plan.month-quota", {
            hours: 8,
            minutes: 480,
          })}
        </Typography>
      </div>

      <div className="flex flex-col gap-2 py-6 border-t border-b border-natural-100">
        <div className="flex justify-between mx-6">
          <Typography
            tag="span"
            className="text-caption lg:text-body font-normal"
          >
            {intl("page.checkout.plan.month-price")}
          </Typography>
          <Typography
            tag="span"
            className="text-caption lg:text-body font-normal"
          >
            {intl("page.checkout.plan.price", { price: 2300 })}
          </Typography>
        </div>
        <div className="flex justify-between mx-6">
          <Typography
            tag="span"
            className="text-caption lg:text-body font-normal"
          >
            {intl("page.checkout.plan.total-price")}
          </Typography>
          <Typography
            tag="span"
            className="text-caption lg:text-body font-normal"
          >
            {intl("page.checkout.plan.price", { price: 2300 })}
          </Typography>
        </div>
      </div>

      <div className="flex justify-between px-6 mt-2 mb-4">
        <Typography tag="span" className="text-caption lg:text-body font-bold">
          {intl("page.checkout.plan.current-payment")}
        </Typography>
        <Typography tag="span" className="text-caption lg:text-body font-bold">
          {intl("page.checkout.plan.price", { price: 2300 })}
        </Typography>
      </div>

      <Button
        type="main"
        size="large"
        variant="secondary"
        htmlType="submit"
        className="w-full"
        disabled={false}
        loading={false}
      >
        {intl("page.checkout.plan.change-plan")}
      </Button>
    </div>
  );
};

export default PlanInfo;
