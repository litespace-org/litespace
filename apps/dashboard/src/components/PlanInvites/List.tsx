import DateField from "@/components/Common/DateField";
import { Table, TableNaviationProps } from "@litespace/ui/Table";
import { IPlanInvites, Void } from "@litespace/types";
import { Menu } from "@litespace/ui/Menu";
import { Typography } from "@litespace/ui/Typography";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { createColumnHelper } from "@tanstack/react-table";
import React, { useMemo } from "react";
import { LoadingFragment } from "@/components/Common/LoadingFragment";
import Trash from "@litespace/assets/Trash";

const List: React.FC<
  {
    list?: IPlanInvites.FindApiResponse["list"];
    error: boolean;
    refetch: Void;
    deleteInvitation(id: number): void;
  } & TableNaviationProps
> = ({
  list,
  refetch,
  error,
  deleteInvitation,
  fetching,
  loading,
  ...naviation
}) => {
  const intl = useFormatMessage();

  const columnHelper = createColumnHelper<IPlanInvites.Self>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: () => (
          <Typography tag="p" className="text-body font-bold text-natural-950">
            {intl("dashboard.plan-invites.id")}
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
      columnHelper.accessor("userId", {
        header: () => (
          <Typography tag="p" className="text-body font-bold text-natural-950">
            {intl("dashboard.plan-invites.user-id")}
          </Typography>
        ),
        cell: (info) => (
          <Typography
            tag="span"
            className="text-body font-semibold text-natural-800"
          >
            {info.row.original.userId}
          </Typography>
        ),
      }),
      columnHelper.accessor("planId", {
        header: () => (
          <Typography tag="p" className="text-body font-bold text-natural-950">
            {intl("dashboard.plan-invites.plan-id")}
          </Typography>
        ),
        cell: (info) => (
          <Typography
            tag="span"
            className="text-body font-semibold text-natural-800"
          >
            {info.row.original.planId}
          </Typography>
        ),
      }),
      columnHelper.accessor("createdBy", {
        header: () => (
          <Typography tag="p" className="text-body font-bold text-natural-950">
            {intl("dashboard.plan-invites.created-by")}
          </Typography>
        ),
        cell: (info) => (
          <Typography
            tag="span"
            className="text-body font-semibold text-natural-800"
          >
            {info.row.original.createdBy}
          </Typography>
        ),
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
                label: intl("labels.delete"),
                icon: <Trash />,
                onClick: () => deleteInvitation(info.row.original.id),
              },
            ]}
          />
        ),
      }),
    ],
    [columnHelper, intl, deleteInvitation]
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
