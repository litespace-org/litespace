import Price from "@/components/Common/Price";
import { Card } from "@litespace/ui/Card";
import { useWebFormatMessage } from "@/hooks/intl";
import React from "react";
import { LocalWebId } from "@/lib/intl";

const Stat: React.FC<{
  id: LocalWebId;
  value: number;
}> = ({ id, value }) => {
  const intl = useWebFormatMessage();

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
