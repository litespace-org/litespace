import Price from "@/components/Plans/Price";
import Table from "@/components/Plans/Table";
import BooleanField from "@/components/common/BooleanField";
import DateField from "@/components/common/DateField";
import { ActionsMenu, Loading } from "@litespace/luna";
import { IPlan } from "@litespace/types";
import { UseQueryResult } from "@tanstack/react-query";
import { createColumnHelper } from "@tanstack/react-table";
import React, { useMemo, useState, useCallback } from "react";
import PlanForm from "./PlanForm";

const List: React.FC<{
  query: UseQueryResult<IPlan.MappedAttributes[], Error>;
}> = ({ query }) => {
  const [plan, setPlan] = useState<IPlan.MappedAttributes | null>(null);
  const close = useCallback(() => {
    setPlan(null);
  }, []);
  const columnHelper = createColumnHelper<IPlan.MappedAttributes>();
  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: "id",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("alias", {
        header: "plan name",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("weeklyMinutes", {
        header: "weeklyMinutes",
        cell: (info) => info.getValue(),
      }),

      columnHelper.accessor("fullMonthPrice", {
        header: "fullMonthPrice",
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
        header: "fullQuarterPrice",
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
        header: "halfYearPrice",
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
        header: "fullYearPrice",
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
        header: "forInvitesOnly",
        cell: (info) => {
          return <BooleanField checked={info.getValue()} />;
        },
      }),
      columnHelper.accessor("active", {
        header: "active",
        cell: (info) => {
          return <BooleanField checked={info.getValue()} />;
        },
      }),
      columnHelper.accessor("createdAt", {
        header: "createdAt",
        cell: (info) => {
          return <DateField date={info.getValue()} />;
        },
      }),
      columnHelper.accessor("updatedAt", {
        header: "updatedAt",
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
    [columnHelper]
  );

  if (query.isLoading) return <Loading className="h-1/4" />;
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
