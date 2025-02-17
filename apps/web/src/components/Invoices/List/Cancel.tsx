import { Alert, AlertType } from "@litespace/ui/Alert";
import { Dialog } from "@litespace/ui/Dialog";
import { useToast } from "@litespace/ui/Toast";
import { useWebFormatMessage } from "@/hooks/intl";
import React, { useCallback, useMemo } from "react";
import { useCancelInvoiceById } from "@litespace/headless/invoices";
import { getErrorMessageId } from "@litespace/ui/errorMessage";
import { capture } from "@/lib/sentry";

const Cancel: React.FC<{
  open: boolean;
  id: number;
  close: () => void;
  refresh?: () => void;
}> = ({ open, id, close, refresh }) => {
  const intl = useWebFormatMessage();
  const toast = useToast();

  const onSuccess = useCallback(() => {
    toast.success({
      title: intl("invoices.cancel.success"),
    });
    close();
    if (refresh) return refresh();
  }, [close, intl, refresh, toast]);

  const onError = useCallback(
    (error: unknown) => {
      capture(error);
      const errorMessage = getErrorMessageId(error);
      toast.success({
        title: intl("invoices.cancel.error"),
        description: intl(errorMessage),
      });
    },
    [intl, toast]
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
        {intl("invoices.status.canceled-by-receiver.note")}
      </Alert>
    </Dialog>
  );
};

export default Cancel;
