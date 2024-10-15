import PageTitle from "@/components/common/PageTitle";
import List from "@/components/Plans/List";
import PlanForm from "@/components/Plans/PlanForm";
import { usePlans } from "@litespace/headless/plans";
import {
  Button,
  ButtonSize,
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
        <PageTitle
          title={intl("dashboard.plans.title")}
          count={plans.data?.length}
          fetching={plans.isFetching && !plans.isLoading}
        />
        <Button onClick={form.show} size={ButtonSize.Small}>
          {intl("dashboard.plans.createPlanBtn")}
        </Button>
      </header>
      <List query={plans} refresh={plans.refetch} />
      <PlanForm open={form.open} close={form.hide} refresh={plans.refetch} />
    </div>
  );
};

export default Plans;
