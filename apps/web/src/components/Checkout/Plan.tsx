import React from "react";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import { Button } from "@litespace/ui/Button";
import { Link } from "react-router-dom";
import { Web } from "@litespace/utils/routes";

const PlanInfo: React.FC = () => {
  const intl = useFormatMessage();

  return (
    <div className="flex flex-col gap-4 py-6 shadow-plan-info rounded-2xl">
      <Typography tag="h1" className="text-subtitle-1 font-bold px-6">
        {intl("checkout.plan.summary")}
      </Typography>

      <div className="flex flex-col gap-2 px-6">
        <Typography tag="h2" className="text-subtitle-2 font-semibold">
          {intl("checkout.plan.period")}
        </Typography>
        <Typography
          tag="span"
          className="text-caption lg:text-body font-normal"
        >
          {intl("checkout.plan.month-quota", {
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
            {intl("checkout.plan.month-price")}
          </Typography>
          <Typography
            tag="span"
            className="text-caption lg:text-body font-normal"
          >
            {intl("checkout.plan.price", { price: 2300 })}
          </Typography>
        </div>
        <div className="flex justify-between mx-6">
          <Typography
            tag="span"
            className="text-caption lg:text-body font-normal"
          >
            {intl("checkout.plan.total-price")}
          </Typography>
          <Typography
            tag="span"
            className="text-caption lg:text-body font-normal"
          >
            {intl("checkout.plan.price", { price: 2300 })}
          </Typography>
        </div>
      </div>

      <div className="flex justify-between px-6 mt-2 mb-4">
        <Typography tag="span" className="text-caption lg:text-body font-bold">
          {intl("checkout.plan.current-payment")}
        </Typography>
        <Typography tag="span" className="text-caption lg:text-body font-bold">
          {intl("checkout.plan.price", { price: 2300 })}
        </Typography>
      </div>

      <Link
        to={Web.Subscription}
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-600 rounded-lg "
      >
        <Button
          type="main"
          size="large"
          variant="secondary"
          className="w-full"
          disabled={false}
          loading={false}
          tabIndex={-1}
        >
          {intl("checkout.plan.change-plan")}
        </Button>
      </Link>
    </div>
  );
};

export default PlanInfo;
