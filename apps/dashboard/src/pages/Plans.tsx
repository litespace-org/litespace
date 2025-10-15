import Title from "@/components/Common/Title";
import List from "@/components/Plans/List";
import ManagePlan from "@/components/Plans/ManagePlan";
import { router } from "@/lib/route";
import AddCircle from "@litespace/assets/AddCircle";
import { usePlans } from "@litespace/headless/plans";
import { IPlan, IShortUrl } from "@litespace/types";
import { Button } from "@litespace/ui/Button";
import { useRender } from "@litespace/headless/common";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import { Landing } from "@litespace/utils/routes";
import cn from "classnames";
import React, { useState } from "react";

export const Plans: React.FC = () => {
  const intl = useFormatMessage();
  const render = useRender();
  const plans = usePlans();
  const [plan, setPlan] = useState<IPlan.Self | null>(null);

  return (
    <div
      className={cn("w-full flex flex-col gap-6 max-w-screen-3xl mx-auto p-6")}
    >
      <header className="flex items-center justify-between">
        <Title
          title={intl("dashboard.plans.title")}
          count={plans.query.data?.total}
          fetching={plans.query.isFetching && !plans.query.isLoading}
          url={router.landing({
            route: Landing.ShortUrl,
            name: IShortUrl.Id.ManagePlansVideo,
            full: true,
          })}
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

        <ManagePlan
          open={render.open}
          plan={plan}
          close={() => {
            render.hide();
            setPlan(null);
          }}
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
        editPlan={(plan: IPlan.Self) => {
          setPlan(plan);
          render.show();
        }}
      />
    </div>
  );
};

export default Plans;
