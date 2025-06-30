import { Bank } from "@/components/Invoices";
import { Instapay } from "@/components/Invoices";
import { NoMethod } from "@/components/Invoices";
import Wallet from "@/components/Invoices/CreateDialog/Wallet";
import { useOnError } from "@/hooks/error";
import dayjs from "@/lib/dayjs";
import TransactionMinus from "@litespace/assets/TransactionMinus";
import { useCreateInvoice } from "@litespace/headless/invoices";
import { IInvoice, Void } from "@litespace/types";
import { Dialog } from "@litespace/ui/Dialog";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useToast } from "@litespace/ui/Toast";
import { Typography } from "@litespace/ui/Typography";
import React, { useCallback, useState } from "react";

export const CreateInvoiceDialog: React.FC<{
  open: boolean;
  close: Void;
  refetch: Void;
}> = ({ open, close, refetch }) => {
  const intl = useFormatMessage();
  const toast = useToast();
  const [amount, setAmount] = useState<number>(0);
  const [method, setMethod] = useState<IInvoice.WithdrawMethod | undefined>(
    undefined
  );

  const onClose = useCallback(() => {
    close();
    setMethod(undefined);
    setAmount(0);
  }, [close]);

  const onSuccess = useCallback(() => {
    toast.success({ title: intl("invoices.create-toast.success") });
    onClose();
    refetch();
  }, [intl, onClose, refetch, toast]);

  const onError = useOnError({
    type: "mutation",
    handler: () => toast.error({ title: intl("invoices.create-toast.error") }),
  });

  const createInvoice = useCreateInvoice({ onSuccess, onError });

  return (
    <Dialog
      open={open}
      close={onClose}
      title={
        <div className="w-full flex items-center gap-2">
          <TransactionMinus className="w-8 h-8 [&>*]>stroke-natural-950" />
          <Typography
            tag="span"
            className="text-subtitle-2 font-bold text-natural-950 flex-grow"
          >
            {intl("invoices.dialog.create.title")}
          </Typography>
        </div>
      }
      className="min-w-[512px]"
    >
      <div className="mt-6 flex flex-col gap-6 justify-center">
        <Typography tag="p" className="text-body font-bold text-natural-950">
          {dayjs().format("dddd - DD MMMM YYYY")}
        </Typography>

        {method === undefined ? (
          <NoMethod
            onClose={onClose}
            setMethod={setMethod}
            setAmount={setAmount}
          />
        ) : null}

        {method === IInvoice.WithdrawMethod.Wallet ? (
          <Wallet
            amount={amount}
            onClose={onClose}
            setMethod={setMethod}
            submit={(payload) => createInvoice.mutate(payload)}
            loading={createInvoice.isPending}
          />
        ) : null}

        {method === IInvoice.WithdrawMethod.Bank ? (
          <Bank
            amount={amount}
            onClose={onClose}
            setMethod={setMethod}
            submit={(payload) => createInvoice.mutate(payload)}
            loading={createInvoice.isPending}
          />
        ) : null}

        {method === IInvoice.WithdrawMethod.Instapay ? (
          <Instapay
            amount={amount}
            onClose={onClose}
            setMethod={setMethod}
            submit={(payload) => createInvoice.mutate(payload)}
            loading={createInvoice.isPending}
          />
        ) : null}
      </div>
    </Dialog>
  );
};

export default CreateInvoiceDialog;
