import { Button } from "@/components/Button";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { Loader, LoadingError } from "@/components/Loading";
import { Typography } from "@/components/Typography";
import { formatNumber } from "@/components/utils";
import { useFormatMessage } from "@/hooks";
import dayjs from "@/lib/dayjs";
import { LocalId } from "@/locales";
import CheckCircle from "@litespace/assets/CheckCircle";
import CloseCircle from "@litespace/assets/CloseCircle";
import EmptyInvoices from "@litespace/assets/EmptyInvoices";
import Error from "@litespace/assets/Error";
import Note2 from "@litespace/assets/Note2";
import TransactionMinus from "@litespace/assets/TransactionMinus";
import Trash from "@litespace/assets/Trash";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import { IInvoice, IWithdrawMethod, Void } from "@litespace/types";
import { Loading } from "@litespace/ui/Loading";
import cn from "classnames";
import { isEmpty } from "lodash";
import React, { useMemo } from "react";
import { InView } from "react-intersection-observer";

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

export const InvoicesTable: React.FC<{
  invoices: Array<{
    id: number;
    createdAt: string;
    amount: number; // scaled amount; remember to use value.unscale()
    method: IWithdrawMethod.Type;
    receiver: string;
    status: Exclude<IInvoice.Status, IInvoice.Status.UpdatedByReceiver>;
  }>;
  fetching: boolean;
  hasMore: boolean;
  loading: boolean;
  error: boolean;
  open: boolean;
  deleteLoading: number | null;
  more: Void;
  retry: Void;
  close: Void;
  onDelete: (id: number) => void;
}> = ({
  invoices,
  fetching,
  hasMore,
  loading,
  error,
  open,
  deleteLoading,
  more,
  retry,
  close,
  onDelete,
}) => {
  const intl = useFormatMessage();
  const { md, lg } = useMediaQuery();

  const columns = useMemo(() => {
    const date = intl("invoices.table.date");
    const amount = intl("invoices.table.duration");
    const withdrawalMethod = intl("invoices.table.tutor");
    const requestState = intl("invoices.table.request-state");

    return [date, amount, withdrawalMethod, requestState];
  }, [intl]);

  if (loading)
    return (
      <div className="flex items-center justify-center w-full h-[40vh]">
        <Loader size="medium" text={intl("invoices.table.loading")} />
      </div>
    );

  if (error && retry)
    return (
      <div className="flex items-center justify-center w-full h-[40vh]">
        <LoadingError
          size="medium"
          error={intl("invoices.table.error")}
          retry={retry}
        />
      </div>
    );

  return (
    <div>
      {md ? (
        <div className="grid md:grid-cols-12 lg:grid-cols-11 pb-2 border-b border-natural-500 md:mb-4">
          {columns.map((column, idx) => (
            <div
              key={column}
              className={cn("text-start", {
                "md:col-span-3":
                  idx === 0 ||
                  (idx === 1 && isEmpty(invoices)) ||
                  (idx === 2 && isEmpty(invoices)) ||
                  (idx === 3 && !isEmpty(invoices)),
                "md:col-span-2":
                  (idx === 1 && !isEmpty(invoices)) ||
                  (idx === 3 && isEmpty(invoices)),
                "md:col-span-4 lg:col-span-3": idx === 2 && !isEmpty(invoices),
              })}
            >
              <Typography
                tag="span"
                className="text-natural-600 text-caption font-normal"
              >
                {column}
              </Typography>
            </div>
          ))}
        </div>
      ) : null}

      {isEmpty(invoices) ? (
        <div className="flex flex-col items-center gap-2 mt-[7vh]">
          <div
            className={cn("flex flex-col gap-6 justify-center items-center")}
          >
            <EmptyInvoices className="w-[178px] h-[178px] md:w-[282px] md:h-[282px]" />
            <Typography
              tag="h4"
              className={cn(
                "text-body md:text-subtitle-1 text-natural-950 font-semibold"
              )}
            >
              {intl("invoices.table.empty")}
            </Typography>
          </div>
          <Button
            size={md ? "large" : "medium"}
            endIcon={<TransactionMinus className="icon w-4 h-4" />}
          >
            <Typography
              tag="span"
              className="text-body text-natural-50 font-medium"
            >
              {intl("invoices.withdrawal-request.create")}
            </Typography>
          </Button>
        </div>
      ) : null}

      {!isEmpty(invoices) ? (
        <div
          className={cn(
            "flex flex-col gap-4",
            "bg-natural-50 md:bg-transparent border md:border-none border-transparent hover:border-natural-100",
            "shadow-ls-x-small md:shadow-transparent p-4 md:p-0 rounded-lg md:rounded-none"
          )}
        >
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="grid md:grid-cols-12 lg:grid-cols-11 items-center"
            >
              <div
                className={cn(
                  "text-start col-span-11 md:col-span-3 mb-1 md:mb-0"
                )}
              >
                <Typography
                  tag="span"
                  className="inline-block text-natural-950 text-caption lg:text-body font-semibold md:font-normal"
                >
                  {dayjs(invoice.createdAt).format("dddd - DD MMMM YYYY")}
                </Typography>
              </div>
              <div className="text-start col-span-2 w-[75px] md:w-auto">
                <Typography
                  tag="span"
                  className="text-natural-600 md:text-natural-950 text-tiny md:text-caption lg:text-body font-normal"
                >
                  {intl("global.currency.egp", {
                    value: formatNumber(invoice.amount),
                  })}
                </Typography>
              </div>
              <div className="text-start md:col-span-4 lg:col-span-3">
                <Typography
                  tag="span"
                  className="inline-block text-natural-600 md:text-natural-950 text-tiny md:text-caption lg:text-body font-normal"
                >
                  {intl(METHODS_MAP[invoice.method])}
                  &nbsp;-&nbsp;
                </Typography>
                <Typography
                  tag="span"
                  className="inline-block text-natural-600 md:text-natural-700 text-tiny md:text-caption lg:text-body font-normal"
                >
                  {invoice.receiver}
                </Typography>
              </div>
              <div className="flex gap-2 text-start col-span-11 md:col-span-3 lg:col-span-3 mt-2 md:mt-0">
                <div
                  className={cn(
                    "flex justify-center items-center gap-[10px] px-2 py-[5px] md:p-2 lg:px-[14px] border rounded-lg md:w-[86px] lg:w-[134px]",
                    {
                      "bg-warning-200 border-warning-700":
                        invoice.status === IInvoice.Status.Pending,
                      "bg-natural-200 border-natural-700":
                        invoice.status === IInvoice.Status.CanceledByReceiver ||
                        invoice.status ===
                          IInvoice.Status.CancellationApprovedByAdmin,
                      "bg-brand-200 border-brand-700":
                        invoice.status === IInvoice.Status.Fulfilled,
                      "bg-destructive-200 border-destructive-700":
                        invoice.status === IInvoice.Status.Rejected,
                    }
                  )}
                >
                  {(lg && invoice.status === IInvoice.Status.Pending) ||
                  (lg &&
                    invoice.status === IInvoice.Status.CanceledByReceiver) ? (
                    <Note2
                      className={cn(
                        "w-6 h-6",
                        invoice.status === IInvoice.Status.Pending
                          ? "[&>*]:stroke-warning-700"
                          : "[&>*]:stroke-natural-700"
                      )}
                    />
                  ) : null}
                  {lg && invoice.status === IInvoice.Status.Fulfilled ? (
                    <CheckCircle className="w-6 h-6 [&>*]:stroke-brand-700" />
                  ) : null}
                  {lg && invoice.status === IInvoice.Status.Rejected ? (
                    <CloseCircle className="w-6 h-6 [&>*]:stroke-destructive-700" />
                  ) : null}
                  {lg &&
                  invoice.status ===
                    IInvoice.Status.CancellationApprovedByAdmin ? (
                    <Error className="w-6 h-6 !fill-none [&>*>*]:!stroke-natural-700" />
                  ) : null}
                  <Typography
                    tag="span"
                    className={cn(
                      "inline-block text-tiny font-normal md:font-semibold",
                      {
                        "text-warning-700":
                          invoice.status === IInvoice.Status.Pending,
                        "text-natural-700":
                          invoice.status ===
                            IInvoice.Status.CanceledByReceiver ||
                          invoice.status ===
                            IInvoice.Status.CancellationApprovedByAdmin,
                        "text-brand-700":
                          invoice.status === IInvoice.Status.Fulfilled,
                        "text-destructive-700":
                          invoice.status === IInvoice.Status.Rejected,
                      }
                    )}
                  >
                    {intl(STATUSES_MAP[invoice.status])}
                  </Typography>
                </div>
                {invoice.status === IInvoice.Status.Pending ? (
                  <ConfirmationDialog
                    open={open}
                    close={close}
                    title={intl("invoices.cancel-dialog.title")}
                    description={intl("invoices.cancel-dialog.description")}
                    trigger={
                      <div className="border border-destructive-700 px-2 md:px-3 lg:px-4 h-full flex justify-center items-center rounded-lg">
                        <Trash className="w-4 h-4 [&>*]:stroke-destructive-700" />
                      </div>
                    }
                    actions={{
                      primary: {
                        label: intl("global.labels.cancel"),
                        onClick: () => onDelete(invoice.id),
                        loading: deleteLoading === invoice.id,
                        disabled: deleteLoading === invoice.id,
                      },
                      secondary: {
                        label: intl("labels.go-back"),
                        onClick: close,
                      },
                    }}
                    icon={
                      <TransactionMinus className="w-6 h-6 [&>*]:!stroke-destructive-700" />
                    }
                    type="error"
                  />
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {!fetching && hasMore ? (
        <InView
          as="div"
          onChange={(inView) => {
            if (inView && hasMore) more();
          }}
        />
      ) : null}

      {fetching && !loading ? <Loading /> : null}
    </div>
  );
};

export default InvoicesTable;
