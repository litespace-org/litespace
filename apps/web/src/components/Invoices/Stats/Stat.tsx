import Price from "@/components/Common/Price";
import { Card } from "@litespace/ui/Card";
import { LocalMap } from "@litespace/ui/locales";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import React from "react";

const Stat: React.FC<{
  id: keyof LocalMap;
  value: number;
}> = ({ id, value }) => {
  const intl = useFormatMessage();

  return (
    <Card>
      <h3 className="mb-1 text-xl font-semibold text-foreground-light">
        {intl(id)}
      </h3>

      <span className="text-3xl leading-none md:text-4xl [&_.tw-change]:text-base [&_.tw-change]:text-foreground-lighter [&_.tw-currency]:text-base flex flex-row items-end">
        <Price value={value} />
      </span>
    </Card>
  );
};

export default Stat;
