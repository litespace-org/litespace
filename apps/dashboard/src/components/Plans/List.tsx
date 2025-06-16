import DateField from "@/components/Common/DateField";
import { Table, TableNaviationProps } from "@litespace/ui/Table";
import Price from "@/components/Common/Price";
import { useUpdatePlan } from "@litespace/headless/plans";
import { IPlan, Void } from "@litespace/types";
import { Menu } from "@litespace/ui/Menu";
import { useToast } from "@litespace/ui/Toast";
import { Typography } from "@litespace/ui/Typography";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { formatMinutes } from "@litespace/ui/utils";
import { createColumnHelper } from "@tanstack/react-table";
import React, { useCallback, useMemo } from "react";
import { PLAN_PERIOD_LITERAL_TO_MONTH_COUNT } from "@litespace/utils";
import { Switch } from "@litespace/ui/Switch";
import Edit from "@litespace/assets/Edit";
import { LoadingFragment } from "@/components/Common/LoadingFragment";

const List: React.FC<
  {
    list?: IPlan.FindApiResponse["list"];
    error: boolean;
    refetch: Void;
    editPlan(plan: IPlan.Self): void;
  } & TableNaviationProps
> = ({ list, refetch, error, editPlan, fetching, loading, ...naviation }) => {
  const intl = useFormatMessage();
  const toast = useToast();

  const onSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  const onError = useCallback(
    (error: Error) => {
      toast.error({
        title: intl("dashboard.plans.update-error"),
        description: error.message,
      });
    },
    [intl, toast]
  );

  const mutation = useUpdatePlan({ onSuccess, onError });

  const columnHelper = createColumnHelper<IPlan.Self>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: () => (
          <Typography tag="p" className="text-body font-bold text-natural-950">
            {intl("dashboard.plans.id")}
          </Typography>
        ),
        cell: (info) => (
          <Typography
            tag="span"
            className="text-body font-semibold text-natural-800"
          >
            {intl("labels.hash-value", { value: info.getValue() })}
          </Typography>
        ),
      }),
      columnHelper.accessor("weeklyMinutes", {
        header: () => (
          <Typography tag="p" className="text-body font-bold text-natural-950">
            {intl("dashboard.plans.weekly-minutes")}
          </Typography>
        ),
        cell: (info) => (
          <Typography
            tag="span"
            className="text-body font-semibold text-natural-800"
          >
            {formatMinutes(info.row.original.weeklyMinutes)}
          </Typography>
        ),
      }),
      columnHelper.accessor("baseMonthlyPrice", {
        header: () => (
          <Typography tag="p" className="text-body font-bold text-natural-950">
            {intl("dashboard.plans.full-month-price")}
          </Typography>
        ),
        cell: (info) => {
          return (
            <Price
              price={
                info.getValue() * PLAN_PERIOD_LITERAL_TO_MONTH_COUNT["month"]
              }
              discount={info.row.original.monthDiscount}
            />
          );
        },
      }),
      columnHelper.accessor("quarterDiscount", {
        header: () => (
          <Typography tag="p" className="text-body font-bold text-natural-950">
            {intl("dashboard.plans.full-quarter-price")}
          </Typography>
        ),

        cell: (info) => {
          return (
            <Price
              price={
                info.row.original.baseMonthlyPrice *
                PLAN_PERIOD_LITERAL_TO_MONTH_COUNT["quarter"]
              }
              discount={info.getValue()}
            />
          );
        },
      }),
      columnHelper.accessor("yearDiscount", {
        header: () => (
          <Typography tag="p" className="text-body font-bold text-natural-950">
            {intl("dashboard.plans.full-year-price")}
          </Typography>
        ),
        cell: (info) => {
          return (
            <Price
              price={
                info.row.original.baseMonthlyPrice *
                PLAN_PERIOD_LITERAL_TO_MONTH_COUNT["year"]
              }
              discount={info.getValue()}
            />
          );
        },
      }),
      columnHelper.accessor("createdAt", {
        header: () => (
          <Typography tag="p" className="text-body font-bold text-natural-950">
            {intl("dashboard.plans.created-at")}
          </Typography>
        ),
        cell: (info) => {
          return <DateField date={info.row.original.createdAt} />;
        },
      }),
      columnHelper.accessor("active", {
        id: "state",
        header: () => (
          <Typography tag="p" className="text-body font-bold text-natural-950">
            {intl("dashboard.plans.state")}
          </Typography>
        ),
        cell: (info) => (
          <Switch
            id="toggle-plan"
            checked={info.getValue()}
            onChange={(checked) =>
              mutation.mutate({
                id: info.row.original.id,
                payload: { active: checked },
              })
            }
            disabled={mutation.isPending}
          />
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: () => (
          <Typography tag="p" className="text-body font-bold text-natural-950">
            {intl("dashboard.plans.actions")}
          </Typography>
        ),
        cell: (info) => (
          <Menu
            actions={[
              {
                label: intl("dashboard.plans.actions.edit-plan"),
                icon: <Edit />,
                onClick: () => editPlan(info.row.original),
              },
            ]}
          />
        ),
      }),
    ],
    [columnHelper, intl, mutation, editPlan]
  );

  if (loading || error || !list)
    return (
      <LoadingFragment
        loading={
          loading
            ? {
                text: intl("dashboard.plans.loading"),
                size: "large",
              }
            : undefined
        }
        error={
          error
            ? {
                text: intl("dashboard.plans.error"),
                size: "medium",
              }
            : undefined
        }
        refetch={refetch}
      />
    );

  return (
    <Table
      data={list}
      columns={columns}
      loading={loading}
      fetching={fetching}
      {...naviation}
    />
  );
};

export default List;
