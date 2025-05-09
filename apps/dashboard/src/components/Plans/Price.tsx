import { formatCurrency, formatPercentage } from "@litespace/ui/utils";
import { percentage, price as scaler } from "@litespace/utils/value";
import React from "react";

const Price: React.FC<{ price: number; discount: number }> = ({
  price,
  discount,
}) => {
  return (
    <>
      <span>
        {formatCurrency(scaler.unscale(price))}&nbsp;(
        <span>{formatPercentage(percentage.unscale(discount))}</span>)
      </span>
    </>
  );
};

export default Price;
