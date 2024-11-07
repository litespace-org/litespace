import Error from "@/components/common/Error";
import { Table } from "@/components/common/Table";
import UserPopover from "@/components/common/UserPopover";
import { Loading } from "@litespace/luna/Loading";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { Element, IInterview, IUser, Paginated, Void } from "@litespace/types";
import { UseQueryResult } from "@tanstack/react-query";
import { createColumnHelper } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { dayjs } from "@/lib/dayjs";
import DateField from "@/components/common/DateField";
import React, { useCallback, useMemo, useState } from "react";
import { interviewStatusMap } from "@/components/utils/interview";
import { ActionsMenu } from "@litespace/luna/ActionsMenu";
import { Alert, AlertType } from "@litespace/luna/Alert";
import { useUpdateInterview } from "@litespace/headless/interviews";
import { useToast } from "@litespace/luna/Toast";
import { useAppSelector } from "@/redux/store";
import { profileSelectors } from "@/redux/user/profile";
import { Dialog } from "@litespace/luna/Dialog";

export type UsePaginateResult<T> = {
  query: UseQueryResult<Paginated<T>, Error>;
  next: Void;
  prev: Void;
  goto: (pageNumber: number) => void;
  page: number;
  totalPages: number;
};
type Interviews = IInterview.FindInterviewsApiResponse["list"];
type IndividualInterview = IInterview.FindInterviewsApiResponse["list"][number];

const List: React.FC<{
  query: UsePaginateResult<Element<Interviews>>;
  goto: (page: number) => void;
  next: Void;
  prev: Void;
  totalPages: number;
  page: number;
  refresh: Void;
}> = ({ query, ...props }) => {
  const intl = useFormatMessage();
  const toast = useToast();
  const user = useAppSelector(profileSelectors.user);
  const [activeInterview, setActiveInterview] =
    useState<IndividualInterview | null>(null);

  const resetDialog = useCallback(() => {
    setActiveInterview(null);
  }, []);

  const onSuccess = useCallback(() => {
    toast.success({
      title: intl("dashboard.interview.actions.sign.fullfilled"),
    });
    resetDialog();
    query.query.refetch();
  }, [toast, query, resetDialog, intl]);

  const onError = useCallback(() => {
    toast.error({
      title: intl("dashboard.interview.actions.sign.rejected"),
    });
    resetDialog();
  }, [toast, resetDialog, intl]);

  const updateInterview = useUpdateInterview({ onSuccess, onError });

  const action = useMemo(() => {
    if (activeInterview) {
      return {
        label: intl("dashboard.interview.actions.sign"),
        onClick: () => {
          updateInterview.mutate({
            id: activeInterview.interview.ids.self,
            payload: { sign: true },
          });
        },
        loading: updateInterview.isPending,
        disabled: updateInterview.isPending,
      };
    }
  }, [activeInterview, intl, updateInterview]);

  const columnHelper = createColumnHelper<Element<Interviews>>();

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
      columnHelper.accessor("interview.signer", {
        header: intl("dashboard.interview.signer"),
        cell: (info) => {
          const id = info.getValue();
          if (!id) return <div className="text-center">-</div>;
          return <UserPopover id={id} />;
        },
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
      columnHelper.display({
        id: "actions",
        cell: ({ row }) =>
          user?.role === IUser.Role.SuperAdmin &&
          !row.original.interview.signer &&
          row.original.interview.status !== IInterview.Status.Passed ? (
            <ActionsMenu
              actions={[
                {
                  id: 1,
                  label: intl("dashboard.interview.actions.sign"),
                  onClick() {
                    setActiveInterview(row.original);
                  },
                },
              ]}
            />
          ) : null,
      }),
    ],
    [columnHelper, intl, user]
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

      {activeInterview !== null ? (
        <Dialog
          open={!!activeInterview}
          close={resetDialog}
          title={intl("global.sure")}
        >
          <Alert
            type={AlertType.Warning}
            title={intl("dashboard.interview.actions.sign")}
            action={action}
          >
            {intl("dashboard.interview.sign.label", {
              tutor:
                activeInterview.members.find(
                  (member) => member.role === IUser.Role.Tutor
                )!.name || "",
            })}
          </Alert>
        </Dialog>
      ) : null}
    </div>
  );
};

export default List;
