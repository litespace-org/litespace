import { IRule } from "@litespace/types";
import React, { useCallback, useMemo, useState } from "react";
import { asRule, RuleFormatterMap, Schedule } from "@litespace/sol";
import { Card, ActionsMenu, type MenuAction, messages } from "@litespace/luna";
import dayjs from "@/lib/dayjs";
import { useIntl } from "react-intl";
import VisualizeRule from "@/components/Rules/VisualizeRule";

const Rule: React.FC<{ rule: IRule.Self; formatterMap: RuleFormatterMap }> = ({
  rule,
  formatterMap,
}) => {
  const intl = useIntl();
  const [open, setOpen] = useState<boolean>(false);
  const hide = useCallback(() => setOpen(false), []);

  const actions = useMemo((): MenuAction[] => {
    return [
      {
        id: 1,
        label: intl.formatMessage({
          id: messages["page.schedule.list.actions.visualize"],
        }),
        onClick: () => setOpen(true),
      },
      {
        id: 2,
        label: intl.formatMessage({
          id: messages["page.schedule.list.actions.update"],
        }),
      },
      {
        id: 3,
        label: intl.formatMessage({
          id: messages["page.schedule.list.actions.deactivate"],
        }),
        danger: true,
      },
      {
        id: 4,
        label: intl.formatMessage({
          id: messages["page.schedule.list.actions.delete"],
        }),
        danger: true,
      },
    ];
  }, [intl]);

  return (
    <Card className="flex flex-col">
      <div className="flex flex-row items-center justify-between mb-4">
        <h3 className="text-xl text-foreground ">{rule.title}</h3>
        <ActionsMenu actions={actions} />
      </div>
      <p className="text-foreground-light mb-4">
        {Schedule.from(asRule(rule)).withDayjs(dayjs).format(formatterMap)}
      </p>

      <VisualizeRule rule={rule} open={open} close={hide} />
    </Card>
  );
};

export default Rule;
