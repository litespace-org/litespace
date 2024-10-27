import { IInvoice, IWithdrawMethod, Paginated, Void } from "@litespace/types";
import React, { useCallback, useState } from "react";
import { Table } from "@/components/common/Table";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { LocalId } from "@litespace/luna/locales";
import { formatCurrency } from "@litespace/luna/utils";
import { ActionsMenu } from "@litespace/luna/ActionsMenu";
import { createColumnHelper } from "@tanstack/react-table";
import { useMemo } from "react";
import DateField from "@/components/common/DateField";
import { UseQueryResult } from "@tanstack/react-query";
import Process from "@/components/Invoices/Process";
import { Action } from "@/components/Invoices/type";

const withdrawMethods: Record<IWithdrawMethod.Type, LocalId> = {
  wallet: "withdraw.methods.wallet",
  instapay: "withdraw.methods.instapay",
  bank: "withdraw.methods.bank",
};

const StatusDescriptions: Record<IInvoice.Status, LocalId> = {
  [IInvoice.Status.Pending]: "invoices.admin.status.pending",
  [IInvoice.Status.UpdatedByReceiver]:
    "invoices.admin.status.updated-by-receiver",
  [IInvoice.Status.CanceledByReceiver]:
    "invoices.admin.status.canceled-by-receiver",
  [IInvoice.Status.CancellationApprovedByAdmin]:
    "invoices.admin.status.canceled-by-admin",
  [IInvoice.Status.Fulfilled]: "invoices.admin.status.fulfilled",
  [IInvoice.Status.Rejected]: "invoices.admin.status.rejected",
};

const List: React.FC<{
  invoicesList: Paginated<IInvoice.Self>;
  query: UseQueryResult<Paginated<IInvoice.Self>, Error>;
  next: Void;
  prev: Void;
  goto: (pageNumber: number) => void;
  page: number;
  totalPages: number;
}> = ({ invoicesList, query, next, prev, goto, page, totalPages }) => {
  const intl = useFormatMessage();
  const columnHelper = createColumnHelper<IInvoice.Self>();
  const [action, setAction] = useState<Action | null>(null);
  const [activeInvoice, setActiveInvoice] = useState<IInvoice.Self | null>(
    null
  );

  const reset = useCallback(() => setAction(null), []);

  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: intl("global.labels.id"),
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("userId", {
        header: intl("dashboard.invoices.userId"),
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("method", {
        header: intl("dashboard.invoices.method"),
        cell: (info) => {
          const status = info.getValue() as IWithdrawMethod.Type;
          const value = withdrawMethods[status] as keyof typeof intl;
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
          const value = StatusDescriptions[status];
          return intl(value);
        },
      }),
      columnHelper.accessor("note", {
        header: intl("dashboard.invoices.note"),
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("attachment", {
        header: intl("dashboard.invoices.attachment"),
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("addressedBy", {
        header: intl("dashboard.invoices.addressedBy"),
        cell: (info) => info.getValue(),
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
        cell: () => (
          <ActionsMenu
            actions={[
              {
                id: 1,
                label: intl("global.labels.edit"),
                onClick() {
                  // TODO: Dialog to edit invoice
                  alert("edit");
                },
              },
              {
                id: 2,
                label: intl("global.labels.delete"),
                danger: true,
                onClick() {
                  // TODO: Dialog to remove invoice
                  alert("Delete Invoice!!!");
                },
              },
            ]}
          />
        ),
      }),
    ],
    [columnHelper, intl, invoicesList]
  );

  return (
    <div className="w-full">
      <Table
        columns={columns}
        data={invoicesList.list}
        goto={goto}
        prev={prev}
        next={next}
        fetching={query.isFetching}
        loading={query.isLoading}
        totalPages={totalPages}
        page={page}
      />
      {action && activeInvoice ? (
        <Process
          open={action !== null}
          close={reset}
          onUpdate={query.refetch}
          id={activeInvoice.id}
          status={activeInvoice.status}
          action={action}
          note={activeInvoice.note}
        />
      ) : null}
    </div>
  );
};

export default List;
