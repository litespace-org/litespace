import { useFormatMessage } from "@/hooks";
import { price } from "@litespace/sol";
import React, { useMemo } from "react";

const Price: React.FC<{
  value: number;
}> = ({ value }) => {
  const intl = useFormatMessage();
  const [main, decimal, currency] = useMemo(() => {
    const unscaled = price.unscale(value);
    const main = Math.floor(unscaled);
    const decimal = unscaled - main;
    const currency = intl("global.currency.egp");
    const formatted = new Intl.NumberFormat().format(main);
    return [formatted, decimal.toFixed(2).split(".")[1], currency];
  }, [intl, value]);

  return (
    <>
      <span dir="ltr">
        <span className="tw-main">&nbsp;{main}</span>
        <span className="tw-change">.{decimal}</span>
      </span>
      <span className="tw-currency">{currency}</span>
    </>
  );
};

export default Price;
