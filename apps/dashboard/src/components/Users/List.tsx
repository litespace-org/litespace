import { ActionsMenu } from "@litespace/ui/ActionsMenu";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { rolesMap } from "@/components/utils/user";
import { IUser, Void } from "@litespace/types";
import { UseQueryResult } from "@tanstack/react-query";
import { createColumnHelper } from "@tanstack/react-table";
import React, { useMemo } from "react";
import { Table } from "@/components/Common/Table";
import BooleanField from "@/components/Common/BooleanField";
import DateField from "@/components/Common/DateField";
import TruncateField from "@/components/Common/TruncateField";
import { Link } from "react-router-dom";
import ImageField from "@/components/Common/ImageField";
import { LoadingFragment } from "@/components/Common/LoadingFragment";

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
        cell: (info) => <ImageField url={info.getValue()} />,
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
      columnHelper.accessor("verifiedEmail", {
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

  if (query.isLoading || query.error)
    return (
      <LoadingFragment
        loading={{ size: "large" }}
        error={{ size: "medium" }}
        refetch={query.refetch}
      />
    );

  if (!query.data) return null;

  return (
    <Table
      {...props}
      columns={columns}
      data={query.data.list}
      loading={query.isLoading}
      fetching={query.isFetching}
    />
  );
};

export default List;
