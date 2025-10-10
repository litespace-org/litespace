import { ActionsMenu } from "@litespace/ui/ActionsMenu";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { rolesMap } from "@/components/utils/user";
import { IUser, Void } from "@litespace/types";
import { UseQueryResult } from "@tanstack/react-query";
import { createColumnHelper } from "@tanstack/react-table";
import React, { useMemo } from "react";
import { Table } from "@litespace/ui/Table";
import BooleanField from "@/components/Common/BooleanField";
import DateTimeField from "@/components/Common/DateTimeField";
import TruncateField from "@/components/Common/TruncateField";
import { Link } from "react-router-dom";
import ImageField from "@/components/Common/ImageField";
import { LoadingFragment } from "@/components/Common/LoadingFragment";
import { NOTIFICATION_METHOD_TO_NOTIFICATION_METHOD_LITERAL } from "@litespace/utils/constants";
import { usePlans } from "@litespace/headless/plans";
import { useCreatePlanInvite } from "@litespace/headless/planInvites";
import { useUser } from "@litespace/headless/context/user";

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

  const { user } = useUser();

  const plans = usePlans();

  const createPlanInvite = useCreatePlanInvite({
    onSuccess: () => alert("Done."),
    onError: (e) => {
      alert("Failed!");
      console.error(e);
    },
  });

  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: intl("labels.id"),
        cell: (info) => {
          return (
            <Link
              to={`/user/${info.getValue()}`}
              className="underline font-bold"
            >
              {info.getValue()}
            </Link>
          );
        },
      }),
      columnHelper.accessor("name", {
        header: intl("dashboard.user.name"),
        cell: (info) => <TruncateField>{info.getValue()}</TruncateField>,
      }),
      columnHelper.accessor("email", {
        header: intl("dashboard.user.email"),
        cell: (info) => {
          return info.getValue();
        },
      }),
      columnHelper.accessor("verifiedEmail", {
        header: intl("dashboard.user.verified-email"),
        cell: (info) => <BooleanField checked={info.getValue()} />,
      }),
      columnHelper.accessor("phone", {
        header: intl("dashboard.user.phone"),
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("verifiedPhone", {
        header: intl("dashboard.user.verified-phone"),
        cell: (info) => <BooleanField checked={info.getValue()} />,
      }),
      columnHelper.accessor("password", {
        header: intl("dashboard.user.hasPassword"),
        cell: (info) => <BooleanField checked={info.row.original.password} />,
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
      columnHelper.accessor("creditScore", {
        header: intl("dashboard.user.creditScore"),
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("createdAt", {
        header: intl("global.created-at"),
        cell: (info) => <DateTimeField date={info.getValue()} />,
      }),
      columnHelper.accessor("updatedAt", {
        header: intl("global.updated-at"),
        cell: (info) => <DateTimeField date={info.getValue()} />,
      }),

      columnHelper.accessor("notificationMethod", {
        header: intl("dashboard.user.notificationMethod"),
        cell: (info) => {
          const method = info.getValue();
          if (!method) return "-";
          const literal =
            NOTIFICATION_METHOD_TO_NOTIFICATION_METHOD_LITERAL[method];
          return intl(`notification-method.${literal}`);
        },
      }),

      columnHelper.display({
        id: "actions",
        cell: ({ row }) => (
          <ActionsMenu
            actions={
              plans.query.data?.list.map((plan, i) => ({
                id: i,
                label: intl("labels.invite") + `-${plan.id}`,
                onClick() {
                  if (!user) return;

                  if (row.original.role !== IUser.Role.Student)
                    return alert("not allowed!");

                  createPlanInvite.mutate({
                    userIds: [row.original.id],
                    planId: plan.id,
                    createdBy: user.id,
                  });
                },
              })) || []
            }
          />
        ),
      }),
    ],
    [columnHelper, intl, createPlanInvite, plans.query.data, user]
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
