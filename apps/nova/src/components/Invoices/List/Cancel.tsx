import {
  Alert,
  AlertType,
  Dialog,
  toaster,
  useFormatMessage,
  atlas,
} from "@litespace/luna";
import { useMutation } from "@tanstack/react-query";
import React, { useCallback, useMemo } from "react";

const Cancel: React.FC<{
  open: boolean;
  id: number;
  close: () => void;
  refresh?: () => void;
}> = ({ open, id, close, refresh }) => {
  const intl = useFormatMessage();

  const cancel = useCallback(async () => {
    return await atlas.invoice.updateByReceiver(id, {
      cancel: true,
    });
  }, [id]);

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

  const mutation = useMutation({
    mutationFn: cancel,
    mutationKey: ["cancel-invoice"],
    onSuccess,
    onError,
  });

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
