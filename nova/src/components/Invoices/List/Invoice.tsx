import { useWithdrawMethod } from "@/hooks/withdraw";
import {
  Alert,
  AlertType,
  Card,
  getWithdrawMethodIntlId,
  LocalMap,
  messages,
} from "@litespace/luna";
import { IInvoice } from "@litespace/types";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import dayjs from "@/lib/dayjs";
import RawHtml from "@/components/TutorOnboardingSteps/RawHtml";
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
        ? messages["global.withdraw.methods.bank"]
        : instapay
          ? messages["global.withdraw.methods.instapay"]
          : messages["global.withdraw.methods.wallet"],
    });
  }, [bank, instapay, intl]);

  const ids = useMemo((): Array<keyof LocalMap> => {
    const ids: Array<keyof LocalMap> = [
      "page.invoices.id",
      "invoices.method",
      "page.invoices.amount",
    ];

    if (bank) ids.push("page.invoices.account");
    if (instapay) ids.push("page.invoices.username");
    if (wallet) ids.push("page.invoices.phone");
    if (invoice.bank) ids.push("page.invoices.bank");

    ids.push("page.invoices.date");
    return ids;
  }, [bank, instapay, invoice.bank, wallet]);

  const values = useMemo(() => {
    const values = [
      { id: 1, value: `#${invoice.id}` },
      { id: 2, value: method },
      {
        id: 3,
        value: (
          <span className="[&_.change]:text-xs">
            <Price value={invoice.amount} />
          </span>
        ),
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
              ? messages["page.invoices.status.rejected"]
              : canceledByAdmin
                ? messages["page.invoices.status.canceledByAdmin"]
                : canceledByReceiver
                  ? messages["page.invoices.status.canceledByReceiver"]
                  : messages[
                      "page.invoices.status.cancellationApprovedByAdmin"
                    ],
          })}
        >
          <p>
            {intl.formatMessage({
              id: messages["page.invoices.unexpected.status.note"],
            })}
          </p>
        </Alert>
      ) : null}

      {updatedByReceiver && invoice.update ? (
        <Alert
          type={AlertType.Warning}
          title={intl.formatMessage({
            id: messages["page.invoices.status.updatedByReceiver"],
          })}
        >
          <p>
            {intl.formatMessage({
              id: messages["page.invoices.status.updatedByReceiver.note"],
            })}
          </p>

          <InvoiceUpdates invoice={invoice} />
        </Alert>
      ) : null}

      {fulfilled ? (
        <Alert
          type={AlertType.Success}
          title={intl.formatMessage({
            id: messages["page.invoices.status.fulfilled"],
          })}
        >
          <div className="flex flex-col gap-1">
            <p>
              {intl.formatMessage({
                id: messages["page.invoices.status.fulfilled.note"],
              })}
            </p>
            <p>
              {intl.formatMessage({
                id: messages["page.invoices.unexpected.status.note"],
              })}
            </p>
          </div>
        </Alert>
      ) : null}

      {pending ? (
        <Alert
          type={AlertType.Info}
          title={intl.formatMessage({
            id: messages["page.invoices.status.pending"],
          })}
        >
          <div className="flex flex-col gap-1">
            <p>
              {intl.formatMessage({
                id: messages["page.invoices.status.pending.note"],
              })}
            </p>
            <p>
              {intl.formatMessage({
                id: messages["page.invoices.unexpected.status.note"],
              })}
            </p>
          </div>
        </Alert>
      ) : null}

      {invoice.note ? (
        <div className="border border-control rounded-md">
          <div className="w-full bg-surface-300 px-2 py-1.5">
            <p>{intl.formatMessage({ id: messages["page.invoices.note"] })}</p>
          </div>
          <div className="px-2 py-3">
            <RawHtml html={invoice.note} />
          </div>
        </div>
      ) : null}
    </Card>
  );
};

export default Invoice;
