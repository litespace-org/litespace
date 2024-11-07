import { ActionsMenu } from "@litespace/luna/ActionsMenu";
import {
  Button,
  ButtonSize,
  ButtonType,
  ButtonVariant,
} from "@litespace/luna/Button";
import { Loading } from "@litespace/luna/Loading";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { rolesMap } from "@/components/utils/user";
import { IUser, Void } from "@litespace/types";
import { UseQueryResult } from "@tanstack/react-query";
import { createColumnHelper } from "@tanstack/react-table";
import React, { useMemo, useState } from "react";
import { Table } from "@/components/common/Table";
import BooleanField from "@/components/common/BooleanField";
import DateField from "@/components/common/DateField";
import TruncateField from "@/components/common/TruncateField";
import ImageDialog from "@/components/common/ImageDialog";
import Error from "@/components/common/Error";
import { Link } from "react-router-dom";

const List: React.FC<{
  query: UseQueryResult<IUser.FindUsersApiResponse, Error>;
  goto: (page: number) => void;
  next: Void;
  prev: Void;
  totalPages: number;
  page: number;
}> = ({ query, ...props }) => {
  const [image, setImage] = useState<string | null>(null);
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
        cell: (info) => {
          const value = info.getValue();
          return value ? (
            <Button
              onClick={() => setImage(value)}
              size={ButtonSize.Tiny}
              type={ButtonType.Main}
              variant={ButtonVariant.Secondary}
            >
              <TruncateField className="w-20">{value}</TruncateField>
            </Button>
          ) : (
            "-"
          );
        },
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
      columnHelper.accessor("online", {
        header: intl("dashboard.user.online"),
        cell: (info) => <BooleanField checked={info.getValue()} />,
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
      {image ? (
        <ImageDialog
          image={image}
          close={() => setImage(null)}
          open={!!image}
        />
      ) : null}
    </div>
  );
};

export default List;
