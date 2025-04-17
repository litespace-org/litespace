import { QueryKey } from "@litespace/headless/constants";
import {
  useCancelInvoiceById,
  useFindInvoicesByUser,
} from "@litespace/headless/invoices";
import { useInvalidateQuery } from "@litespace/headless/query";
import { IInvoice, IWithdrawMethod } from "@litespace/types";
import { InvoicesTable } from "@litespace/ui/InvoicesTable";
import { useToast } from "@litespace/ui/Toast";
import { Typography } from "@litespace/ui/Typography";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import React, { useCallback, useEffect, useState } from "react";

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
        // This exclude should be removed after update invoices backend
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

  // Cancel invoice will be show in case the id is not null.
  const [id, setId] = useState<number | null>(null);
  const invoicesQuery = useFindInvoicesByUser({ userOnly: true });
  const invalidateQuery = useInvalidateQuery();

  const onSuccess = useCallback(() => {
    invalidateQuery([QueryKey.FindInvoicesByUser]);
    setId(null);
    toast.success({ title: intl("invoices.cancel-toast.success") });
  }, [invalidateQuery, toast, intl]);

  const onError = useCallback(() => {
    setId(null);
    toast.error({ title: intl("invoices.cancel-toast.error") });
  }, [toast, intl]);

  const cancelMutation = useCancelInvoiceById({ id, onSuccess, onError });

  useEffect(() => {
    if (id) cancelMutation.mutate();
  }, [cancelMutation, id]);

  return (
    <div>
      <Typography
        tag="h6"
        className="text-body md:text-subtitle-2 text-natural-950 font-bold mb-4 lg:mb-6"
      >
        {intl("invoices.table.title")}
      </Typography>
      <InvoicesTable
        invoices={asInvoices({ list: invoicesQuery.list || [] })}
        loading={invoicesQuery.query.isLoading}
        fetching={invoicesQuery.query.isFetching}
        error={invoicesQuery.query.isError}
        deleteLoading={id}
        hasMore={invoicesQuery.hasMore}
        retry={invoicesQuery.query.refetch}
        onDelete={(id) => setId(id)}
        more={invoicesQuery.more}
        open={id !== null}
        close={() => setId(null)}
      />
    </div>
  );
};

export default Table;
