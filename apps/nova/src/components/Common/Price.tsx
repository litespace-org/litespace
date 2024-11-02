import { messages } from "@litespace/luna/locales";
import { price } from "@litespace/sol/value";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

const Price: React.FC<{
  value: number;
}> = ({ value }) => {
  const intl = useIntl();
  const [main, decimal, currency] = useMemo(() => {
    const unscaled = price.unscale(value);
    const main = Math.floor(unscaled);
    const decimal = unscaled - main;
    const currency = intl.formatMessage({
      id: messages["global.currency.egp"],
    });
    const formatted = new Intl.NumberFormat().format(main);
    return [formatted, decimal.toFixed(2).split(".")[1], currency];
  }, [intl, value]);

  return (
    <>
      <span dir="ltr">
        <span className="main">&nbsp;{main}</span>
        <span className="change">.{decimal}</span>
      </span>
      <span className="currency">{currency}</span>
    </>
  );
};

export default Price;
