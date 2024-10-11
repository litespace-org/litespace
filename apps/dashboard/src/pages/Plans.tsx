import List from "@/components/Plans/List";
import { atlas, useFormatMessage } from "@litespace/luna";
import { useQuery } from "@tanstack/react-query";
import React, { useCallback } from "react";
import cn from "classnames";

export const Plans: React.FC = () => {
  const intl = useFormatMessage();
  const findPlans = useCallback(async () => {
    return await atlas.plan.findAll();
  }, []);

  const plans = useQuery({ queryKey: ["plans"], queryFn: findPlans });

  return (
    <div
      className={cn(
        "w-full h-screen flex flex-col max-w-screen-2xl mx-auto p-6"
      )}
    >
      <h1>{intl("dashboard.plans.title")}</h1>
      <List query={plans} />
    </div>
  );
};

export default Plans;
