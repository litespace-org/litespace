import React from "react";
import { Actions, AmountAndMethod } from "@/components/Invoices";
import { PatternInput } from "@litespace/ui/PatternInput";
import { useForm } from "@litespace/headless/form";
import { IInvoice, Void } from "@litespace/types";
import { useMakeValidators } from "@litespace/ui/hooks/validation";
import {
  validateInvoiceAmount,
  validateInvoiceMethod,
  validatePhone,
} from "@litespace/ui/lib/validate";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { price } from "@litespace/utils";

type FormProps = {
  amount: number;
  method: IInvoice.WithdrawMethod.Wallet;
  receiver: string;
};

export const Wallet: React.FC<{
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
      validate: validatePhone,
    },
  });

  const form = useForm<FormProps>({
    defaults: {
      amount,
      method: IInvoice.WithdrawMethod.Wallet,
      receiver: "",
    },
    validators,
    onSubmit() {
      submit({
        amount: price.scale(form.state.amount),
        method: IInvoice.WithdrawMethod.Wallet,
        receiver: form.state.receiver,
      });
    },
  });
  return (
    <div className="flex flex-col gap-8 md:gap-6">
      <div className="flex flex-col gap-6 justify-center">
        <AmountAndMethod
          setAmount={(val) => {
            form.set("amount", val);
            setAmount(val);
          }}
          setMethod={setMethod}
          amount={form.state.amount}
          amountHelper={form.errors.amount}
          amountState={form.errors.amount ? "error" : undefined}
          method={IInvoice.WithdrawMethod.Wallet}
          methodHelper={form.errors.method}
          methodState={form.errors.method ? "error" : undefined}
        />
        <PatternInput
          id="walletNumber"
          mask=" "
          idleDir="ltr"
          inputSize="large"
          name="walletNumber"
          format="### #### ####"
          label={intl("invoices.create-dialog.wallet-number.label")}
          placeholder={intl("labels.phone.placeholder")}
          state={form.errors.receiver ? "error" : undefined}
          helper={form.errors.receiver}
          value={form.state.receiver}
          autoComplete="off"
          onValueChange={({ value }) => form.set("receiver", value)}
        />
      </div>
      <Actions close={onClose} submit={form.submit} loading={loading} />
    </div>
  );
};

export default Wallet;
