import PageTitle from "@/components/Common/PageTitle";
import List from "@/components/Plans/List";
import CreatePlan from "@/components/Plans/CreatePlan";
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
  const plans = usePlans();

  return (
    <div
      className={cn("w-full flex flex-col gap-6 max-w-screen-2xl mx-auto p-6")}
    >
      <header className="flex items-center justify-between">
        <PageTitle
          title={intl("dashboard.plans.title")}
          count={plans.query.data?.total}
          fetching={plans.query.isFetching && !plans.query.isLoading}
        />
        <Button
          size="large"
          onClick={render.show}
          startIcon={<AddCircle className="icon" />}
        >
          <Typography tag="span" className="text-body font-medium text">
            {intl("dashboard.plans.create-plan-button")}
          </Typography>
        </Button>

        <CreatePlan
          open={render.open}
          close={render.hide}
          refetch={plans.query.refetch}
        />
      </header>

      <List
        list={plans.query.data?.list}
        next={plans.next}
        prev={plans.prev}
        goto={plans.goto}
        page={plans.page}
        totalPages={plans.totalPages}
        error={plans.query.isError}
        fetching={plans.query.isFetching}
        loading={plans.query.isLoading}
        refetch={plans.query.refetch}
      />
    </div>
  );
};

export default Plans;
