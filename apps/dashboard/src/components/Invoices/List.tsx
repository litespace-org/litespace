import DateField from "@/components/Common/DateField";
import UserPopover from "@/components/Common/UserPopover";
import Process from "@/components/Invoices/Process";
import { Action } from "@/components/Invoices/type";
import {
  invoiceStatusIntlMap,
  withdrawMethodsIntlMap,
} from "@/components/utils/invoice";
import { IInvoice, Paginated, Void } from "@litespace/types";
import { ActionsMenu } from "@litespace/ui/ActionsMenu";
import { Button } from "@litespace/ui/Button";
import { Table } from "@litespace/ui/Table";
import { Typography } from "@litespace/ui/Typography";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { formatCurrency } from "@litespace/ui/utils";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import { UseQueryResult } from "@tanstack/react-query";
import { createColumnHelper } from "@tanstack/react-table";
import cn from "classnames";
import React, { useCallback, useMemo, useState } from "react";
import Menu from "@litespace/assets/Menu";

const List: React.FC<{
  data: Paginated<IInvoice.Self>;
  query: UseQueryResult<Paginated<IInvoice.Self>, Error>;
  next: Void;
  prev: Void;
  goto: (pageNumber: number) => void;
  page: number;
  totalPages: number;
}> = ({ data, query, ...pagination }) => {
  const intl = useFormatMessage();
  const columnHelper = createColumnHelper<IInvoice.Self>();
  const [action, setAction] = useState<Action | null>(null);
  const [invoice, setInvoice] = useState<IInvoice.Self | null>(null);

  const reset = useCallback(() => setAction(null), []);

  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: intl("global.labels.id"),
        cell: (info) => {
          return <>{info.getValue()}#</>;
        },
      }),
      columnHelper.accessor("userId", {
        header: intl("dashboard.invoices.userId"),
        cell: (info) => <UserPopover id={info.getValue()} />,
      }),
      columnHelper.accessor("method", {
        header: intl("dashboard.invoices.method"),
        cell: (info) => {
          const status = info.getValue() as IInvoice.WithdrawMethod;
          const value = withdrawMethodsIntlMap[status];
          return intl(value);
        },
      }),
      columnHelper.accessor("receiver", {
        header: intl("dashboard.invoices.receiver"),
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
            <Typography
              tag="span"
              className={cn("text-body", {
                "text-warning-600":
                  info.row.original.status ===
                    IInvoice.Status.PendingApproval ||
                  info.row.original.status ===
                    IInvoice.Status.PendingCancellation,
              })}
            >
              {intl(value)}
            </Typography>
          );
        },
      }),
      columnHelper.accessor("createdAt", {
        header: intl("global.created-at"),
        cell: (info) => <DateField date={info.row.original.updatedAt} />,
      }),
      columnHelper.display({
        id: "actions",
        header: intl("table.actions"),
        cell: (info) => {
          const status = info.row.original.status;
          const fulfilled = status === IInvoice.Status.Approved;
          const canceledByReceiver =
            status === IInvoice.Status.PendingCancellation;
          const rejected = status === IInvoice.Status.Rejected;

          const edit = (action: Action): void => {
            setAction(action);
            setInvoice(info.row.original);
          };

          if (info.row.original.status === IInvoice.Status.Rejected) return;

          return (
            <ActionsMenu
              children={
                <Button
                  variant="secondary"
                  type="natural"
                  size="medium"
                  startIcon={<Menu className="icon" />}
                />
              }
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
        fetching={query.isFetching}
        loading={query.isLoading}
        {...pagination}
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
