import Error from "@/components/common/Error";
import { Table } from "@/components/common/Table";
import UserPopover from "@/components/common/UserPopover";
import { Loading } from "@litespace/luna/Loading";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { Element, IInterview, Paginated, Void } from "@litespace/types";
import { UseQueryResult } from "@tanstack/react-query";
import { createColumnHelper } from "@tanstack/react-table";
import React, { useMemo } from "react";
import { Link } from "react-router-dom";

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
        header: intl("dashboard.interview.interviewer.id"),
        cell: (info) => {
          return (
            <Link to={`/user/${info.getValue()}`}>
              <UserPopover id={info.row.original.interview.ids.interviewer} />
            </Link>
          );
        },
      }),
      columnHelper.accessor("interview.ids.interviewee", {
        header: intl("dashboard.interview.interviewee.id"),
        cell: (info) => {
          return (
            <Link to={`/user/${info.getValue()}`}>
              <UserPopover id={info.row.original.interview.ids.interviewee} />
            </Link>
          );
        },
      }),
      columnHelper.accessor("interview.level", {
        header: intl("dashboard.interview.level"),
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("interview.signer", {
        header: intl("dashboard.interview.signer"),
        cell: (info) => {
          if (!info.row.original.interview.signer) return;
          return (
            <Link to={`/user/${info.getValue()}`}>
              <UserPopover id={info.row.original.interview.signer} />
            </Link>
          );
        },
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
  console.log(query.query.data.list.map((item) => item.interview));
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
