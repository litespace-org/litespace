import { Table, TableNaviationProps } from "@litespace/ui/Table";
import { ISessionEvent, Void } from "@litespace/types";
import { Typography } from "@litespace/ui/Typography";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { createColumnHelper } from "@tanstack/react-table";
import React, { useMemo } from "react";
import { LoadingFragment } from "@/components/Common/LoadingFragment";
import DateField from "@/components/Common/DateField";
import TimeField from "@/components/Common/TimeField";

const List: React.FC<
  {
    list?: ISessionEvent.FindApiResponse["list"];
    error: boolean;
    refetch: Void;
  } & TableNaviationProps
> = ({ list, refetch, error, fetching, loading, ...naviation }) => {
  const intl = useFormatMessage();

  const columnHelper = createColumnHelper<ISessionEvent.MetaSelf>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: () => (
          <Typography tag="p" className="text-body font-bold text-natural-950">
            {intl("dashboard.session-events.id")}
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
            {intl("dashboard.session-events.user-id")}
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
      columnHelper.accessor("userName", {
        header: () => (
          <Typography tag="p" className="text-body font-bold text-natural-950">
            {intl("dashboard.session-events.username")}
          </Typography>
        ),
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("sessionStart", {
        header: () => (
          <Typography tag="p" className="text-body font-bold text-natural-950">
            {intl("dashboard.session-events.start")}
          </Typography>
        ),
        cell: (info) => {
          return <TimeField date={info.row.original.sessionStart} />;
        },
      }),
      columnHelper.accessor("createdAt", {
        header: () => (
          <Typography tag="p" className="text-body font-bold text-natural-950">
            {intl("dashboard.session-events.created-at")}
          </Typography>
        ),
        cell: (info) => {
          return <TimeField date={info.row.original.createdAt} />;
        },
      }),
    ],
    [columnHelper, intl]
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
