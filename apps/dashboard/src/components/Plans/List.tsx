import BooleanField from "@/components/Common/BooleanField";
import DateField from "@/components/Common/DateField";
import PlanForm from "@/components/Plans/PlanForm";
import Price from "@/components/Plans/Price";
import { Table } from "@/components/Common/Table";
import { ActionsMenu } from "@litespace/ui/ActionsMenu";
import { formatMinutes } from "@litespace/ui/utils";
import { Loading } from "@litespace/ui/Loading";
import { useToast } from "@litespace/ui/Toast";
import { useFormatMessage } from "@litespace/ui/hooks/intl";

import { IPlan, Void } from "@litespace/types";
import { UseQueryResult } from "@tanstack/react-query";
import { createColumnHelper } from "@tanstack/react-table";
import React, { useCallback, useMemo, useState } from "react";
import Error from "@/components/Common/Error";
import { useDeletePlan } from "@litespace/headless/plans";

const List: React.FC<{
  query: UseQueryResult<IPlan.FindPlansApiResponse, Error>;
  refresh: Void;
}> = ({ query, refresh }) => {
  const intl = useFormatMessage();
  const [plan, setPlan] = useState<IPlan.Self | null>(null);
  const close = useCallback(() => setPlan(null), []);
  const toast = useToast();

  const onSuccess = useCallback(() => {
    toast.success({ title: intl("dashboard.plan.delete.success") });
    refresh();
  }, [intl, refresh, toast]);

  const onError = useCallback(
    (error: Error) => {
      toast.error({
        title: intl("dashboard.plan.delete.error"),
        description: error.message,
      });
    },
    [intl, toast]
  );
  const deletePlan = useDeletePlan({ onSuccess, onError });
  const columnHelper = createColumnHelper<IPlan.Self>();
  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: intl("global.labels.id"),
        cell: (info) => info.row.original.id,
      }),
      columnHelper.accessor("weeklyMinutes", {
        header: intl("dashboard.plan.weeklyMinutes"),
        cell: (info) => formatMinutes(info.row.original.weeklyMinutes),
      }),
      columnHelper.accessor("baseMonthlyPrice", {
        header: intl("dashboard.plan.fullMonthPrice"),
        cell: (info) => {
          return (
            <Price
              price={info.row.original.baseMonthlyPrice}
              discount={info.row.original.baseMonthlyPrice}
            />
          );
        },
      }),
      columnHelper.accessor("monthDiscount", {
        header: intl("dashboard.plan.fullQuarterPrice"),
        cell: (info) => {
          return (
            <Price
              price={info.row.original.baseMonthlyPrice}
              discount={info.row.original.monthDiscount}
            />
          );
        },
      }),
      columnHelper.accessor("quarterDiscount", {
        header: intl("dashboard.plan.halfYearPrice"),
        cell: (info) => {
          return (
            <Price
              price={info.row.original.quarterDiscount}
              discount={info.row.original.quarterDiscount}
            />
          );
        },
      }),
      columnHelper.accessor("yearDiscount", {
        header: intl("dashboard.plan.fullYearPrice"),
        cell: (info) => {
          return (
            <Price
              price={info.row.original.yearDiscount}
              discount={info.row.original.yearDiscount}
            />
          );
        },
      }),
      columnHelper.accessor("forInvitesOnly", {
        header: intl("dashboard.plan.forInvitesOnly"),
        cell: (info) => {
          return <BooleanField checked={info.row.original.forInvitesOnly} />;
        },
      }),
      columnHelper.accessor("active", {
        header: intl("dashboard.plan.active"),
        cell: (info) => {
          return <BooleanField checked={info.row.original.active} />;
        },
      }),
      columnHelper.accessor("createdAt", {
        header: intl("dashboard.plan.created-at"),
        cell: (info) => {
          return <DateField date={info.row.original.createdAt} />;
        },
      }),
      columnHelper.accessor("updatedAt", {
        header: intl("dashboard.plan.updated-at"),
        cell: (info) => {
          return <DateField date={info.row.original.updatedAt} />;
        },
      }),
      columnHelper.display({
        id: "actions",
        cell: (info) => (
          <ActionsMenu
            actions={[
              {
                id: 1,
                label: intl("global.labels.edit"),
                onClick() {
                  setPlan(info.row.original);
                },
              },
              {
                id: 2,
                label: intl("global.labels.delete"),
                danger: true,
                onClick: () => {
                  deletePlan.mutate(info.row.original.id);
                },
              },
            ]}
          />
        ),
      }),
    ],
    [columnHelper, deletePlan, intl]
  );

  if (query.isLoading) return <Loading className="h-1/4" />;
  if (query.error)
    return (
      <Error
        error={query.error}
        title={intl("dashboard.error.alert.title")}
        refetch={query.refetch}
      />
    );
  if (!query.data) return null;
  return (
    <div>
      <Table
        columns={columns}
        data={query.data.list}
        goto={() => {}}
        prev={() => {}}
        next={() => {}}
        totalPages={0}
        fetching={false}
        loading={false}
        page={1}
      />
      {plan ? (
        <PlanForm plan={plan} open close={close} refresh={query.refetch} />
      ) : null}
    </div>
  );
};

export default List;
