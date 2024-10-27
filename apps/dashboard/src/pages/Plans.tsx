import React from "react";
import PageTitle from "@/components/common/PageTitle";
import List from "@/components/Plans/List";
import PlanForm from "@/components/Plans/PlanForm";
import { usePlans } from "@litespace/headless/plans";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { useRender } from "@litespace/luna/hooks/common";
import cn from "classnames";

export const Plans: React.FC = () => {
  const form = useRender();
  const intl = useFormatMessage();
  const plans = usePlans();

  return (
    <div className={cn("w-full flex flex-col max-w-screen-2xl mx-auto p-6")}>
      <header className="flex items-center justify-between mb-3">
        <PageTitle
          title={intl("dashboard.plans.title")}
          count={plans.data?.length}
          fetching={plans.isFetching && !plans.isLoading}
        />
        <PlanForm
          close={form.hide}
          open={form.open}
          setOpen={form.setOpen}
          refresh={plans.refetch}
        />
      </header>
      <List query={plans} refresh={plans.refetch} />
      {/* <PlanForm open={form.open} close={form.hide} refresh={plans.refetch} /> */}
    </div>
  );
};

export default Plans;
