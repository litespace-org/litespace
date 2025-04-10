import React, { useMemo } from "react";
import PageTitle from "@/components/Common/PageTitle";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
// import { useFindInvoices } from "@litespace/headless/invoices";
import Calendar from "@litespace/assets/Calendar";
import DollarCircle from "@litespace/assets/DollarCircle";
import Wallet from "@litespace/assets/Wallet";
import AlertCircle from "@litespace/assets/AlertCircle";
import { Typography } from "@litespace/ui/Typography";
import Trash from "@litespace/assets/Trash";
import dayjs from "@/lib/dayjs";
import { faker } from "@faker-js/faker/locale/ar";
import { IInvoice, IWithdrawMethod } from "@litespace/types";
import { range } from "lodash";
import { formatNumber } from "@litespace/ui/utils";
import { LocalId } from "@litespace/ui/locales";
import cn from "classnames";
import { Button } from "@litespace/ui/Button";
import ChevronDoubleRight from "@litespace/assets/ChevronDoubleRight";
import ArrowRight from "@litespace/assets/ArrowRight";
import ChevronDoubleLeft from "@litespace/assets/ChevronDoubleLeft";
import ArrowLeft from "@litespace/assets/ArrowLeft";

const methods = [
  IWithdrawMethod.Type.Bank,
  IWithdrawMethod.Type.Instapay,
  IWithdrawMethod.Type.Wallet,
];

const statuses: Exclude<IInvoice.Status, IInvoice.Status.UpdatedByReceiver>[] =
  [
    IInvoice.Status.Fulfilled,
    IInvoice.Status.Pending,
    IInvoice.Status.Rejected,
    IInvoice.Status.CanceledByReceiver,
    IInvoice.Status.CanceledByReceiver,
    IInvoice.Status.CancellationApprovedByAdmin,
  ];

function makeInvoice(minAmount = 100, maxAmount = 10_000) {
  const method = methods[Math.floor(Math.random() * 3)];
  return {
    id: faker.number.int(),
    createdAt: faker.date.past().toISOString(),
    amount: faker.number.int({ min: minAmount, max: maxAmount }),
    method,
    receiver:
      method === IWithdrawMethod.Type.Bank
        ? faker.finance.accountNumber()
        : faker.phone.number({ style: "national" }).toString(),
    status: statuses[Math.floor(Math.random() * 6)],
  };
}

const METHODS_MAP: Record<IWithdrawMethod.Type, LocalId> = {
  instapay: "withdraw.methods.instapay",
  bank: "withdraw.methods.bank",
  wallet: "withdraw.methods.wallet",
};

const STATUSES_MAP: {
  [key in Exclude<IInvoice.Status, IInvoice.Status.UpdatedByReceiver>]: LocalId;
} = {
  fulfilled: "invoices.withdrawal.status.fulfilled",
  pending: "invoices.withdrawal.status.pending",
  rejected: "invoices.withdrawal.status.rejected",
  "canceled-by-receiver": "invoices.withdrawal.status.canceled-by-receiver",
  "cancellation-approved-by-admin":
    "invoices.withdrawal.status.cancellation-approved-by-admin",
};

