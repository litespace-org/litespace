import { IPlan } from "@litespace/types";
import { Show } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { useMemo } from "react";
import TableView, { TableRow } from "@/components/TableView";

export const PlanShow = () => {
  const {
    queryResult: { data, isLoading },
  } = useShow<IPlan.MappedAttributes>({});

  const plan = useMemo(() => data?.data, [data?.data]);

  const dataSoruce: TableRow[] = useMemo(() => {
    if (!plan) return [];
    return [
      { name: "ID", value: plan.id },
      { name: "Weekly Minutes", value: plan.weeklyMinutes, type: "duration" },
      { name: "Full Month Price", value: plan.fullMonthPrice, type: "price" },
      {
        name: "Full Quarter Price",
        value: plan.fullQuarterPrice,
        type: "price",
      },
      { name: "Half-Year Price", value: plan.halfYearPrice, type: "price" },
      { name: "Full-Year Price", value: plan.fullYearPrice, type: "price" },
      {
        name: "Full Month Discount",
        value: plan.fullMonthDiscount,
        original: plan.fullMonthPrice,
        type: "discount",
      },
      {
        name: "Full Quarter Discount",
        value: plan.fullQuarterDiscount,
        original: plan.fullQuarterPrice,
        type: "discount",
      },
      {
        name: "Half-Year Discount",
        value: plan.halfYearDiscount,
        original: plan.halfYearPrice,
        type: "discount",
      },
      {
        name: "Full-Year Discount",
        value: plan.fullYearDiscount,
        original: plan.fullYearPrice,
        type: "discount",
      },
      { name: "Invites Only", value: plan.forInvitesOnly, type: "boolean" },
      { name: "Active", value: plan.active, type: "boolean" },
      { name: "Created At", value: plan.createdAt, type: "date" },
      {
        name: "Created By",
        value: plan.createdBy.email,
        href: `/users/show/${plan.createdBy.id}`,
        type: "url",
      },
      { name: "Updated At", value: plan.updatedAt, type: "date" },
      {
        name: "Updated By",
        value: plan.updatedBy.email,
        href: `/users/show/${plan.updatedBy.id}`,
        type: "url",
      },
    ];
  }, [plan]);

  return (
    <Show isLoading={isLoading} title="Plan">
      <TableView dataSource={dataSoruce} />
    </Show>
  );
};
