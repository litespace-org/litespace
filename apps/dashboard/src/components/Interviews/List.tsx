import Error from "@/components/common/Error";
import { Table } from "@/components/common/Table";
import UserPopover from "@/components/common/UserPopover";
import { Loading } from "@litespace/ui/Loading";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Element, IInterview, IUser, Void } from "@litespace/types";
import { createColumnHelper } from "@tanstack/react-table";
import { dayjs } from "@/lib/dayjs";
import DateField from "@/components/common/DateField";
import React, { useCallback, useMemo, useState } from "react";
import { interviewStatusMap } from "@/components/utils/interview";
import { ActionsMenu } from "@litespace/ui/ActionsMenu";
import { Alert, AlertType } from "@litespace/ui/Alert";
import { useUpdateInterview } from "@litespace/headless/interviews";
import { useToast } from "@litespace/ui/Toast";
import { Dialog } from "@litespace/ui/Dialog";
import { UsePaginateResult } from "@/types/query";
import { useUserContext } from "@litespace/headless/context/user";

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
  const { user } = useUserContext();
  const [interview, setInterview] = useState<IndividualInterview | null>(null);
  const tutor = useMemo(() => {
    // const tutor = interview?.members.find(
    //   (member) => member.role === IUser.Role.Tutor
    // );
    // return tutor?.name || "";
    return "Tutor name is not in the response";
  }, []);

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
          id: interview.ids.self,
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
      columnHelper.accessor("ids.interviewer", {
        header: intl("dashboard.interview.ids"),
        cell: (info) => {
          const interviewer = info.row.original.ids.interviewer;
          const interviewee = info.row.original.ids.interviewee;
          return (
            <div>
              <UserPopover id={interviewer} />
              <UserPopover id={interviewee} />
            </div>
          );
        },
      }),
      columnHelper.accessor("start", {
        header: intl("dashboard.interview.call.start"),
        cell: (info) =>
          dayjs(info.getValue()).format("dddd D MMMM YYYY hh:mm a"),
      }),
      columnHelper.accessor("level", {
        header: intl("dashboard.interview.level"),
        cell: (info) => info.getValue() || "-",
      }),
      columnHelper.accessor("status", {
        header: intl("dashboard.interview.status"),
        cell: (info) => intl(interviewStatusMap[info.getValue()]),
      }),
      columnHelper.accessor("signer", {
        header: intl("dashboard.interview.signer"),
        cell: (info) => {
          const id = info.getValue();
          if (!id) return <div className="text-center">-</div>;
          return <UserPopover id={id} />;
        },
      }),
      columnHelper.accessor("canceledBy", {
        header: intl("dashboard.interview.canceled"),
        cell: (info) => {
          const canceledBy = info.row.original.canceledBy;
          const canceledAt = info.row.original.canceledAt;
          if (!canceledBy || !canceledAt) return "-";
          return (
            <span>
              <UserPopover id={canceledBy} /> (
              <DateField date={canceledAt} />)
            </span>
          );
        },
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
        cell: ({ row }) => {
          const superAdmin = user?.role === IUser.Role.SuperAdmin;
          const unsigned = row.original.signer === null;
          const passed = row.original.status === IInterview.Status.Passed;
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
