import { Actions, AmountAndMethod } from "@/components/Invoices";
import { useForm } from "@litespace/headless/form";
import { IInvoice, Void } from "@litespace/types";
import { useMakeValidators } from "@litespace/ui/hooks/validation";
import { validateInvoiceAmount } from "@litespace/ui/lib/validate";
import React from "react";

type FormProps = {
  amount: number;
  method: IInvoice.WithdrawMethod | null;
};

export const NoMethod: React.FC<{
  onClose: Void;
  setAmount: (val: number) => void;
  setMethod: (val: IInvoice.WithdrawMethod) => void;
}> = ({ onClose, setAmount, setMethod }) => {
  const validators = useMakeValidators<FormProps>({
    amount: {
      required: true,
      validate: validateInvoiceAmount,
    },
    method: {
      required: true,
    },
  });

  const form = useForm<FormProps>({
    defaults: {
      amount: 0,
      method: null,
    },
    validators,
    onSubmit() {
      // just for triggering validation
    },
  });

  return (
    <div className="flex flex-col gap-8 md:gap-6 justify-center">
      <AmountAndMethod
        amount={form.state.amount}
        amountState={form.errors.amount ? "error" : undefined}
        amountHelper={form.errors.amount}
        setAmount={(val) => {
          form.set("amount", val);
          setAmount(val);
        }}
        setMethod={setMethod}
        methodState={form.errors.method ? "error" : undefined}
        methodHelper={form.errors.method}
      />
      <Actions close={onClose} submit={form.submit} />
    </div>
  );
};

export default NoMethod;
