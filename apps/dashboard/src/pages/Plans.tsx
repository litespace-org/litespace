import React from "react";
import PageTitle from "@/components/Common/PageTitle";
import List from "@/components/Plans/List";
import PlanForm from "@/components/Plans/PlanForm";
import { usePlans } from "@litespace/headless/plans";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useRender } from "@litespace/ui/hooks/common";
import cn from "classnames";

export const Plans: React.FC = () => {
  const form = useRender();
  const intl = useFormatMessage();
  const { query: plans } = usePlans();

  return (
    <div className={cn("w-full flex flex-col max-w-screen-2xl mx-auto p-6")}>
      <header className="flex items-center justify-between mb-3">
        <PageTitle
          title={intl("dashboard.plans.title")}
          count={plans.data?.list.length}
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
    </div>
  );
};

export default Plans;
