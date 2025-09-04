import { Content } from "@/components/Plans/Content";
import React, { useCallback, useMemo } from "react";
import { usePlans } from "@litespace/headless/plans";
import { usePlanInvites } from "@litespace/headless/planInvites";
import { useOnError } from "@/hooks/error";
import { useUser } from "@litespace/headless/context/user";

const Plans: React.FC = () => {
  const { user } = useUser();

  const planInvites = usePlanInvites({
    userIds: [user?.id || 0],
    full: true,
  });

  useOnError({
    type: "query",
    error: planInvites.query.error,
    keys: planInvites.query.keys,
  });

  const plans = usePlans({
    active: true,
    forInvitesOnly: false,
    full: true,
  });

  useOnError({
    type: "query",
    error: plans.query.error,
    keys: plans.query.keys,
  });

  const plansInvitedTo = usePlans({
    ids: [
      ...(plans.query.data?.list.map((plan) => plan.id) || []),
      ...(planInvites.query.data?.list.map((invite) => invite.planId) || []),
    ],
    active: true,
    forInvitesOnly: true,
    full: true,
  });

  useOnError({
    type: "query",
    error: plansInvitedTo.query.error,
    keys: plansInvitedTo.query.keys,
  });

  const loading = useMemo(
    () =>
      planInvites.query.isLoading ||
      plans.query.isLoading ||
      plansInvitedTo.query.isLoading,
    [planInvites.query, plans.query, plansInvitedTo.query]
  );

  const error = useMemo(
    () =>
      planInvites.query.isError ||
      plans.query.isError ||
      plansInvitedTo.query.isError,
    [planInvites.query, plans.query, plansInvitedTo.query]
  );

  const data = useMemo(
    () => [
      ...(plans.query.data?.list || []),
      ...(plansInvitedTo.query.data?.list || []),
    ],
    [plans.query.data, plansInvitedTo.query.data]
  );

  const refetch = useCallback(() => {
    planInvites.query.refetch();
    plans.query.refetch();
    plansInvitedTo.query.refetch();
  }, [planInvites.query, plans.query, plansInvitedTo.query]);

  return (
    <div className="w-full p-4 md:p-4 lg:p-6 mx-auto max-w-screen-3xl">
      <Content
        loading={loading}
        error={error}
        refetch={refetch}
        list={data || []}
      />
    </div>
  );
};

export default Plans;
