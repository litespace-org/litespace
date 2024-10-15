import { ActionsMenu, Loading, useFormatMessage } from "@litespace/luna";
import { IUser, Void } from "@litespace/types";
import { UseQueryResult } from "@tanstack/react-query";
import { createColumnHelper } from "@tanstack/react-table";
import React, { useMemo } from "react";
import { Table } from "./Table";
import BooleanField from "../common/BooleanField";
import DateField from "../common/DateField";

const List: React.FC<{
  query: UseQueryResult<IUser.FindUsersApiResponse, Error>;
  goto: (page: number) => void;
  next: Void;
  prev: Void;
  totalPages: number;
  page: number;
}> = ({ query, ...props }) => {
  const intl = useFormatMessage();
  const columnHelper = createColumnHelper<IUser.Self>();
  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: intl("dashboard.user.id"),
        cell: (info) => {
          return info.getValue();
        },
      }),
      columnHelper.accessor("email", {
        header: intl("dashboard.user.email"),
        cell: (info) => {
          return info.getValue();
        },
      }),
      columnHelper.accessor("password", {
        header: intl("dashboard.user.hasPassword"),
        cell: (info) => {
          return <BooleanField checked={info.row.original.password} />;
        },
      }),
      columnHelper.accessor("name", {
        header: intl("dashboard.user.name"),
        cell: (info) => info.getValue(),
      }),
      // TODO: btn to show image in dialog
      columnHelper.accessor("image", {
        header: intl("dashboard.user.image"),
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("birthYear", {
        header: intl("dashboard.user.birthYear"),
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("gender", {
        header: intl("dashboard.user.gender"),
        cell: (info) => {
          return info.getValue() === "male" ? (
            <span>&#9794;</span>
          ) : (
            <span>&#9792;</span>
          );
        },
      }),
      columnHelper.accessor("role", {
        header: intl("dashboard.user.role"),
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("online", {
        header: intl("dashboard.user.online"),
        cell: (info) => <BooleanField checked={info.row.original.online} />,
      }),
      columnHelper.accessor("verified", {
        header: intl("dashboard.user.verified"),
        cell: (info) => <BooleanField checked={info.row.original.verified} />,
      }),
      columnHelper.accessor("creditScore", {
        header: intl("dashboard.user.creditScore"),
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("createdAt", {
        header: intl("dashboard.user.createdAt"),
        cell: (info) => <DateField date={info.row.original.updatedAt} />,
      }),
      columnHelper.accessor("updatedAt", {
        header: intl("dashboard.user.updatedAt"),
        cell: (info) => <DateField date={info.row.original.updatedAt} />,
      }),
      columnHelper.display({
        id: "actions",
        cell: () => (
          <ActionsMenu
            actions={[
              {
                id: 1,
                label: intl("global.labels.edit"),
                onClick() {
                  alert("edit");
                },
              },
              {
                id: 2,
                label: intl("global.labels.delete"),
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
  if (!query.data) return null;
  return (
    <div>
      <Table
        {...props}
        columns={columns}
        data={query.data.list}
        loading={query.isLoading}
        fetching={query.isFetching}
      />
    </div>
  );
};

export default List;
