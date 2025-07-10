import { Actions, AmountAndMethod } from "@/components/Invoices";
import { useForm } from "@litespace/headless/form";
import { BANKS, IInvoice, Void } from "@litespace/types";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useMakeValidators } from "@litespace/ui/hooks/validation";
import { Input } from "@litespace/ui/Input";
import {
  validateBankname,
  validateBankNumber,
  validateInvoiceAmount,
  validateInvoiceMethod,
  validateUserName,
} from "@litespace/ui/lib/validate";
import { PatternInput } from "@litespace/ui/PatternInput";
import { Select, SelectList } from "@litespace/ui/Select";
import { getBankIntlId } from "@litespace/ui/utils";
import { price } from "@litespace/utils";
import { isEmpty } from "lodash";
import React, { useMemo } from "react";

type FormProps = {
  amount: number;
  method: IInvoice.WithdrawMethod.Bank;
  receiver: string;
  tutorName: string;
  bank: IInvoice.Bank;
};

export const Bank: React.FC<{
  amount: number;
  loading: boolean;
  setAmount: (val: number) => void;
  onClose: Void;
  setMethod: (val: IInvoice.WithdrawMethod) => void;
  submit: (payload: IInvoice.CreateApiPayload) => void;
}> = ({ amount, loading, setAmount, onClose, setMethod, submit }) => {
  const intl = useFormatMessage();

  const validators = useMakeValidators<FormProps>({
    amount: { required: true, validate: validateInvoiceAmount },
    method: { required: true, validate: validateInvoiceMethod },
    receiver: { required: true, validate: validateBankNumber },
    tutorName: { required: true, validate: validateUserName },
    bank: { required: true, validate: validateBankname },
  });

  const form = useForm<FormProps>({
    defaults: {
      amount,
      method: IInvoice.WithdrawMethod.Bank,
      receiver: "",
      tutorName: "",
      bank: IInvoice.BANKS[0],
    },
    validators,
    onSubmit() {
      submit({
        amount: price.scale(form.state.amount),
        method: IInvoice.WithdrawMethod.Bank,
        receiver: `${form.state.bank}:${form.state.receiver}`,
      });
    },
  });

  const options: SelectList<IInvoice.Bank> = useMemo(() => {
    return BANKS.map((bank) => ({
      label: getBankIntlId(bank),
      value: bank,
    }));
  }, []);

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
          method={IInvoice.WithdrawMethod.Bank}
          setMethod={setMethod}
        />
        <Input
          id="tutor-name"
          type="text"
          label={intl("invoices.create-dialog.username.label")}
          idleDir="ltr"
          placeholder={intl("labels.name.placeholder")}
          value={form.state.tutorName}
          onChange={(e) => form.set("tutorName", e.target.value)}
          state={form.errors.tutorName ? "error" : undefined}
          helper={form.errors.tutorName}
        />
        <div className="flex flex-col sm:flex-row gap-6 [&>*]:flex-1">
          <Select
            options={options}
            id="bank"
            asButton={isEmpty(options)}
            value={form.state.bank}
            onChange={(value) => form.set("bank", value)}
            label={intl("invoices.bank")}
            placeholder={intl("banks.labels.cib")}
            state={form.errors.bank ? "error" : undefined}
            helper={form.errors.bank}
          />
          <PatternInput
            mask=" "
            format="#### #### #### ####"
            type="text"
            id="account-number"
            label={intl("invoices.account")}
            placeholder={intl(
              "invoices.create-dialog.account-number.placeholder"
            )}
            onValueChange={({ value }) => form.set("receiver", value)}
            helper={form.errors.receiver}
            state={form.errors.receiver ? "error" : undefined}
            value={form.state.receiver}
          />
        </div>
      </div>
      <Actions submit={form.submit} close={onClose} loading={loading} />
    </div>
  );
};

export default Bank;
