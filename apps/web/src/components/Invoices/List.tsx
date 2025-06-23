import { useOnError } from "@/hooks/error";
import TransactionMinus from "@litespace/assets/TransactionMinus";
import {
  useFindInvoicesByUser,
  useRequestInvoiceCancelation,
} from "@litespace/headless/invoices";
import { Button } from "@litespace/ui/Button";
import { Table } from "@/components/Invoices/Table";
import { useToast } from "@litespace/ui/Toast";
import { Typography } from "@litespace/ui/Typography";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import React, { useCallback, useState } from "react";
import { ConfirmationDialog } from "@litespace/ui/ConfirmationDialog";
import { CreateInvoiceDialog } from "@/components/Invoices";

export const List: React.FC<{ userId?: number }> = ({ userId }) => {
  const intl = useFormatMessage();
  const toast = useToast();
  const [open, setOpen] = useState<boolean>(false);

  const [id, setId] = useState(0);

  const { query, ...pagination } = useFindInvoicesByUser(userId);

  useOnError({
    type: "query",
    error: query.error,
    keys: query.keys,
  });

  const onSuccess = useCallback(() => {
    setId(0);
    toast.success({ title: intl("invoices.cancel-toast.success") });
    query.refetch();
  }, [intl, query, toast]);

  const onError = useOnError({
    type: "mutation",
    handler: () => {
      setId(0);
      toast.error({ title: intl("invoices.cancel-toast.error") });
    },
  });

  const cancel = useRequestInvoiceCancelation({ onSuccess, onError });

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
          endIcon={<TransactionMinus className="icon stroke-[1.5]" />}
          onClick={() => setOpen(true)}
        >
          <Typography tag="span" className="text">
            {intl("invoices.withdrawal-request.create")}
          </Typography>
        </Button>
        <CreateInvoiceDialog
          open={open}
          close={() => setOpen(false)}
          refetch={query.refetch}
        />
      </div>

      <Table
        data={query.data?.list}
        error={query.isError}
        refetch={query.refetch}
        setId={setId}
        pagination={pagination}
      />

      <ConfirmationDialog
        open={!!id}
        icon={<TransactionMinus />}
        title={intl("invoices.cancel-dialog.title")}
        description={intl("invoices.cancel-dialog.description")}
        close={() => setId(0)}
        type="error"
        actions={{
          primary: {
            label: intl("labels.delete"),
            onClick: () => cancel.mutate(id),
            disabled: cancel.isPending,
            loading: cancel.isPending,
          },
          secondary: {
            label: intl("labels.go-back"),
            onClick: () => setId(0),
            disabled: cancel.isPending,
          },
        }}
      />
    </div>
  );
};

export default List;
