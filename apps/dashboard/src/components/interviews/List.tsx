import Error from "@/components/common/Error";
import { Table } from "@/components/common/Table";
import UserPopover from "@/components/common/UserPopover";
import { Loading } from "@litespace/luna/Loading";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { Element, IInterview, Paginated, Void } from "@litespace/types";
import { UseQueryResult } from "@tanstack/react-query";
import { createColumnHelper } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { dayjs } from "@/lib/dayjs";
import DateField from "@/components/common/DateField";
import React, { useMemo } from "react";
import { interviewStatusMap } from "@/components/utils/interview";

export type UsePaginateResult<T> = {
  query: UseQueryResult<Paginated<T>, Error>;
  next: Void;
  prev: Void;
  goto: (pageNumber: number) => void;
  page: number;
  totalPages: number;
};

const List: React.FC<{
  query: UsePaginateResult<
    Element<IInterview.FindInterviewsApiResponse["list"]>
  >;
  goto: (page: number) => void;
  next: Void;
  prev: Void;
  totalPages: number;
  page: number;
  refresh: Void;
}> = ({ query, ...props }) => {
  const intl = useFormatMessage();
  const columnHelper =
    createColumnHelper<Element<IInterview.FindInterviewsApiResponse["list"]>>();
  const columns = useMemo(
    () => [
      columnHelper.accessor("interview.ids.interviewer", {
        header: intl("dashboard.interview.ids"),
        cell: (info) => {
          const interviewer = info.row.original.interview.ids.interviewer;
          const interviewee = info.row.original.interview.ids.interviewee;
          const signer = info.row.original.interview.signer;
          return (
            <span className="text-brand-link">
              <Link to={`/user/${interviewer}`}>
                <UserPopover id={interviewer} />
              </Link>
              &nbsp;/&nbsp;
              <Link to={`/user/${interviewee}`}>
                <UserPopover id={interviewee} />
              </Link>{" "}
              &nbsp;/&nbsp;
              {signer ? (
                <Link to={`/user/${signer}`}>
                  <UserPopover id={signer} />
                </Link>
              ) : (
                "-"
              )}
            </span>
          );
        },
      }),
      columnHelper.accessor("call.start", {
        header: intl("dashboard.interview.call.start"),
        cell: (info) =>
          dayjs(info.getValue()).format("dddd D MMMM YYYY hh:mm a"),
      }),
      columnHelper.accessor("interview.level", {
        header: intl("dashboard.interview.level"),
        cell: (info) => info.getValue() || "-",
      }),
      columnHelper.accessor("interview.status", {
        header: intl("dashboard.interview.status"),
        cell: (info) => intl(interviewStatusMap[info.getValue()]),
      }),
      columnHelper.accessor("call.canceledBy", {
        header: intl("dashboard.interview.canceled"),
        cell: (info) => {
          const canceledBy = info.row.original.call.canceledBy;
          const canceledAt = info.row.original.call.canceledAt;
          if (!canceledBy || !canceledAt) return "-";
          return (
            <span>
              <UserPopover id={canceledBy} /> (
              <DateField date={canceledAt} />)
            </span>
          );
        },
      }),
      columnHelper.accessor("interview.createdAt", {
        header: intl("global.created-at"),
        cell: (info) => <DateField date={info.getValue()} />,
      }),
      columnHelper.accessor("interview.updatedAt", {
        header: intl("global.updated-at"),
        cell: (info) => <DateField date={info.getValue()} />,
      }),
    ],
    [columnHelper, intl]
  );

  if (query.query.isLoading) return <Loading className="h-1/4" />;

  if (query.query.error)
    return (
      <Error
        title={intl("dashboard.error.alert.title")}
        error={query.query.error}
        refetch={query.query.refetch}
      />
    );

  if (!query.query.data) return null;

  return (
    <div>
      <Table
        {...props}
        columns={columns}
        data={query.query.data.list}
        loading={query.query.isLoading}
        fetching={query.query.isFetching}
      />
    </div>
  );
};

export default List;
