import DateField from "@/components/Common/DateField";
import { Table } from "@/components/Common/Table";
import Price from "@/components/Plans/Price";
import CheckCircle from "@litespace/assets/CheckCircle";
import CloseCircle from "@litespace/assets/CloseCircle";
import { useUpdatePlan } from "@litespace/headless/plans";
import { IPlan, Void } from "@litespace/types";
import { Button } from "@litespace/ui/Button";
import { Loading, LoadingError } from "@litespace/ui/Loading";
import { useToast } from "@litespace/ui/Toast";
import { Typography } from "@litespace/ui/Typography";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { formatMinutes } from "@litespace/ui/utils";
import { createColumnHelper } from "@tanstack/react-table";
import React, { useCallback, useMemo } from "react";

const List: React.FC<{
  list?: IPlan.FindApiResponse["list"];
  page: number;
  totalPages: number;
  isFetching: boolean;
  isLoading: boolean;
  error: boolean;
  next: Void;
  prev: Void;
  retry: Void;
  goto: (pageNumber: number) => void;
  refetch: Void;
}> = ({
  list,
  goto,
  refetch,
  next,
  page,
  prev,
  error,
  totalPages,
  isFetching,
  isLoading,
}) => {
  const intl = useFormatMessage();
  const toast = useToast();

  const onSuccess = useCallback(() => {
    toast.success({ title: intl("dashboard.plan.update.success") });
    refetch();
  }, [intl, refetch, toast]);

  const onError = useCallback(
    (error: Error) => {
      toast.error({
        title: intl("dashboard.plan.update.error"),
        description: error.message,
      });
    },
    [intl, toast]
  );

  const mutation = useUpdatePlan({ onSuccess, onError });

  const columnHelper = createColumnHelper<IPlan.Self>();
  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: () => (
          <Typography tag="h1" className="text-body font-bold text-natural-950">
            {intl("labels.plan.id")}
          </Typography>
        ),
        cell: (info) => (
          <Typography
            tag="span"
            className="text-body font-semibold text-natural-800"
          >
            {intl("labels.hash-value", { value: info.getValue() })}
          </Typography>
        ),
      }),
      columnHelper.accessor("weeklyMinutes", {
        header: () => (
          <Typography tag="h1" className="text-body font-bold text-natural-950">
            {intl("dashboard.plan.weekly-minutes")}
          </Typography>
        ),
        cell: (info) => (
          <Typography
            tag="span"
            className="text-body font-semibold text-natural-800"
          >
            {formatMinutes(info.row.original.weeklyMinutes)}
          </Typography>
        ),
      }),
      columnHelper.accessor("baseMonthlyPrice", {
        header: () => (
          <Typography tag="h1" className="text-body font-bold text-natural-950">
            {intl("dashboard.plan.full-month-price")}
          </Typography>
        ),
        cell: (info) => {
          return (
            <Price
              price={info.getValue()}
              discount={info.row.original.monthDiscount}
            />
          );
        },
      }),
      columnHelper.accessor("quarterDiscount", {
        header: () => (
          <Typography tag="h1" className="text-body font-bold text-natural-950">
            {intl("dashboard.plan.full-quarter-price")}
          </Typography>
        ),

        cell: (info) => {
          return (
            <Price
              price={info.row.original.baseMonthlyPrice * 3}
              discount={info.getValue()}
            />
          );
        },
      }),
      columnHelper.accessor("yearDiscount", {
        header: () => (
          <Typography tag="h1" className="text-body font-bold text-natural-950">
            {intl("dashboard.plan.full-year-price")}
          </Typography>
        ),
        cell: (info) => {
          return (
            <Price
              price={info.row.original.baseMonthlyPrice * 12}
              discount={info.getValue()}
            />
          );
        },
      }),
      columnHelper.accessor("createdAt", {
        header: () => (
          <Typography tag="h1" className="text-body font-bold text-natural-950">
            {intl("dashboard.plan.created-at")}
          </Typography>
        ),
        cell: (info) => {
          return <DateField date={info.row.original.createdAt} />;
        },
      }),
      columnHelper.accessor("active", {
        id: "actions",
        header: () => (
          <Typography tag="h1" className="text-body font-bold text-natural-950">
            {intl("dashboard.table.action")}
          </Typography>
        ),
        cell: (info) => (
          <Button
            variant="secondary"
            type={info.getValue() ? "error" : "success"}
            endIcon={
              info.getValue() ? (
                <CloseCircle className="w-4 h-4 [&>*]:stroke-destructive-700 icon" />
              ) : (
                <CheckCircle className="w-4 h-4 [&>*]:stroke-brand-700 icon" />
              )
            }
            onClick={() => {
              mutation.mutate({
                id: info.row.original.id,
                payload: { active: !info.getValue() },
              });
            }}
          >
            <Typography tag="span" className="text-body font-medium">
              {info.getValue()
                ? intl("dashboard.plan.de-activate")
                : intl("dashboard.plan.activate")}
            </Typography>
          </Button>
        ),
      }),
    ],
    [columnHelper, intl, mutation]
  );

  if (isLoading)
    return (
      <div className="flex justify-center items-center mt-[15vh]">
        <Loading text={intl("dashboard.plans.loading")} size="large" />
      </div>
    );

  if (error || !list)
    return (
      <div className="flex justify-center items-center mt-[15vh]">
        <LoadingError
          error={intl("dashboard.plans.error")}
          retry={refetch}
          size="large"
        />
      </div>
    );

  return (
    <div>
      <Table
        columns={columns}
        data={list}
        goto={goto}
        prev={prev}
        next={next}
        totalPages={totalPages}
        fetching={isFetching}
        loading={isLoading}
        page={page}
      />
    </div>
  );
};

export default List;
