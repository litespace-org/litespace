import PageTitle from "@/components/Common/PageTitle";
import List from "@/components/PlanInvites/List";
import { router } from "@/lib/route";
import { IShortUrl } from "@litespace/types";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Landing } from "@litespace/utils/routes";
import cn from "classnames";
import React from "react";
import {
  useDeletePlanInvite,
  usePlanInvites,
} from "@litespace/headless/planInvites";

export const Plans: React.FC = () => {
  const intl = useFormatMessage();

  const plans = usePlanInvites();

  const deletePlanInvite = useDeletePlanInvite({
    onSuccess: () => {
      alert("Deleted.");
      plans.query.refetch();
    },
    onError: (e) => {
      alert("Failed!");
      console.error(e);
    },
  });

  return (
    <div
      className={cn("w-full flex flex-col gap-6 max-w-screen-3xl mx-auto p-6")}
    >
      <header className="flex items-center justify-between">
        <PageTitle
          title={intl("dashboard.plan-invites.title")}
          count={plans.query.data?.total}
          fetching={plans.query.isFetching && !plans.query.isLoading}
          url={router.landing({
            route: Landing.ShortUrl,
            name: IShortUrl.Id.ManagePlansVideo,
            full: true,
          })}
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
        deleteInvitation={(id: number) => {
          deletePlanInvite.mutate(id);
        }}
      />
    </div>
  );
};

export default Plans;
