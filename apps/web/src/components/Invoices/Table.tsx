import dayjs from "@/lib/dayjs";
import { formatBankString } from "@/lib/format";
import AlertCircle from "@litespace/assets/AlertCircle";
import Calendar from "@litespace/assets/Calendar";
import DollarCircle from "@litespace/assets/DollarCircle";
import EmptyInvoices from "@litespace/assets/EmptyInvoices";
import Trash from "@litespace/assets/Trash";
import Wallet from "@litespace/assets/Wallet";
import { IInvoice, Void } from "@litespace/types";
import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Loading, LoadingError } from "@litespace/ui/Loading";
import { LocalId } from "@litespace/ui/locales";
import {
  Table as InvoicesTable,
  TableNaviationProps,
} from "@litespace/ui/Table";
import { Typography } from "@litespace/ui/Typography";
import { formatNumber } from "@litespace/ui/utils";
import { price } from "@litespace/utils";
import { createColumnHelper } from "@tanstack/react-table";
import cn from "classnames";
import { isEmpty } from "lodash";
import React, { SVGProps, useMemo } from "react";

const METHODS_MAP: Record<IInvoice.WithdrawMethod, LocalId> = {
  [IInvoice.WithdrawMethod.Instapay]: "withdraw.methods.instapay",
  [IInvoice.WithdrawMethod.Bank]: "withdraw.methods.bank",
  [IInvoice.WithdrawMethod.Wallet]: "withdraw.methods.wallet",
};

const STATUSES_MAP: Record<IInvoice.Status, LocalId> = {
  [IInvoice.Status.PendingApproval]: "invoices.withdrawal.status.pending",
  [IInvoice.Status.Approved]: "invoices.withdrawal.status.fulfilled",
  [IInvoice.Status.Rejected]: "invoices.withdrawal.status.rejected",
  [IInvoice.Status.PendingCancellation]:
    "invoices.withdrawal.status.canceled-by-receiver",
  [IInvoice.Status.Canceled]:
    "invoices.withdrawal.status.cancellation-approved-by-admin",
};

export const Table: React.FC<{
  data?: Array<IInvoice.Self>;
  error: boolean;
  pagination: TableNaviationProps;
  setId: (val: number) => void;
  refetch: Void;
}> = ({ data, error, pagination, setId, refetch }) => {
  const intl = useFormatMessage();
  const columnHelper = createColumnHelper<IInvoice.Self>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("createdAt", {
        header: () => (
          <ColumnHead Icon={Calendar} title={intl("invoices.table.date")} />
        ),
        cell: (info) => (
          <Typography
            tag="p"
            className="text-natural-800 text-body font-semibold"
          >
            {dayjs(info.getValue()).format("dddd D/M/YYYY")}
          </Typography>
        ),
      }),
      columnHelper.accessor("amount", {
        header: () => (
          <ColumnHead
            Icon={DollarCircle}
            title={intl("invoices.table.amount")}
          />
        ),
        cell: (info) => (
          <Typography
            tag="p"
            className="text-natural-800 font-semibold text-body"
          >
            {intl("labels.currency.egp", {
              value: formatNumber(price.unscale(info.getValue())),
            })}
          </Typography>
        ),
      }),
      columnHelper.accessor("method", {
        header: () => (
          <ColumnHead Icon={Wallet} title={intl("invoices.table.method")} />
        ),
        cell: (info) => (
          <div className="flex flex-col gap-[10px]">
            <Typography
              tag="p"
              className="text-body font-semibold text-natural-800"
            >
              {intl(METHODS_MAP[info.getValue()])}
            </Typography>
            <Typography
              tag="p"
              className="text-body font-semibold text-natural-800"
            >
              {info.getValue() !== IInvoice.WithdrawMethod.Bank
                ? info.row.original.receiver
                : formatBankString(info.row.original.receiver)}
            </Typography>
          </div>
        ),
      }),
      columnHelper.accessor("status", {
        header: () => (
          <ColumnHead
            Icon={AlertCircle}
            title={intl("invoices.table.request-state")}
          />
        ),
        cell: (info) => (
          <div className="flex justify-between">
            <Typography
              tag="p"
              className={cn("text-body font-semibold", {
                "text-brand-700": info.getValue() === IInvoice.Status.Approved,
                "text-warning-600":
                  info.getValue() === IInvoice.Status.PendingApproval,
                "text-natural-800":
                  info.getValue() === IInvoice.Status.PendingCancellation,
                "text-destructive-700":
                  info.getValue() === IInvoice.Status.Rejected,
              })}
            >
              {intl(STATUSES_MAP[info.getValue()])}
            </Typography>
            {info.getValue() === IInvoice.Status.PendingApproval ? (
              <Button
                size="medium"
                type="natural"
                variant="primary"
                startIcon={<Trash className="icon w-4 h-4 stroke-[1.5]" />}
                onClick={() => setId(info.row.original.id)}
              />
            ) : null}
          </div>
        ),
      }),
    ],
    [columnHelper, intl, setId]
  );

  if (pagination.loading)
    return (
      <div className="mt-[10vh]">
        <Loading text={intl("invoices.table.loading")} size="large" />;
      </div>
    );

  if (error)
    return (
      <div className="mt-[10vh]">
        <LoadingError error={intl("invoices.table.error")} retry={refetch} />
      </div>
    );

  if (isEmpty(data) || !data) return <EmptyList />;

  return <InvoicesTable data={data} columns={columns} {...pagination} />;
};

const ColumnHead = ({
  Icon,
  title,
}: {
  Icon: React.MemoExoticComponent<
    (props: SVGProps<SVGSVGElement>) => JSX.Element
  >;
  title: string;
}) => (
  <div className="flex gap-[10px] items-center">
    <Icon className="w-6 h-6 [&>*]:stroke-natural-950 [&>*>*]:stroke-natural-950" />
    <Typography
      tag="p"
      className="text-natural-950 font-semibold text-subtitle-2"
    >
      {title}
    </Typography>
  </div>
);

const EmptyList = () => {
  const intl = useFormatMessage();
  return (
    <div className="flex flex-col gap-6 items-center pt-[10vh]">
      <EmptyInvoices />
      <div className="flex flex-col gap-2 items-center">
        <Typography
          tag="p"
          className="text-natural-950 text-subtitle-1 font-semibold"
        >
          {intl("invoices.table.empty")}
        </Typography>
      </div>
    </div>
  );
};

export default Table;
