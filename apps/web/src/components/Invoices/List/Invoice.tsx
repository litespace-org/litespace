import { useWithdrawMethod } from "@/hooks/withdraw";
import { Alert, AlertType } from "@litespace/ui/Alert";
import { Card } from "@litespace/ui/Card";
import * as Invoices from "@litespace/ui/Invoices";
import { MenuAction } from "@litespace/ui/ActionsMenu";
import { useRender } from "@litespace/ui/hooks/common";
import { useWebFormatMessage } from "@/hooks/intl";
import { LocalId, LocalMap } from "@litespace/ui/locales";
import { IInvoice } from "@litespace/types";
import React, { useMemo } from "react";
import { useInvoiceStatus } from "@/hooks/invoice";
import ManageInvoice from "@/components/Invoices/List/Manage";
import Cancel from "@/components/Invoices/List/Cancel";

const Invoice: React.FC<{
  invoice: IInvoice.Self;
  refresh?: () => void;
}> = ({ invoice, refresh }) => {
  const intl = useWebFormatMessage();
  const edit = useRender();
  const cancel = useRender();
  const {
    rejected,
    canceledByReceiver,
    cancellationApprovedByAdmin,
    updatedByReceiver,
    fulfilled,
    pending,
  } = useInvoiceStatus(invoice.status);
  const { bank, instapay, wallet } = useWithdrawMethod(invoice.method);

  const ids = useMemo((): Array<keyof LocalMap> => {
    const ids: Array<LocalId> = [
      "invoices.id",
      "invoices.method",
      "invoices.amount",
    ];

    if (bank) ids.push("invoices.account");
    if (instapay) ids.push("invoices.username");
    if (wallet) ids.push("invoices.phone");
    if (invoice.bank) ids.push("invoices.bank");

    ids.push("invoices.date.created");
    return ids;
  }, [bank, instapay, invoice.bank, wallet]);

  const values = useMemo(() => {
    const values: Invoices.Value[] = [
      { id: 1, value: <Invoices.InvoiceId id={invoice.id} /> },
      { id: 2, value: <Invoices.Method method={invoice.method} /> },
      {
        id: 3,
        value: <Invoices.Amount amount={invoice.amount} />,
      },
      {
        id: 4,
        value: (
          <Invoices.Receiver
            method={invoice.method}
            receiver={invoice.receiver}
          />
        ),
      },
    ];

    if (invoice.bank)
      values.push({ id: 5, value: <Invoices.Bank bank={invoice.bank} /> });

    values.push({
      id: 6,
      value: <Invoices.Date date={invoice.createdAt} />,
    });

    return values;
  }, [
    invoice.amount,
    invoice.bank,
    invoice.createdAt,
    invoice.id,
    invoice.method,
    invoice.receiver,
  ]);

  const actions = useMemo((): MenuAction[] => {
    const disabled = !pending && !updatedByReceiver;
    return [
      {
        id: 1,
        label: intl("global.labels.edit"),
        onClick: edit.show,
        disabled,
      },
      {
        id: 2,
        label: intl("global.labels.cancel"),
        onClick: cancel.show,
        danger: true,
        disabled,
      },
    ];
  }, [cancel.show, edit.show, intl, pending, updatedByReceiver]);

  return (
    <Card className="flex flex-col gap-4">
      <Invoices.Columns>
        <Invoices.Labels ids={ids} />
        <Invoices.Values values={values} />
        <Invoices.Actions actions={actions} />
      </Invoices.Columns>

      {rejected || canceledByReceiver || cancellationApprovedByAdmin ? (
        <Alert
          title={intl(
            rejected
              ? "invoices.status.rejected"
              : canceledByReceiver
                ? "invoices.status.canceled-by-receiver"
                : "invoices.admin.status.cancellation-approved-by-admin"
          )}
        >
          <p>{intl("invoices.unexpected.status.note")}</p>
        </Alert>
      ) : null}

      {updatedByReceiver && invoice.update ? (
        <Alert
          type={AlertType.Warning}
          title={intl("invoices.status.updated-by-receiver")}
        >
          <p>{intl("invoices.status.updated-by-receiver.note")}</p>
          <Invoices.InvoiceUpdates invoice={invoice} />
        </Alert>
      ) : null}

      {fulfilled ? (
        <Alert
          type={AlertType.Success}
          title={intl("invoices.status.fulfilled")}
        >
          <div className="flex flex-col gap-1">
            <p>{intl("invoices.status.fulfilled.note")}</p>
            <p>{intl("invoices.unexpected.status.note")}</p>
          </div>
        </Alert>
      ) : null}

      {pending ? (
        <Alert type={AlertType.Info} title={intl("invoices.status.pending")}>
          <div className="flex flex-col gap-1">
            <p>{intl("invoices.status.pending.note")}</p>
            <p>{intl("invoices.unexpected.status.note")}</p>
          </div>
        </Alert>
      ) : null}

      <Invoices.Note note={invoice.note} />

      <ManageInvoice
        refresh={refresh}
        open={edit.open}
        close={edit.hide}
        invoice={invoice}
      />

      <Cancel
        open={cancel.open}
        close={cancel.hide}
        id={invoice.id}
        refresh={refresh}
      />
    </Card>
  );
};

export default Invoice;
