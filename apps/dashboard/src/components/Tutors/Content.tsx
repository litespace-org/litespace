import { Table } from "@litespace/ui/Table";
import dayjs from "@/lib/dayjs";
import Calendar from "@litespace/assets/Calendar";
import InfoCircle from "@litespace/assets/InfoCircle";
import Profile from "@litespace/assets/ProfileAvatar";
import UserTag from "@litespace/assets/UserTag";
import { useUpdateUser } from "@litespace/headless/user";
import { Element, ITutor, Void } from "@litespace/types";
import { AvatarV2 as Avatar } from "@litespace/ui/Avatar";
import { Loading, LoadingError } from "@litespace/ui/Loading";
import { Switch } from "@litespace/ui/Switch";
import { useToast } from "@litespace/ui/Toast";
import { Typography } from "@litespace/ui/Typography";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { createColumnHelper } from "@tanstack/react-table";
import React, { useCallback, useMemo } from "react";

export const Content: React.FC<{
  refetch: Void;
  tutors?: ITutor.FindFullTutorsApiResponse["list"];
  fetching: boolean;
  loading: boolean;
  error: boolean;
  page: number;
  totalPages: number;
  next: Void;
  prev: Void;
  goto: (pageNumber: number) => void;
}> = ({
  refetch,
  tutors,
  fetching,
  loading,
  error,
  page,
  totalPages,
  next,
  prev,
  goto,
}) => {
  const intl = useFormatMessage();
  const toast = useToast();
  const columnHelper =
    createColumnHelper<Element<ITutor.FindFullTutorsApiResponse["list"]>>();

  const onSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  const onError = useCallback(() => {
    toast.error({ title: intl("dashboard.tutors.change-tutor-state.error") });
  }, [intl, toast]);

  const update = useUpdateUser({ onSuccess, onError });

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: () => (
          <div className="flex gap-[10px]">
            <Profile className="w-6 h-6 [&>*]:stroke-natural-950" />
            <Typography
              tag="span"
              className="text-body text-natural-950 font-bold"
            >
              {intl("dashboard.tutors.table.tutor")}
            </Typography>
          </div>
        ),
        cell: (info) => (
          <div className="flex gap-2 items-center">
            <div className="rounded-full overflow-hidden w-8 h-8">
              <Avatar
                id={info.row.original.id}
                src={info.row.original.image}
                alt={info.row.original.name}
              />
            </div>
            <Typography
              tag="span"
              className="text-body text-natural-800 font-semibold "
            >
              {info.row.original.name}
            </Typography>
          </div>
        ),
      }),
      columnHelper.accessor("email", {
        header: () => (
          <div className="flex gap-[10px]">
            <UserTag className="w-6 h-6 [&>*]:stroke-natural-950" />
            <Typography
              tag="h6"
              className="text-body text-natural-950 font-bold"
            >
              {intl("dashboard.tutors.table.account")}
            </Typography>
          </div>
        ),
        cell: (info) => (
          <div className="flex gap-2 items-center">
            <Typography
              tag="h5"
              className="text-body text-natural-800 font-semibold "
            >
              {info.getValue()}
            </Typography>
          </div>
        ),
      }),
      columnHelper.accessor("createdAt", {
        header: () => (
          <div className="flex gap-[10px]">
            <Calendar className="w-6 h-6 [&>*]:stroke-natural-950" />
            <Typography
              tag="h6"
              className="text-body text-natural-950 font-bold"
            >
              {intl("dashboard.tutors.table.created-at")}
            </Typography>
          </div>
        ),
        cell: (info) => (
          <div className="flex gap-2 items-center">
            <Typography
              tag="h5"
              className="text-body text-natural-800 font-semibold "
            >
              {dayjs(info.getValue()).format("D/M/YYYY")}
            </Typography>
          </div>
        ),
      }),
      columnHelper.accessor("activated", {
        header: () => (
          <div className="flex gap-[10px]">
            <InfoCircle className="w-6 h-6 [&>*]:stroke-natural-950" />
            <Typography
              tag="h6"
              className="text-body text-natural-950 font-bold"
            >
              {intl("dashboard.tutors.table.account-state")}
            </Typography>
          </div>
        ),
        cell: (info) => (
          <Switch
            checked={info.getValue()}
            disabled={update.isPending}
            onChange={(activated) =>
              update.mutate({
                id: info.row.original.id,
                payload: { activated },
              })
            }
          />
        ),
      }),
    ],
    [columnHelper, intl, update]
  );

  if (loading)
    return (
      <div className="h-[40vh] flex items-center justify-center">
        <Loading size="medium" text={intl("dashboard.tutors.loading")} />
      </div>
    );

  if (error || !tutors)
    return (
      <div className="h-[40vh] flex items-center justify-center">
        <LoadingError
          size="medium"
          error={intl("dashboard.tutors.error")}
          retry={refetch}
        />
      </div>
    );

  return (
    <Table
      columns={columns}
      data={tutors}
      fetching={fetching}
      loading={loading}
      next={next}
      prev={prev}
      goto={goto}
      page={page}
      totalPages={totalPages}
    />
  );
};

export default Content;
