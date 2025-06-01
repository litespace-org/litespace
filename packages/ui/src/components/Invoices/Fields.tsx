import { IInvoice } from "@litespace/types";
import React, { useMemo } from "react";
import { getWithdrawMethodIntlId } from "@/components/utils/withdraw";
import { useFormatMessage } from "@/hooks/intl";
import { useWithdrawMethod } from "@/hooks/withdraw";
import dayjs from "@/lib/dayjs";
import { getBankIntlId } from "@/components/utils";
import { RawHtml } from "@/components/RawHtml";
import { Alert, AlertType } from "@/components/Alert";
import { Price } from "@/components/Price";
import { Columns } from "@/components/Invoices/Records";
import { Button } from "@/components/Button";
import { Typography } from "@litespace/ui/Typography";

export const InvoiceId: React.FC<{ id: number }> = ({ id }) => {
  return `#${id}`;
};

export const Owner: React.FC<{ name: string | null }> = ({ name }) => {
  return name || "-";
};

export const Method: React.FC<{ method: IInvoice.WithdrawMethod }> = ({
  method,
}) => {
  const id = useMemo(() => getWithdrawMethodIntlId(method), [method]);
  const intl = useFormatMessage();
  return intl(id);
};

export const Receiver: React.FC<{
  receiver: string;
  method: IInvoice.WithdrawMethod;
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

export const InvoiceUpdates: React.FC<{ invoice: IInvoice.Self }> = () => {
  return (
    <Columns>
      <Typography tag="span">TODO: to be implemented</Typography>
    </Columns>
  );
};
