import {
  useCancelInvoiceById,
  useFindInvoices,
} from "@litespace/headless/invoices";
import React, { useCallback, useEffect, useState } from "react";
import { InvoicesTable } from "@litespace/ui/InvoicesTable";
import { Typography } from "@litespace/ui/Typography";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { IInvoice, IWithdrawMethod } from "@litespace/types";
import { useToast } from "@litespace/ui/Toast";
import { useInvalidateQuery } from "@litespace/headless/query";
import { QueryKey } from "@litespace/headless/constants";
import { Button } from "@litespace/ui/Button";
import TransactionMinus from "@litespace/assets/TransactionMinus";
import { CreateInvoiceDialog } from "@/components/Invoices";

function asInvoices({ list }: { list: IInvoice.Self[] }): Array<{
  id: number;
  createdAt: string;
  amount: number;
  method: IWithdrawMethod.Type;
  receiver: string;
  status: Exclude<IInvoice.Status, IInvoice.Status.UpdatedByReceiver>;
}> {
  return list
    .filter((invoice) => invoice.status !== IInvoice.Status.UpdatedByReceiver)
    .map((invoice) => {
      return {
        id: invoice.id,
        createdAt: invoice.createdAt,
        amount: invoice.amount,
        method: invoice.method,
        receiver: invoice.receiver,
        status: invoice.status as Exclude<
          IInvoice.Status,
          IInvoice.Status.UpdatedByReceiver
        >,
      };
    });
}

export const Table: React.FC = () => {
  const intl = useFormatMessage();
  const toast = useToast();
  const [open, setOpen] = useState(false); // For delete dialog
  const [createOpen, setCreateOpen] = useState(false);

  const [id, setId] = useState<number>(0); // The invoice id that will be deleted
  const invoicesQuery = useFindInvoices({ userOnly: true });
  const invalidateQuery = useInvalidateQuery();

  const onSuccess = useCallback(() => {
    invalidateQuery([QueryKey.FindInvoices]);
    setOpen(false);
    toast.success({ title: intl("invoices.cancel-toast.success") });
  }, [invalidateQuery, toast, intl]);

  const onError = useCallback(() => {
    setOpen(false);
    toast.error({ title: intl("invoices.cancel-toast.error") });
  }, [toast, intl]);

  const cancelMutation = useCancelInvoiceById({ id, onSuccess, onError });

  useEffect(() => {
    if (id === 0) return;
    cancelMutation.mutate();

    return () => setId(0);
  }, [cancelMutation, id]);

  if (!invoicesQuery.query.data) return null;
  return (
    <div>
      <div className="flex justify-between items-center mb-4 lg:mb-6">
        <Typography
          tag="h6"
          className="text-body md:text-subtitle-2 text-natural-950 font-bold"
        >
          {intl("invoices.table.title")}
        </Typography>
        <Button
          size="large"
          endIcon={
            <TransactionMinus className="w-4 h-4 [&>*]:stroke-natural-50" />
          }
          onClick={() => setCreateOpen(true)}
        >
          {intl("invoices.withdrawal-request.create")}
        </Button>
        <CreateInvoiceDialog
          open={createOpen}
          close={() => setCreateOpen(false)}
          refresh={() => invoicesQuery.query.refetch()}
        />
      </div>
      <InvoicesTable
        invoices={asInvoices({ list: invoicesQuery.query.data.list })}
        loading={invoicesQuery.query.isLoading}
        fetching={invoicesQuery.query.isFetching}
        error={invoicesQuery.query.isError}
        deleteLoading={id}
        hasNextPage={
          invoicesQuery.totalPages > invoicesQuery.page &&
          !invoicesQuery.query.isPending
        }
        retry={invoicesQuery.query.refetch}
        onDelete={(id) => setId(id)}
        more={invoicesQuery.next}
        open={open}
        close={() => setOpen(false)}
      />
    </div>
  );
};

export default Table;
