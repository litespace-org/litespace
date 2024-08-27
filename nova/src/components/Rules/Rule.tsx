import { IRule } from "@litespace/types";
import React, { useMemo } from "react";
import { asRule, RuleFormatterMap, Schedule } from "@litespace/sol";
import { Card, ActionsMenu, type MenuAction, messages } from "@litespace/luna";
import dayjs from "@/lib/dayjs";
import { useIntl } from "react-intl";
import VisualizeRule from "@/components/Rules/VisualizeRule";
import { useRender } from "@/hooks/render";
import RuleForm from "@/components/RuleForm";
import DeleteRule from "./DeleteRule";

const Rule: React.FC<{ rule: IRule.Self; formatterMap: RuleFormatterMap }> = ({
  rule,
  formatterMap,
}) => {
  const intl = useIntl();
  const visualize = useRender();
  const form = useRender();
  const deleteRule = useRender();

  const actions = useMemo((): MenuAction[] => {
    return [
      {
        id: 1,
        label: intl.formatMessage({
          id: messages["page.schedule.list.actions.visualize"],
        }),
        onClick: visualize.show,
      },
      {
        id: 2,
        label: intl.formatMessage({
          id: messages["page.schedule.list.actions.update"],
        }),
        onClick: form.show,
      },
      {
        id: 4,
        label: intl.formatMessage({
          id: messages["page.schedule.list.actions.delete"],
        }),
        onClick: deleteRule.show,
        danger: true,
      },
    ];
  }, [deleteRule.show, form.show, intl, visualize.show]);

  return (
    <Card className="flex flex-col">
      <div className="flex flex-row items-center justify-between mb-4">
        <h3 className="text-xl text-foreground ">{rule.title}</h3>
        <ActionsMenu actions={actions} />
      </div>
      <p className="text-foreground-light mb-4">
        {Schedule.from(asRule(rule)).withDayjs(dayjs).format(formatterMap)}
      </p>

      <VisualizeRule rule={rule} open={visualize.open} close={visualize.hide} />

      <RuleForm rule={rule} open={form.open} close={form.hide} />

      <DeleteRule rule={rule} open={deleteRule.open} close={deleteRule.hide} />
    </Card>
  );
};

export default Rule;
