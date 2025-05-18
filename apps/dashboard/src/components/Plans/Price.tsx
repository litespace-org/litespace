import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import { price as scaler } from "@litespace/utils/value";
import React from "react";

const Price: React.FC<{ price: number; discount: number }> = ({
  price,
  discount,
}) => {
  const intl = useFormatMessage();

  return (
    <Typography tag="span" className="text-body font-semibold text-natural-800">
      {intl("labels.currency.egp", { value: scaler.unscale(price) })} (
      {intl("labels.percent", { value: scaler.unscale(discount) })})
    </Typography>
  );
};

export default Price;
