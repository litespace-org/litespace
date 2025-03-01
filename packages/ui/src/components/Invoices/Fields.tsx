import { IInvoice, IWithdrawMethod } from "@litespace/types";
import React, { useMemo } from "react";
import {
  destructureWithdrawMethod,
  getWithdrawMethodIntlId,
} from "@/components/utils/withdraw";
import { useFormatMessage } from "@/hooks/intl";
import { useWithdrawMethod } from "@/hooks/withdraw";
import dayjs from "@/lib/dayjs";
import { getBankIntlId } from "@/components/utils";
import { RawHtml } from "@/components/RawHtml";
import { Alert, AlertType } from "@/components/Alert";
import { Price } from "@/components/Price";
import { LocalId } from "@/locales";
import { Labels, Values, Value, Columns } from "@/components/Invoices/Records";
import { Button } from "@/components/Button";

export const InvoiceId: React.FC<{ id: number }> = ({ id }) => {
  return `#${id}`;
};

export const Owner: React.FC<{ name: string | null }> = ({ name }) => {
  return name || "-";
};

export const Method: React.FC<{ method: IWithdrawMethod.Type }> = ({
  method,
}) => {
  const id = useMemo(() => getWithdrawMethodIntlId(method), [method]);
  const intl = useFormatMessage();
  return intl(id);
};

export const Receiver: React.FC<{
  receiver: string;
  method: IWithdrawMethod.Type;
}> = ({ receiver, method }) => {
  const { instapay } = useWithdrawMethod(method);
  if (instapay) return <span dir="ltr">@{receiver}</span>;
  return receiver;
};

export const Date: React.FC<{
  date: string;
}> = ({ date }) => {
  const formatted = useMemo(
    () =>
      dayjs(date).format("dddd، DD MMMM، YYYY") + ` (${dayjs(date).fromNow()})`,
    [date]
  );

  return formatted;
};

export const Bank: React.FC<{ bank: IInvoice.Bank | null }> = ({ bank }) => {
  const id = useMemo(() => (bank ? getBankIntlId(bank) : null), [bank]);
  const intl = useFormatMessage();
  if (!id) return "-";
  return intl(id);
};

export const Note: React.FC<{ note: string | null; onEdit?: () => void }> = ({
  note,
  onEdit,
}) => {
  const intl = useFormatMessage();
  if (!note) return null;
  return (
    <div className="border border-control rounded-md">
      <div className="w-full bg-surface-300 px-2 py-1.5 flex flex-row gap-2">
        <p>{intl("invoices.note")}</p>
        {onEdit ? (
          <Button
            onClick={onEdit}
            type={"main"}
            variant={"secondary"}
            size={"small"}
          >
            {intl("global.labels.edit")}
          </Button>
        ) : null}
      </div>
      <div className="px-2 py-3">
        <RawHtml html={note} />
      </div>
    </div>
  );
};

export const Pending: React.FC<{ show?: boolean }> = ({ show = true }) => {
  const intl = useFormatMessage();
  if (!show) return null;
  return (
    <Alert type={AlertType.Info} title={intl("invoices.status.pending")}>
      <div className="flex flex-col gap-1">
        <p>{intl("invoices.status.pending.note")}</p>
        <p>{intl("invoices.unexpected.status.note")}</p>
      </div>
    </Alert>
  );
};

export const Amount: React.FC<{ amount: number }> = ({ amount }) => {
  return (
    <span className="[&_.change]:text-tiny">
      <Price value={amount} />{" "}
    </span>
  );
};

export const InvoiceUpdates: React.FC<{ invoice: IInvoice.Self }> = ({
  invoice,
}) => {
  const change = useMemo(() => {
    if (!invoice.update) return null;
    return {
      method: invoice.update.method !== invoice.method,
      amount: invoice.update.amount !== invoice.amount,
      receiver: invoice.update.receiver !== invoice.receiver,
      bank: invoice.update.bank !== invoice.bank,
    };
  }, [
    invoice.amount,
    invoice.bank,
    invoice.method,
    invoice.receiver,
    invoice.update,
  ]);

  const ids = useMemo(() => {
    const ids: LocalId[] = [];
    if (!change || !invoice.update) return ids;

    if (change.method) ids.push("invoices.method");
    if (change.receiver) {
      const { bank, instapay, wallet } = destructureWithdrawMethod(
        invoice.update.method
      );
      if (bank) ids.push("invoices.account");
      if (instapay) ids.push("invoices.username");
      if (wallet) ids.push("invoices.phone");
    }
    if (change.bank && invoice.update.bank) ids.push("invoices.bank");
    if (change.amount) ids.push("invoices.amount");
    return ids;
  }, [change, invoice.update]);

  const values = useMemo((): Value[] => {
    const values: Value[] = [];
    if (!change || !invoice.update) return values;

    if (change.method)
      values.push({
        id: 1,
        value: <Method method={invoice.update.method} />,
      });

    if (change.receiver)
      values.push({
        id: 2,
        value: (
          <Receiver
            method={invoice.update.method}
            receiver={invoice.update.receiver}
          />
        ),
      });

    if (change.bank && invoice.update.bank)
      values.push({
        id: 3,
        value: <Bank bank={invoice.update.bank as IInvoice.Bank} />,
      });

    if (change.amount)
      values.push({
        id: 4,
        value: <Amount amount={invoice.update.amount} />,
      });

    return values;
  }, [change, invoice.update]);

  if (!invoice.update) return null;

  return (
    <Columns>
      <Labels ids={ids} />
      <Values values={values} />
    </Columns>
  );
};
