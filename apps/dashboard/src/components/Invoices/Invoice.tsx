import { Card } from "@litespace/ui/Card";
import { LocalId } from "@litespace/ui/locales";
import { useInvoiceStatus } from "@litespace/ui/hooks/invoice";
import { useWithdrawMethod } from "@litespace/ui/hooks/withdraw";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import * as Invoices from "@litespace/ui/Invoices";
import { MenuAction } from "@litespace/ui/ActionsMenu";
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
  const { pendingAppoval, pendingCancellation, rejected, approved, canceled } =
    useInvoiceStatus(invoice.status);
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
        value: <Invoices.Bank bank={invoice.receiver as IInvoice.Bank} />,
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
        disabled: approved,
        onClick: () => setAction(Action.MarkAsFulfilled),
      },
      {
        id: 2,
        label: intl("invoices.process.actions.approveCancelRequest"),
        disabled: !pendingCancellation,
        onClick: () => setAction(Action.ApproveCancelRequest),
      },
      {
        id: 3,
        label: intl("invoices.process.actions.editNote"),
        onClick: () => setAction(Action.EditNote),
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
  }, [approved, intl, rejected, pendingCancellation]);

  return (
    <Card className="flex flex-col w-full gap-3">
      <Invoices.Columns>
        <Invoices.Labels ids={ids} />
        <Invoices.Values values={values} />
        <Invoices.Actions actions={actions} />
      </Invoices.Columns>

      <Invoices.Admin.Pending show={pendingAppoval} />
      <Invoices.Admin.CanceledByReceiver
        show={pendingCancellation}
        onAccept={() => setAction(Action.ApproveCancelRequest)}
      />
      <Invoices.Admin.Fulfilled show={approved} />
      <Invoices.Admin.Rejected show={rejected} />
      <Invoices.Admin.CancellationApprovedByAdmin show={canceled} />

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
