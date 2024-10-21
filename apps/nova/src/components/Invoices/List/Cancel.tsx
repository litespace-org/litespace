import {
  Alert,
  AlertType,
  Dialog,
  toaster,
  useFormatMessage,
} from "@litespace/luna";
import React, { useCallback, useMemo } from "react";
import { useCancelInvoiceById } from "@litespace/headless/invoices";

const Cancel: React.FC<{
  open: boolean;
  id: number;
  close: () => void;
  refresh?: () => void;
}> = ({ open, id, close, refresh }) => {
  const intl = useFormatMessage();

  const onSuccess = useCallback(() => {
    toaster.success({
      title: intl("invoices.cancel.success"),
    });
    close();
    if (refresh) return refresh();
  }, [close, intl, refresh]);

  const onError = useCallback(
    (error: unknown) => {
      toaster.success({
        title: intl("invoices.cancel.error"),
        description: error instanceof Error ? error.message : undefined,
      });
    },
    [intl]
  );

  const mutation = useCancelInvoiceById({ id, onSuccess, onError });

  const action = useMemo(() => {
    return {
      label: intl("invoices.cancel.submit"),
      onClick: () => mutation.mutate(),
      disabled: mutation.isPending,
      loading: mutation.isPending,
    };
  }, [intl, mutation]);

  return (
    <Dialog
      title={intl("invoices.cancel.title")}
      open={open}
      close={close}
      className="w-full md:max-w-[700px] text-foreground"
    >
      <Alert
        type={AlertType.Error}
        title={intl("invoices.cancel.warning", { id })}
        action={action}
      >
        {intl("invoices.status.canceledByReceiver.note")}
      </Alert>
    </Dialog>
  );
};

export default Cancel;
