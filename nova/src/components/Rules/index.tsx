import { useAppSelector } from "@/redux/store";
import { userRulesSelector } from "@/redux/user/schedule";
import { Spinner, useRuleFormatterMap } from "@litespace/luna";
import Rule from "@/components/Rules/Rule";
import React from "react";

const Rules: React.FC = () => {
  const rules = useAppSelector(userRulesSelector.full);
  const formatterMap = useRuleFormatterMap();
  if (rules.loading)
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Spinner />
      </div>
    );
  if (rules.error) return <p>Impl. generic error component, with actions</p>;
  if (rules.value === null) return null;

  return (
    <div>
      {rules.value.map((rule) => (
        <Rule key={rule.id} rule={rule} formatterMap={formatterMap} />
      ))}
    </div>
  );
};

export default Rules;
