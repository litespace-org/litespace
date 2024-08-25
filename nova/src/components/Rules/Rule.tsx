import { IRule } from "@litespace/types";
import React from "react";
import { asRule, RuleFormatterMap, Schedule } from "@litespace/sol";
import { Card } from "@litespace/luna";
import dayjs from "@/lib/dayjs";

const Rule: React.FC<{ rule: IRule.Self; formatterMap: RuleFormatterMap }> = ({
  rule,
  formatterMap,
}) => {
  return (
    <div>
      <Card>
        {Schedule.from(asRule(rule)).withDayjs(dayjs).format(formatterMap)}
      </Card>
    </div>
  );
};

export default Rule;
