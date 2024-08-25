import { IRule } from "@litespace/types";
import React from "react";
import { asRule, RuleFormatterMap, Schedule } from "@litespace/sol";
import { Button, ButtonSize, ButtonType, Card } from "@litespace/luna";
import dayjs from "@/lib/dayjs";

const Rule: React.FC<{ rule: IRule.Self; formatterMap: RuleFormatterMap }> = ({
  rule,
  formatterMap,
}) => {
  return (
    <Card className="flex flex-col">
      <h3 className="text-xl text-foreground mb-4">{rule.title}</h3>
      <p className="text-foreground-light mb-4">
        {Schedule.from(asRule(rule)).withDayjs(dayjs).format(formatterMap)}
      </p>
      <div className="flex flex-row gap-1 mt-auto">
        <Button size={ButtonSize.Tiny} type={ButtonType.Secondary}>
          Visualize
        </Button>
        <Button size={ButtonSize.Tiny} type={ButtonType.Secondary}>
          Edit
        </Button>
        <Button size={ButtonSize.Tiny} type={ButtonType.Secondary}>
          Deactivate
        </Button>
        <Button size={ButtonSize.Tiny} type={ButtonType.Error}>
          Delete
        </Button>
      </div>
    </Card>
  );
};

export default Rule;
