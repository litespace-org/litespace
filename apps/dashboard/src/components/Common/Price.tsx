import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Tooltip } from "@litespace/ui/Tooltip";
import { Typography } from "@litespace/ui/Typography";
import { formatNumber, formatPercentage } from "@litespace/ui/utils";
import { price, percentage } from "@litespace/utils/value";
import React, { useMemo } from "react";

const Price: React.FC<{
  /**
   * @description unscaled price before discount.
   */
  price: number;
  /**
   * @description unscaled discount percentage.
   */
  discount: number;
}> = ({ price: priceBeforeDiscount, discount }) => {
  const intl = useFormatMessage();

  const priceAfterDiscount = useMemo(() => {
    return (priceBeforeDiscount * (100 - percentage.unscale(discount))) / 100;
  }, [discount, priceBeforeDiscount]);

  return (
    <Tooltip
      content={
        <div className="flex flex-col gap-1">
          <Typography tag="p">
            {intl("dashboard.labels.price-before-discount", {
              value: formatNumber(price.unscale(priceBeforeDiscount)),
            })}
          </Typography>
          <Typography tag="p">
            {intl("dashboard.labels.price-after-discount", {
              value: formatNumber(price.unscale(priceAfterDiscount)),
            })}
          </Typography>
          <Typography tag="p">
            {intl("dashboard.labels.price-diff", {
              value: formatNumber(
                price.unscale(priceBeforeDiscount - priceAfterDiscount)
              ),
            })}
          </Typography>
          <Typography tag="p">
            {intl("dashboard.labels.price-discount", {
              value: formatPercentage(percentage.unscale(discount)),
            })}
          </Typography>
        </div>
      }
    >
      <div className="w-fit">
        <Typography
          tag="span"
          className="text-body font-semibold text-natural-800"
        >
          {intl("dashboard.labels.price-with-discount", {
            price: formatNumber(price.unscale(priceAfterDiscount)),
            discount: formatPercentage(percentage.unscale(discount)),
          })}
        </Typography>
      </div>
    </Tooltip>
  );
};

export default Price;
