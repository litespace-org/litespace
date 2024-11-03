import { Card } from "@litespace/luna/Card";
import { LocalId } from "@litespace/luna/locales";
import { useInvoiceStatus } from "@litespace/luna/hooks/invoice";
import { useWithdrawMethod } from "@litespace/luna/hooks/withdraw";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import * as Invoices from "@litespace/luna/Invoices";
import { MenuAction } from "@litespace/luna/ActionsMenu";
import { IInvoice } from "@litespace/types";
import React, { useCallback, useMemo, useState } from "react";
import Process from "@/components/Invoices/Process";
import { Action } from "./type";

const Invoice: React.FC<{ invoice: IInvoice.Self; onUpdate?: () => void }> = ({
  invoice,
  onUpdate,
}) => {
  const intl = useFormatMessage();
  const { bank, instapay, wallet } = useWithdrawMethod(invoice.method);
  const {
    pending,
    rejected,
    fulfilled,
    canceledByReceiver,
    cancellationApprovedByAdmin,
    updatedByReceiver,
  } = useInvoiceStatus(invoice.status);
  const [action, setAction] = useState<Action | null>(null);
  const reset = useCallback(() => setAction(null), []);

  const ids = useMemo((): Array<LocalId> => {
    const ids: LocalId[] = ["invoices.id", "invoices.owner", "invoices.method"];
    if (bank) ids.push("invoices.account");
    if (instapay) ids.push("invoices.username");
    if (wallet) ids.push("invoices.phone");
    if (bank) ids.push("invoices.bank");
    ids.push(
      "invoices.amount",
      "invoices.date.created",
      "invoices.date.updated"
    );
    return ids;
  }, [bank, instapay, wallet]);

  const values = useMemo(() => {
    const values: Invoices.Value[] = [
      { id: 1, value: <Invoices.InvoiceId id={invoice.id} /> },
      { id: 2, value: <Invoices.Owner name={null} /> }, // todo: display the tutor name
      { id: 3, value: <Invoices.Method method={invoice.method} /> },
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

    if (bank)
      values.push({
        id: 5,
        value: <Invoices.Bank bank={invoice.bank as IInvoice.Bank} />,
      });

    values.push(
      { id: 6, value: <Invoices.Amount amount={invoice.amount} /> },
      { id: 7, value: <Invoices.Date date={invoice.createdAt} /> },
      { id: 8, value: <Invoices.Date date={invoice.createdAt} /> }
    );

    return values;
  }, [
    bank,
    invoice.amount,
    invoice.bank,
    invoice.createdAt,
    invoice.id,
    invoice.method,
    invoice.receiver,
  ]);

  const actions = useMemo((): MenuAction[] => {
    const actions: MenuAction[] = [
      {
        id: 1,
        label: intl("invoices.process.actions.markAsFulfilled"),
        disabled: fulfilled,
        onClick: () => setAction(Action.MarkAsFulfilled),
      },
      {
        id: 2,
        label: intl("invoices.process.actions.approveCancelRequest"),
        disabled: !canceledByReceiver,
        onClick: () => setAction(Action.ApproveCancelRequest),
      },
      {
        id: 3,
        label: intl("invoices.process.actions.editNote"),
        onClick: () => setAction(Action.EditNote),
      },
      {
        id: 3,
        label: intl("invoices.process.actions.approveUpdateRequest"),
        disabled: !updatedByReceiver,
        onClick: () => setAction(Action.ApproveUpdateRequest),
      },
      {
        id: 4,
        label: intl("invoices.process.actions.markAsRejected"),
        danger: true,
        disabled: rejected,
        onClick: () => setAction(Action.MarkAsRejected),
      },
    ];
    return actions;
  }, [canceledByReceiver, fulfilled, intl, rejected, updatedByReceiver]);

  return (
    <Card className="flex flex-col w-full gap-3">
      <Invoices.Columns>
        <Invoices.Labels ids={ids} />
        <Invoices.Values values={values} />
        <Invoices.Actions actions={actions} />
      </Invoices.Columns>

      <Invoices.Admin.Pending show={pending} />
      <Invoices.Admin.CanceledByReceiver
        show={canceledByReceiver}
        onAccept={() => setAction(Action.ApproveCancelRequest)}
      />
      <Invoices.Admin.UpdateRequest
        show={updatedByReceiver}
        invoice={invoice}
        onAccept={() => setAction(Action.ApproveUpdateRequest)}
      />
      <Invoices.Admin.Fulfilled show={fulfilled} />
      <Invoices.Admin.Rejected show={rejected} />
      <Invoices.Admin.CancellationApprovedByAdmin
        show={cancellationApprovedByAdmin}
      />

      <Invoices.Note
        onEdit={() => setAction(Action.EditNote)}
        note={invoice.note}
      />

      {action !== null ? (
        <Process
          open={action !== null}
          close={reset}
          onUpdate={onUpdate}
          id={invoice.id}
          status={invoice.status}
          action={action}
          note={invoice.note}
        />
      ) : null}
    </Card>
  );
};

export default Invoice;
