import Price from "@/components/Common/Price";
import { Card, LocalMap } from "@litespace/luna";
import React from "react";
import { useIntl } from "react-intl";

const Stat: React.FC<{
  id: keyof LocalMap;
  value: number;
}> = ({ id, value }) => {
  const intl = useIntl();

  return (
    <Card>
      <h3 className="font-semibold text-xl mb-1 text-foreground-light">
        {intl.formatMessage({
          id,
        })}
      </h3>

      <span className="text-3xl leading-none md:text-4xl [&_.change]:text-base [&_.change]:text-foreground-lighter [&_.currency]:text-base flex flex-row items-end">
        <Price value={value} />
      </span>
    </Card>
  );
};

export default Stat;