const InvoicesTable: React.FC = () => {
  const intl = useFormatMessage();

  // const invoices = useFindInvoices({ userOnly: false });

  const columns = useMemo(() => {
    const date = {
      title: intl("table.date"),
      icon: <Calendar className="w-6 h-6 [&>*]:stroke-natural-950" />,
    };
    const amount = {
      title: intl("table.amount"),
      icon: <DollarCircle className="w-6 h-6 [&>*]:stroke-natural-950" />,
    };
    const method = {
      title: intl("table.withdrawal-method"),
      icon: <Wallet className="w-6 h-6 [&>*]:stroke-natural-950" />,
    };
    const state = {
      title: intl("table.request-state"),
      icon: <AlertCircle className="w-6 h-6 [&>*>*]:stroke-natural-950" />,
    };

    return [date, amount, method, state];
  }, [intl]);

  return (
    <div className="w-full flex flex-col gap-6">
      <PageTitle title={intl("invoices.title")} />
      <div className="flex flex-col rounded-lg border border-transparent hover:border-natural-100 shadow-table">
        <div className="grid grid-cols-12 hover:bg-natural-100">
          {columns.map((column) => (
            <div
              key={column.title}
              className={cn(
                "flex gap-[10px] col-span-3 items-center p-4 border-b"
              )}
            >
              {column.icon}
              <Typography
                tag="h5"
                className="text-subtitle-2 text-natural-950 font-semibold"
              >
                {column.title}
              </Typography>
            </div>
          ))}
        </div>
        <div className="w-full bg-natural-50 grid grid-cols-12">
          {range(20)
            .map(() => makeInvoice())
            .map((invoice, idx) => (
              <React.Fragment key={idx}>
                <div className="col-span-3 p-4 border-b">
                  <Typography
                    tag="p"
                    className="text-body font-semibold text-natrual-800"
                  >
                    {dayjs(invoice.createdAt).format("dddd D/M/YYYY")}
                  </Typography>
                </div>
                <div className="col-span-3 p-4 border-b">
                  <Typography
                    tag="p"
                    className="text-body font-semibold text-natrual-800"
                  >
                    {intl("global.currency.egp", {
                      value: formatNumber(+invoice.amount),
                    })}
                  </Typography>
                </div>
                <div className="col-span-3 p-4 border-b flex flex-col gap-[10px]">
                  <Typography
                    tag="p"
                    className="text-body font-semibold text-natrual-800"
                  >
                    {intl(METHODS_MAP[invoice.method])}
                  </Typography>
                  <Typography
                    tag="p"
                    className="text-body font-semibold text-natrual-800"
                  >
                    {invoice.receiver}
                  </Typography>
                </div>
                <div className="col-span-3 p-4 flex items-center justify-between border-b">
                  <Typography
                    tag="p"
                    className={cn("text-body font-semibold", {
                      "text-warning-600":
                        invoice.status === IInvoice.Status.Pending,
                      "text-destructive-700":
                        invoice.status === IInvoice.Status.Rejected ||
                        invoice.status ===
                          IInvoice.Status.CancellationApprovedByAdmin,
                      "text-brand-700":
                        invoice.status === IInvoice.Status.Fulfilled,
                    })}
                  >
                    {intl(STATUSES_MAP[invoice.status])}
                  </Typography>
                  {invoice.status === IInvoice.Status.Pending ? (
                    <Trash className="w-4 h-4 hover:cursor-pointer" />
                  ) : null}
                </div>
              </React.Fragment>
            ))}
        </div>
      </div>
      <footer className="relative flex items-center justify-center gap-4 pt-4">
        <Button
          size="small"
          type="main"
          variant="tertiary"
          onClick={() => {}} // () => goto(1)
          disabled={false} // page <= 1 || loading || fetching
          startIcon={<ChevronDoubleRight className="icon" />}
        />
        <Button
          size="small"
          type="main"
          variant="tertiary"
          onClick={() => {}} // prev
          disabled={false} // page <= 1 || loading || fetching
          startIcon={<ArrowRight className="icon" />}
        />
        <Button
          size="small"
          type="main"
          variant="tertiary"
          onClick={() => {}} // next
          disabled={false} // page >= totalPages || loading || fetching
          startIcon={<ArrowLeft className="icon" />}
        />
        <Button
          size={"small"}
          type={"main"}
          variant={"tertiary"}
          onClick={() => {}} // () => goto(totalPages)
          disabled={false} // page >= totalPages || loading || fetching
          startIcon={<ChevronDoubleLeft className="icon" />}
        />
      </footer>
    </div>
  );
};

export default InvoicesTable;
