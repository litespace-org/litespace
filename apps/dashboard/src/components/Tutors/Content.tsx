import { Table } from "@/components/Common/Table";
import dayjs from "@/lib/dayjs";
import Calendar from "@litespace/assets/Calendar";
import CheckCircle from "@litespace/assets/CheckCircle";
import CloseCircle from "@litespace/assets/CloseCircle";
import Edit from "@litespace/assets/Edit";
import InfoCircle from "@litespace/assets/InfoCircle";
import Profile from "@litespace/assets/ProfileAvatar";
import UserTag from "@litespace/assets/UserTag";
import { useInvalidateQuery } from "@litespace/headless/query";
import { useUpdateUser } from "@litespace/headless/user";
import { Element, ITutor, IUser, Void } from "@litespace/types";
import { AvatarV2 as Avatar } from "@litespace/ui/Avatar";
import { Button } from "@litespace/ui/Button";
import { Loading, LoadingError } from "@litespace/ui/Loading";
import { useToast } from "@litespace/ui/Toast";
import { Typography } from "@litespace/ui/Typography";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { createColumnHelper } from "@tanstack/react-table";
import cn from "classnames";
import React, { useCallback, useMemo } from "react";

export const Content: React.FC<{
  queryKey: string[];
  tutors?: ITutor.FindFullTutorsApiResponse["list"];
  fetching: boolean;
  loading: boolean;
  error: boolean;
  page: number;
  totalPages: number;
  next: Void;
  prev: Void;
  retry: Void;
  goto: (pageNumber: number) => void;
}> = ({
  queryKey,
  tutors,
  fetching,
  loading,
  error,
  page,
  totalPages,
  next,
  prev,
  retry,
  goto,
}) => {
  const intl = useFormatMessage();
  const toast = useToast();
  const columnHelper =
    createColumnHelper<Element<ITutor.FindFullTutorsApiResponse["list"]>>();
  const invalidate = useInvalidateQuery();

  const onSuccess = useCallback(() => {
    invalidate(queryKey);
  }, [invalidate, queryKey]);

  const onError = useCallback(() => {
    toast.error({ title: intl("dashboard.tutors.change-tutor-state.error") });
  }, [intl, toast]);

  const mutation = useUpdateUser({ onSuccess, onError });

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
                src={info.row.original.image}
                alt={info.getValue()}
                id={info.row.original.id}
              />
            </div>
            <Typography
              tag="span"
              className="text-body text-natural-800 font-semibold "
            >
              {info.getValue()}
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
          <Typography
            tag="span"
            className={cn(
              "text-body font-semibold",
              info.row.original.activated
                ? "text-brand-700"
                : "text-destructive-700"
            )}
          >
            {info.row.original.activated
              ? intl("dashboard.tutors.table.activated-account")
              : intl("dashboard.tutors.table.de-activated-account")}
          </Typography>
        ),
      }),
      columnHelper.display({
        id: "action",
        header: () => (
          <div className="flex gap-[10px]">
            <Edit className="w-6 h-6 [&>*]:stroke-natural-950" />
            <Typography
              tag="h6"
              className="text-body text-natural-950 font-bold"
            >
              {intl("dashboard.tutors.table.action")}
            </Typography>
          </div>
        ),
        cell: (info) => {
          const isActivated = info.row.original.activated;
          return (
            <Button
              size="medium"
              variant="secondary"
              type={isActivated ? "error" : "success"}
              endIcon={
                isActivated ? (
                  <CloseCircle className="w-4 h-4 [&>*]:stroke-destructive-700 icon" />
                ) : (
                  <CheckCircle className="w-4 h-4 [&>*]:stroke-brand-700 icon" />
                )
              }
              onClick={() => {
                const id = info.row.original.id;

                const payload: IUser.UpdateApiPayload = {
                  activated: !isActivated,
                };
                mutation.mutate({
                  id,
                  payload,
                });
              }}
            >
              <Typography
                tag="span"
                className={cn(
                  "text-body font-medium",
                  isActivated ? "text-destructive-700" : "text-brand-700"
                )}
              >
                {isActivated
                  ? intl("dashboard.tutors.table.de-activate-account")
                  : intl("dashboard.tutors.table.activate-account")}
              </Typography>
            </Button>
          );
        },
      }),
    ],
    [columnHelper, intl, mutation]
  );

  if (loading)
    return (
      <div className="h-[40vh] flex items-center justify-center">
        <Loading size="medium" text={intl("dashboard.tutors.loading")} />
      </div>
    );

  if (error)
    return (
      <div className="h-[40vh] flex items-center justify-center">
        <LoadingError
          size="medium"
          error={intl("dashboard.tutors.error")}
          retry={retry}
        />
      </div>
    );

  if (!tutors) return;

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
      className="flex [&>*]:flex-1"
    />
  );
};

export default Content;
