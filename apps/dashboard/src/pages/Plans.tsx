import List from "@/components/Plans/List";
import PlanForm from "@/components/Plans/PlanForm";
import { usePlans } from "@litespace/headless/plans";
import {
  Button,
  ButtonSize,
  Spinner,
  useFormatMessage,
  useRender,
} from "@litespace/luna";
import cn from "classnames";
import React from "react";

export const Plans: React.FC = () => {
  const form = useRender();
  const intl = useFormatMessage();
  const plans = usePlans();

  return (
    <div className={cn("w-full flex flex-col max-w-screen-2xl mx-auto p-6")}>
      <header className="flex justify-between items-center mb-3">
        <div className="flex flex-row items-center gap-4">
          <h1 className="text-2xl">{intl("dashboard.plans.title")}</h1>
          {plans.isFetching && !plans.isLoading ? <Spinner /> : null}
        </div>

        <Button onClick={form.show} size={ButtonSize.Small}>
          {intl("dashboard.plans.createPlanBtn")}
        </Button>
      </header>
      <List query={plans} />
      <PlanForm open={form.open} close={form.hide} refresh={plans.refetch} />
    </div>
  );
};

export default Plans;
