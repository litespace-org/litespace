import Error from "@/components/common/Error";
import { Table } from "@/components/common/Table";
import UserPopover from "@/components/common/UserPopover";
import { Loading } from "@litespace/luna/Loading";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { Element, IInterview, IUser, Paginated, Void } from "@litespace/types";
import { UseQueryResult } from "@tanstack/react-query";
import { createColumnHelper } from "@tanstack/react-table";
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
  const [interview, setInterview] = useState<IndividualInterview | null>(null);
  const tutor = useMemo(() => {
    const tutor = interview?.members.find(
      (member) => member.role === IUser.Role.Tutor
    );
    return tutor?.name || "";
  }, [interview?.members]);

  const reset = useCallback(() => {
    setInterview(null);
  }, []);

  const onSuccess = useCallback(() => {
    toast.success({
      title: intl("dashboard.interview.actions.sign.fullfilled"),
    });
    reset();
    query.query.refetch();
  }, [toast, intl, reset, query.query]);

  const onError = useCallback(() => {
    toast.error({
      title: intl("dashboard.interview.actions.sign.rejected"),
    });
  }, [toast, intl]);

  const update = useUpdateInterview({ onSuccess, onError });

  const action = useMemo(() => {
    if (!interview) return;
    return {
      label: intl("dashboard.interview.actions.sign"),
      onClick: () => {
        update.mutate({
          id: interview.interview.ids.self,
          payload: { sign: true },
        });
      },
      loading: update.isPending,
      disabled: update.isPending,
    };
  }, [interview, intl, update]);

  const columnHelper = createColumnHelper<Element<Interviews>>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("interview.ids.interviewer", {
        header: intl("dashboard.interview.ids"),
        cell: (info) => {
          const interviewer = info.row.original.interview.ids.interviewer;
          const interviewee = info.row.original.interview.ids.interviewee;
          return (
            <div>
              <UserPopover id={interviewer} />
              <UserPopover id={interviewee} />
            </div>
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
        cell: ({ row }) => {
          const superAdmin = user?.role === IUser.Role.SuperAdmin;
          const unsigned = row.original.interview.signer === null;
          const passed =
            row.original.interview.status === IInterview.Status.Passed;
          const allowed = superAdmin && unsigned && passed;
          if (!allowed) return null;
          return (
            <ActionsMenu
              actions={[
                {
                  id: 1,
                  label: intl("dashboard.interview.actions.sign"),
                  onClick() {
                    setInterview(row.original);
                  },
                },
              ]}
            />
          );
        },
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

      {interview !== null ? (
        <Dialog open close={reset} title={intl("global.sure")}>
          <Alert
            type={AlertType.Warning}
            title={intl("dashboard.interview.actions.sign")}
            action={action}
          >
            {intl("dashboard.interview.sign.label", { tutor })}
          </Alert>
        </Dialog>
      ) : null}
    </div>
  );
};

export default List;
