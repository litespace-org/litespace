import React, { useMemo } from "react";
import { Alert, AlertType } from "@/components/Alert";
import { useFormatMessage } from "@/hooks";
import { InvoiceUpdates } from "@/components/Invoices/Fields";
import { IInvoice } from "@litespace/types";

export const Pending: React.FC<{ show?: boolean }> = ({ show = true }) => {
  const intl = useFormatMessage();
  if (!show) return null;

  return (
    <Alert type={AlertType.Info} title={intl("invoices.admin.status.pending")}>
      <p>{intl("invoices.admin.status.pending.note")}</p>
    </Alert>
  );
};

export const CanceledByReceiver: React.FC<{
  show?: boolean;
  onAccept: () => void;
  loading?: boolean;
  disabled?: boolean;
}> = ({ show = true, onAccept, loading, disabled }) => {
  const intl = useFormatMessage();
  const action = useMemo(
    () => ({
      label: intl("global.labels.accept"),
      onClick: onAccept,
      loading,
      disabled,
    }),
    [disabled, intl, loading, onAccept]
  );
  if (!show) return null;

  return (
    <Alert
      type={AlertType.Error}
      title={intl("invoices.admin.status.canceled-by-receiver")}
      action={action}
    >
      <p>{intl("invoices.admin.status.canceled-by-receiver.note")}</p>
    </Alert>
  );
};

export const CanceledByAdmin: React.FC<{
  show?: boolean;
}> = ({ show = true }) => {
  const intl = useFormatMessage();
  if (!show) return null;

  return (
    <Alert
      type={AlertType.Error}
      title={intl("invoices.admin.status.canceled-by-admin")}
    />
  );
};

export const UpdateRequest: React.FC<{
  show?: boolean;
  invoice: IInvoice.Self;
  onAccept: () => void;
  loading?: boolean;
  disabled?: boolean;
}> = ({ show = true, invoice, onAccept, loading, disabled }) => {
  const intl = useFormatMessage();
  const action = useMemo(
    () => ({
      label: intl("global.labels.accept"),
      onClick: onAccept,
      loading,
      disabled,
    }),
    [disabled, intl, loading, onAccept]
  );
  if (!show) return null;

  return (
    <Alert
      type={AlertType.Warning}
      title={intl("invoices.admin.status.updated-by-receiver")}
      action={action}
    >
      <p>{intl("invoices.admin.status.updated-by-receiver.note")}</p>
      <InvoiceUpdates invoice={invoice} />
    </Alert>
  );
};

export const Fulfilled: React.FC<{ show?: boolean }> = ({ show = true }) => {
  const intl = useFormatMessage();
  if (!show) return null;
  return (
    <Alert
      type={AlertType.Success}
      title={intl("invoices.admin.status.fulfilled")}
    />
  );
};

export const Rejected: React.FC<{ show?: boolean }> = ({ show = true }) => {
  const intl = useFormatMessage();
  if (!show) return null;
  return (
    <Alert
      type={AlertType.Error}
      title={intl("invoices.admin.status.rejected")}
    />
  );
};

export const CancellationApprovedByAdmin: React.FC<{ show?: boolean }> = ({
  show = true,
}) => {
  const intl = useFormatMessage();
  if (!show) return null;
  return (
    <Alert
      type={AlertType.Info}
      title={intl("invoices.admin.status.cancellation-approved-by-admin")}
    />
  );
};
