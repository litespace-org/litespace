import React from "react";
import { Actions, AmountAndMethod } from "@/components/Invoices";
import { useForm } from "@litespace/headless/form";
import { IInvoice, Void } from "@litespace/types";
import { useMakeValidators } from "@litespace/ui/hooks/validation";
import {
  validateInstapayIPA,
  validateInvoiceAmount,
  validateInvoiceMethod,
} from "@litespace/ui/lib/validate";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Input } from "@litespace/ui/Input";
import { price } from "@litespace/utils";

type FormProps = {
  amount: number;
  method: IInvoice.WithdrawMethod.Instapay;
  receiver: string;
};

export const Instapay: React.FC<{
  amount: number;
  loading: boolean;
  setAmount: (val: number) => void;
  onClose: Void;
  setMethod: (val: IInvoice.WithdrawMethod) => void;
  submit: (payload: IInvoice.CreateApiPayload) => void;
}> = ({ amount, loading, setAmount, onClose, setMethod, submit }) => {
  const intl = useFormatMessage();

  const validators = useMakeValidators<FormProps>({
    amount: {
      required: true,
      validate: validateInvoiceAmount,
    },
    method: {
      required: true,
      validate: validateInvoiceMethod,
    },
    receiver: {
      required: true,
      validate: validateInstapayIPA,
    },
  });

  const form = useForm<FormProps>({
    defaults: {
      amount,
      method: IInvoice.WithdrawMethod.Instapay,
      receiver: "",
    },
    validators,
    onSubmit() {
      submit({
        amount: price.scale(form.state.amount),
        method: IInvoice.WithdrawMethod.Instapay,
        receiver: form.state.receiver,
      });
    },
  });

  return (
    <div className="flex flex-col gap-8 md:gap-6">
      <div className="flex flex-col gap-6">
        <AmountAndMethod
          amount={form.state.amount}
          amountState={form.errors.amount ? "error" : undefined}
          amountHelper={form.errors.amount}
          setAmount={(val) => {
            form.set("amount", val);
            setAmount(val);
          }}
          method={IInvoice.WithdrawMethod.Instapay}
          methodState={form.errors.method ? "error" : undefined}
          methodHelper={form.errors.method}
          setMethod={setMethod}
        />
        <Input
          id="instapay-ipa"
          type="text"
          label={intl("invoices.create-dialog.instapay.label")}
          idleDir="ltr"
          placeholder={intl("invoices.create-dialog.instapay.placeholder")}
          value={form.state.receiver}
          onChange={(e) => form.set("receiver", e.target.value)}
          state={form.errors.receiver ? "error" : undefined}
          helper={form.errors.receiver}
        />
      </div>
      <Actions submit={form.submit} close={onClose} loading={loading} />
    </div>
  );
};

export default Instapay;
