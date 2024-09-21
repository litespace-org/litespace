import { useWithdrawMethod } from "@/hooks/withdraw";
import {
  Alert,
  AlertType,
  Card,
  getWithdrawMethodIntlId,
  Invoices,
  LocalMap,
  messages,
} from "@litespace/luna";
import { IInvoice } from "@litespace/types";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import dayjs from "@/lib/dayjs";
import { useInvoiceStatus } from "@/hooks/invoice";
import Price from "@/components/Common/Price";
import { Edit3 } from "react-feather";

const Labels: React.FC<{ ids: Array<keyof LocalMap> }> = ({ ids }) => {
  const intl = useIntl();
  return (
    <ul className="flex flex-col gap-2 shrink-0">
      {ids.map((id) => (
        <li key={id} className="text-foreground-light">
          {intl.formatMessage({ id })}:
        </li>
      ))}
    </ul>
  );
};

const Values: React.FC<{
  values: Array<{ id: number | string; value: React.ReactNode }>;
}> = ({ values }) => {
  return (
    <ul className="flex flex-col gap-2">
      {values.map(({ id, value }) => (
        <li key={id} className="text-foreground">
          {value}
        </li>
      ))}
    </ul>
  );
};

const Receiver: React.FC<{
  receiver: string;
}> = ({ receiver }) => {
  return <span>{receiver}</span>;
};

const Bank: React.FC<{
  bank: string | null;
}> = ({ bank }) => {
  return <span>{bank || "-"}</span>;
};

const InvoiceUpdates: React.FC<{ invoice: IInvoice.Self }> = ({ invoice }) => {
  const intl = useIntl();
  const updates = useMemo(() => {
    if (!invoice.update) return [];

    const updates = [];
    if (invoice.update.method !== invoice.method)
      updates.push({
        id: 1,
        value: intl.formatMessage(
          {
            id: messages["global.invoice.update.method"],
          },
          {
            from: intl.formatMessage({
              id: getWithdrawMethodIntlId(invoice.method),
            }),
            to: intl.formatMessage({
              id: getWithdrawMethodIntlId(invoice.update.method),
            }),
          }
        ),
      });

    if (invoice.update.amount !== invoice.amount)
      updates.push({
        id: 2,
        value: intl.formatMessage(
          { id: messages["global.invoice.update.amount"] },
          {
            from: <Price value={invoice.amount} />,
            to: <Price value={invoice.update.amount} />,
          }
        ),
      });

    if (invoice.update.receiver !== invoice.receiver)
      updates.push({
        id: 3,
        value: intl.formatMessage(
          { id: messages["global.invoice.update.receiver"] },
          {
            from: <Receiver receiver={invoice.receiver} />,
            to: <Receiver receiver={invoice.update.receiver} />,
          }
        ),
      });

    if (invoice.update.bank !== invoice.bank)
      updates.push({
        id: 4,
        value: intl.formatMessage(
          { id: messages["global.invoice.update.bank"] },
          {
            from: <Bank bank={invoice.bank} />,
            to: <Bank bank={invoice.update.bank} />,
          }
        ),
      });

    return updates;
  }, [
    intl,
    invoice.amount,
    invoice.bank,
    invoice.method,
    invoice.receiver,
    invoice.update,
  ]);

  if (!invoice.update) return null;

  return (
    <ul className="flex flex-col gap-2 mt-2">
      {updates.map(({ id, value }) => (
        <li key={id} className="flex flex-row gap-2">
          <Edit3 className="w-[20px]" />
          <p>{value}</p>
        </li>
      ))}
    </ul>
  );
};

const Invoice: React.FC<{
  invoice: IInvoice.Self;
}> = ({ invoice }) => {
  const intl = useIntl();
  const {
    rejected,
    canceledByAdmin,
    canceledByReceiver,
    cancellationApprovedByAdmin,
    updatedByReceiver,
    fulfilled,
    pending,
  } = useInvoiceStatus(invoice.status);
  const { bank, instapay, wallet } = useWithdrawMethod(invoice.method);

  const method = useMemo(() => {
    return intl.formatMessage({
      id: bank
        ? messages["withdraw.methods.bank"]
        : instapay
          ? messages["withdraw.methods.instapay"]
          : messages["withdraw.methods.wallet"],
    });
  }, [bank, instapay, intl]);

  const ids = useMemo((): Array<keyof LocalMap> => {
    const ids: Array<keyof LocalMap> = [
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
    const values = [
      { id: 1, value: `#${invoice.id}` },
      { id: 2, value: method },
      {
        id: 3,
        value: <Invoices.Amount amount={invoice.amount} />,
      },
      { id: 4, value: <Receiver receiver={invoice.receiver} /> },
    ];

    if (invoice.bank)
      values.push({ id: 5, value: <Bank bank={invoice.bank} /> });

    values.push({
      id: 6,
      value:
        dayjs(invoice.createdAt).format("dddd، DD MMMM، YYYY") +
        ` (${dayjs(invoice.createdAt).fromNow()})`,
    });

    return values;
  }, [
    invoice.amount,
    invoice.bank,
    invoice.createdAt,
    invoice.id,
    invoice.receiver,
    method,
  ]);

  return (
    <Card className="flex flex-col gap-4">
      <ul className="flex flex-row gap-2">
        <Labels ids={ids} />
        <Values values={values} />
      </ul>

      {rejected ||
      canceledByAdmin ||
      canceledByReceiver ||
      cancellationApprovedByAdmin ? (
        <Alert
          title={intl.formatMessage({
            id: rejected
              ? messages["invoices.status.rejected"]
              : canceledByAdmin
                ? messages["invoices.status.canceledByAdmin"]
                : canceledByReceiver
                  ? messages["invoices.status.canceledByReceiver"]
                  : messages["invoices.status.cancellationApprovedByAdmin"],
          })}
        >
          <p>
            {intl.formatMessage({
              id: messages["invoices.unexpected.status.note"],
            })}
          </p>
        </Alert>
      ) : null}

      {updatedByReceiver && invoice.update ? (
        <Alert
          type={AlertType.Warning}
          title={intl.formatMessage({
            id: messages["invoices.status.updatedByReceiver"],
          })}
        >
          <p>
            {intl.formatMessage({
              id: messages["invoices.status.updatedByReceiver.note"],
            })}
          </p>

          <InvoiceUpdates invoice={invoice} />
        </Alert>
      ) : null}

      {fulfilled ? (
        <Alert
          type={AlertType.Success}
          title={intl.formatMessage({
            id: messages["invoices.status.fulfilled"],
          })}
        >
          <div className="flex flex-col gap-1">
            <p>
              {intl.formatMessage({
                id: messages["invoices.status.fulfilled.note"],
              })}
            </p>
            <p>
              {intl.formatMessage({
                id: messages["invoices.unexpected.status.note"],
              })}
            </p>
          </div>
        </Alert>
      ) : null}

      {pending ? (
        <Alert
          type={AlertType.Info}
          title={intl.formatMessage({
            id: messages["invoices.status.pending"],
          })}
        >
          <div className="flex flex-col gap-1">
            <p>
              {intl.formatMessage({
                id: messages["invoices.status.pending.note"],
              })}
            </p>
            <p>
              {intl.formatMessage({
                id: messages["invoices.unexpected.status.note"],
              })}
            </p>
          </div>
        </Alert>
      ) : null}

      <Invoices.Note note={invoice.note} />
    </Card>
  );
};

export default Invoice;
