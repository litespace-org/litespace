import { IInvoice, IWithdrawMethod, Paginated, Void } from "@litespace/types";
import React, { useCallback, useState } from "react";
import { Table } from "@/components/Common/Table";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { formatCurrency } from "@litespace/ui/utils";
import { ActionsMenu } from "@litespace/ui/ActionsMenu";
import { createColumnHelper } from "@tanstack/react-table";
import { useMemo } from "react";
import DateField from "@/components/Common/DateField";
import { UseQueryResult } from "@tanstack/react-query";
import Process from "@/components/Invoices/Process";
import { Action } from "@/components/Invoices/type";
import UserPopover from "@/components/Common/UserPopover";
import {
  invoiceStatusIntlMap,
  withdrawMethodsIntlMap,
} from "@/components/utils/invoice";
import { Typography } from "@litespace/ui/Typography";
import ImageField from "@/components/Common/ImageField";

const List: React.FC<{
  data: Paginated<IInvoice.Self>;
  query: UseQueryResult<Paginated<IInvoice.Self>, Error>;
  next: Void;
  prev: Void;
  goto: (pageNumber: number) => void;
  page: number;
  totalPages: number;
}> = ({ data, query, next, prev, goto, page, totalPages }) => {
  const intl = useFormatMessage();
  const columnHelper = createColumnHelper<IInvoice.Self>();
  const [action, setAction] = useState<Action | null>(null);
  const [invoice, setInvoice] = useState<IInvoice.Self | null>(null);

  const reset = useCallback(() => setAction(null), []);

  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: intl("global.labels.id"),
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("userId", {
        header: intl("dashboard.invoices.userId"),
        cell: (info) => <UserPopover id={info.getValue()} />,
      }),
      columnHelper.accessor("method", {
        header: intl("dashboard.invoices.method"),
        cell: (info) => {
          const status = info.getValue() as IWithdrawMethod.Type;
          const value = withdrawMethodsIntlMap[status];
          return intl(value);
        },
      }),
      columnHelper.accessor("receiver", {
        header: intl("dashboard.invoices.receiver"),
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("bank", {
        header: intl("dashboard.invoices.bank"),
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("amount", {
        header: intl("dashboard.invoices.amount"),
        cell: (info) => formatCurrency(info.getValue()),
      }),
      columnHelper.accessor("status", {
        header: intl("dashboard.invoices.status"),
        cell: (info) => {
          const status = info.getValue();
          const value = invoiceStatusIntlMap[status];
          return (
            <Typography tag="span" className="truncate text-body">
              {intl(value)}
            </Typography>
          );
        },
      }),
      columnHelper.accessor("note", {
        header: intl("dashboard.invoices.note"),
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("receipt", {
        header: intl("dashboard.invoices.receipt"),
        cell: (info) => <ImageField url={info.getValue()} />,
      }),
      columnHelper.accessor("addressedBy", {
        header: intl("dashboard.invoices.addressedBy"),
        cell: (info) => {
          const id = info.getValue();
          if (!id) return "-";
          return <UserPopover id={id} />;
        },
      }),
      columnHelper.accessor("createdAt", {
        header: intl("global.created-at"),
        cell: (info) => <DateField date={info.row.original.updatedAt} />,
      }),
      columnHelper.accessor("updatedAt", {
        header: intl("global.updated-at"),
        cell: (info) => <DateField date={info.row.original.updatedAt} />,
      }),
      columnHelper.display({
        id: "actions",
        cell: (info) => {
          const status = info.row.original.status;
          const fulfilled = status === IInvoice.Status.Fulfilled;
          const canceledByReceiver =
            status === IInvoice.Status.CanceledByReceiver;
          const updatedByReceiver =
            status === IInvoice.Status.UpdatedByReceiver;
          const rejected = status === IInvoice.Status.Rejected;

          const edit = (action: Action): void => {
            setAction(action);
            setInvoice(info.row.original);
          };

          return (
            <ActionsMenu
              actions={[
                {
                  id: 1,
                  label: intl("invoices.process.actions.markAsFulfilled"),
                  disabled: fulfilled,
                  onClick: () => edit(Action.MarkAsFulfilled),
                },
                {
                  id: 2,
                  label: intl("invoices.process.actions.approveCancelRequest"),
                  disabled: !canceledByReceiver,
                  onClick: () => edit(Action.ApproveCancelRequest),
                },
                {
                  id: 3,
                  label: intl("invoices.process.actions.editNote"),
                  onClick: () => edit(Action.EditNote),
                },
                {
                  id: 4,
                  label: intl("invoices.process.actions.approveUpdateRequest"),
                  disabled: !updatedByReceiver,
                  onClick: () => edit(Action.ApproveUpdateRequest),
                },
                {
                  id: 5,
                  label: intl("invoices.process.actions.markAsRejected"),
                  danger: true,
                  disabled: rejected,
                  onClick: () => edit(Action.MarkAsRejected),
                },
              ]}
            />
          );
        },
      }),
    ],
    [columnHelper, intl]
  );

  return (
    <div className="w-full">
      <Table
        columns={columns}
        data={data.list}
        goto={goto}
        prev={prev}
        next={next}
        fetching={query.isFetching}
        loading={query.isLoading}
        totalPages={totalPages}
        page={page}
      />
      {action !== null && invoice ? (
        <Process
          open={action !== null}
          close={reset}
          onUpdate={query.refetch}
          id={invoice.id}
          status={invoice.status}
          action={action}
          note={invoice.note}
        />
      ) : null}
    </div>
  );
};

export default List;
