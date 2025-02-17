import { ActionsMenu } from "@litespace/ui/ActionsMenu";
import { Loading } from "@litespace/ui/Loading";
import { useDashFormatMessage } from "@/hooks/intl";
import { rolesMap } from "@/components/utils/user";
import { IUser, Void } from "@litespace/types";
import { UseQueryResult } from "@tanstack/react-query";
import { createColumnHelper } from "@tanstack/react-table";
import React, { useMemo } from "react";
import { Table } from "@/components/common/Table";
import BooleanField from "@/components/common/BooleanField";
import DateField from "@/components/common/DateField";
import TruncateField from "@/components/common/TruncateField";
import Error from "@/components/common/Error";
import { Link } from "react-router-dom";
import ImageField from "@/components/common/ImageField";

const List: React.FC<{
  query: UseQueryResult<IUser.FindUsersApiResponse, Error>;
  goto: (page: number) => void;
  next: Void;
  prev: Void;
  totalPages: number;
  page: number;
}> = ({ query, ...props }) => {
  const intl = useDashFormatMessage();
  const columnHelper = createColumnHelper<IUser.Self>();
  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: intl("global.labels.id"),
        cell: (info) => {
          return <Link to={`/user/${info.getValue()}`}>{info.getValue()}</Link>;
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
        cell: (info) => <BooleanField checked={info.row.original.password} />,
      }),
      columnHelper.accessor("name", {
        header: intl("dashboard.user.name"),
        cell: (info) => <TruncateField>{info.getValue()}</TruncateField>,
      }),
      columnHelper.accessor("image", {
        header: intl("dashboard.user.image"),
        cell: (info) => <ImageField name={info.getValue()} type="public" />,
      }),
      columnHelper.accessor("birthYear", {
        header: intl("dashboard.user.birthYear"),
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("gender", {
        header: intl("dashboard.user.gender"),
        cell: (info) => {
          return info.getValue() === IUser.Gender.Male ? (
            <span>&#9794;</span>
          ) : (
            <span>&#9792;</span>
          );
        },
      }),
      columnHelper.accessor("role", {
        header: intl("dashboard.user.role"),
        cell: (info) => (
          <TruncateField>{intl(rolesMap[info.getValue()])}</TruncateField>
        ),
      }),
      columnHelper.accessor("verified", {
        header: intl("dashboard.user.verified"),
        cell: (info) => <BooleanField checked={info.getValue()} />,
      }),
      columnHelper.accessor("creditScore", {
        header: intl("dashboard.user.creditScore"),
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("createdAt", {
        header: intl("global.created-at"),
        cell: (info) => <DateField date={info.getValue()} />,
      }),
      columnHelper.accessor("updatedAt", {
        header: intl("global.updated-at"),
        cell: (info) => <DateField date={info.getValue()} />,
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
                  alert("Delete user!!!");
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
        title={intl("dashboard.error.alert.title")}
        error={query.error}
        refetch={query.refetch}
      />
    );
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
