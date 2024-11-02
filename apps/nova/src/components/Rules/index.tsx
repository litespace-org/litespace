import { useAppSelector } from "@/redux/store";
import { userRulesSelector } from "@/redux/user/schedule";
import { useRuleFormatterMap } from "@litespace/luna/hooks/rule";
import { Spinner } from "@litespace/luna/icons/spinner";
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
    <div className="grid grid-cols-12 gap-4">
      {rules.value.map((rule) => (
        <div className="col-span-12 lg:col-span-4 xl:col-span-4" key={rule.id}>
          <Rule rule={rule} formatterMap={formatterMap} />
        </div>
      ))}
    </div>
  );
};

export default Rules;
