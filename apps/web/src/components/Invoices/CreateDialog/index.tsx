import { Bank } from "@/components/Invoices";
import { Instapay } from "@/components/Invoices";
import { NoMethod } from "@/components/Invoices";
import Wallet from "@/components/Invoices/CreateDialog/Wallet";
import { useOnError } from "@/hooks/error";
import dayjs from "@/lib/dayjs";
import TransactionMinus from "@litespace/assets/TransactionMinus";
import { useCreateInvoice } from "@litespace/headless/invoices";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
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
  const { sm } = useMediaQuery();

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
      position={sm ? "center" : "bottom"}
      open={open}
      close={onClose}
      title={
        <div className="w-full flex items-center gap-2">
          <TransactionMinus className="w-6 h-6 md:w-8 md:h-8 [&>*]>stroke-natural-950" />
          <Typography
            tag="span"
            className="text-body md:text-subtitle-2 font-bold text-natural-950 flex-grow"
          >
            {intl("invoices.create-dialog.title")}
          </Typography>
        </div>
      }
      className="w-full max-w-[512px] sm:w-auto sm:min-w-[512px]"
    >
      <div className="mt-4 md:mt-6 flex flex-col gap-8 md:gap-6">
        <Typography tag="p" className="text-body font-bold text-natural-950">
          {dayjs().format("dddd - DD MMMM YYYY")}
        </Typography>
        <div className="flex flex-col gap-6 justify-center">
          {method === undefined ? (
            <NoMethod
              onClose={onClose}
              setAmount={setAmount}
              setMethod={setMethod}
            />
          ) : null}

          {method === IInvoice.WithdrawMethod.Wallet ? (
            <Wallet
              amount={amount}
              setAmount={setAmount}
              onClose={onClose}
              setMethod={setMethod}
              submit={(payload) => createInvoice.mutate(payload)}
              loading={createInvoice.isPending}
            />
          ) : null}

          {method === IInvoice.WithdrawMethod.Bank ? (
            <Bank
              amount={amount}
              setAmount={setAmount}
              onClose={onClose}
              setMethod={setMethod}
              submit={(payload) => createInvoice.mutate(payload)}
              loading={createInvoice.isPending}
            />
          ) : null}

          {method === IInvoice.WithdrawMethod.Instapay ? (
            <Instapay
              amount={amount}
              setAmount={setAmount}
              onClose={onClose}
              setMethod={setMethod}
              submit={(payload) => createInvoice.mutate(payload)}
              loading={createInvoice.isPending}
            />
          ) : null}
        </div>
      </div>
    </Dialog>
  );
};

export default CreateInvoiceDialog;
