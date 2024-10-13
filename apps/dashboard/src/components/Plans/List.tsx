import BooleanField from "@/components/common/BooleanField";
import DateField from "@/components/common/DateField";
import PlanForm from "@/components/Plans/PlanForm";
import Price from "@/components/Plans/Price";
import Table from "@/components/Plans/Table";
import {
  ActionsMenu,
  formatMinutes,
  Loading,
  useFormatMessage,
} from "@litespace/luna";
import { IPlan } from "@litespace/types";
import { UseQueryResult } from "@tanstack/react-query";
import { createColumnHelper } from "@tanstack/react-table";
import React, { useCallback, useMemo, useState } from "react";
import Error from "@/components/common/Error";

const List: React.FC<{
  query: UseQueryResult<IPlan.MappedAttributes[], Error>;
}> = ({ query }) => {
  const intl = useFormatMessage();
  const [plan, setPlan] = useState<IPlan.MappedAttributes | null>(null);
  const close = useCallback(() => setPlan(null), []);
  const columnHelper = createColumnHelper<IPlan.MappedAttributes>();
  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: intl("dashboard.plan.id"),
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("alias", {
        header: intl("dashboard.plan.title"),
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("weeklyMinutes", {
        header: intl("dashboard.plan.weeklyMinutes"),
        cell: (info) => formatMinutes(info.getValue()),
      }),
      columnHelper.accessor("fullMonthPrice", {
        header: intl("dashboard.plan.fullMonthPrice"),
        cell: (info) => {
          return (
            <Price
              price={info.getValue()}
              discount={info.row.original.fullMonthDiscount}
            />
          );
        },
      }),
      columnHelper.accessor("fullQuarterPrice", {
        header: intl("dashboard.plan.fullQuarterPrice"),
        cell: (info) => {
          return (
            <Price
              price={info.getValue()}
              discount={info.row.original.fullMonthDiscount}
            />
          );
        },
      }),
      columnHelper.accessor("halfYearPrice", {
        header: intl("dashboard.plan.halfYearPrice"),
        cell: (info) => {
          return (
            <Price
              price={info.getValue()}
              discount={info.row.original.fullMonthDiscount}
            />
          );
        },
      }),
      columnHelper.accessor("fullYearPrice", {
        header: intl("dashboard.plan.fullYearPrice"),
        cell: (info) => {
          return (
            <Price
              price={info.getValue()}
              discount={info.row.original.fullMonthDiscount}
            />
          );
        },
      }),
      columnHelper.accessor("forInvitesOnly", {
        header: intl("dashboard.plan.forInvitesOnly"),
        cell: (info) => {
          return <BooleanField checked={info.getValue()} />;
        },
      }),
      columnHelper.accessor("active", {
        header: intl("dashboard.plan.active"),
        cell: (info) => {
          return <BooleanField checked={info.getValue()} />;
        },
      }),
      columnHelper.accessor("createdAt", {
        header: intl("dashboard.plan.createdAt"),
        cell: (info) => {
          return <DateField date={info.getValue()} />;
        },
      }),
      columnHelper.accessor("updatedAt", {
        header: intl("dashboard.plan.updatedAt"),
        cell: (info) => {
          return <DateField date={info.getValue()} />;
        },
      }),
      columnHelper.display({
        id: "actions",
        cell: (info) => (
          <ActionsMenu
            actions={[
              {
                id: 1,
                label: "Edit",
                onClick() {
                  setPlan(info.row.original);
                },
              },
              {
                id: 2,
                label: "Delete",
                danger: true,
                onClick() {
                  alert("Delete plan !!!");
                },
              },
            ]}
          />
        ),
      }),
    ],
    [columnHelper, intl]
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
      <Table columns={columns} data={query.data} />
      {plan ? (
        <PlanForm plan={plan} open close={close} refresh={query.refetch} />
      ) : null}
    </div>
  );
};

export default List;
