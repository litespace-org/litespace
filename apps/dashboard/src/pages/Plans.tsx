import PageTitle from "@/components/Common/PageTitle";
import List from "@/components/Plans/List";
import PlanForm from "@/components/Plans/PlanForm";
import AddCircle from "@litespace/assets/AddCircle";
import { usePlans } from "@litespace/headless/plans";
import { Button } from "@litespace/ui/Button";
import { useRender } from "@litespace/ui/hooks/common";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import cn from "classnames";
import React from "react";

export const Plans: React.FC = () => {
  const intl = useFormatMessage();
  const render = useRender();
  const query = usePlans();
  const { query: plans } = query;

  return (
    <div
      className={cn("w-full flex flex-col gap-6 max-w-screen-2xl mx-auto p-6")}
    >
      <header className="flex items-center justify-between">
        <PageTitle
          title={intl("dashboard.plans.title")}
          count={plans.data?.total}
          fetching={plans.isFetching && !plans.isLoading}
        />
        <Button
          size="large"
          onClick={render.show}
          endIcon={
            <AddCircle className="w-4 h-4 icon [&>*]:stroke-natural-50" />
          }
        >
          <Typography tag="span" className="text-body font-medium text">
            {intl("dashboard.plans.create-plan.title")}
          </Typography>
        </Button>
        <PlanForm
          open={render.open}
          close={render.hide}
          refetch={plans.refetch}
        />
      </header>
      <List
        list={plans.data?.list}
        next={query.next}
        prev={query.prev}
        goto={query.goto}
        retry={query.query.refetch}
        page={query.page}
        totalPages={query.totalPages}
        error={plans.isError}
        isFetching={plans.isFetching}
        isLoading={plans.isLoading}
        refetch={plans.refetch}
      />
    </div>
  );
};

export default Plans;
