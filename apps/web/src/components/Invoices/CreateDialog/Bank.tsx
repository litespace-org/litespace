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
  validateUserName,
} from "@litespace/ui/lib/validate";
import { Select, SelectList } from "@litespace/ui/Select";
import { isEmpty } from "lodash";
import React, { useMemo } from "react";

type FormProps = {
  amount: number;
  method: IInvoice.WithdrawMethod.Bank;
  receiver: string;
  name: string;
  bank: IInvoice.Bank;
};

export const Bank: React.FC<{
  amount: number;
  loading: boolean;
  onClose: Void;
  setMethod: (val: IInvoice.WithdrawMethod) => void;
  submit: (payload: IInvoice.CreateApiPayload) => void;
}> = ({ amount, loading, onClose, setMethod, submit }) => {
  const intl = useFormatMessage();

  const validators = useMakeValidators<FormProps>({
    amount: { required: true, validate: validateInvoiceAmount },
    receiver: { required: true, validate: validateBankNumber },
    name: { required: true, validate: validateUserName },
    bank: { required: true, validate: validateBankname },
  });

  const form = useForm<FormProps>({
    defaults: {
      amount,
      method: IInvoice.WithdrawMethod.Bank,
      receiver: "",
      name: "",
      bank: IInvoice.BANKS[0],
    },
    validators,
    onSubmit() {
      submit({
        amount: form.state.amount,
        method: IInvoice.WithdrawMethod.Bank,
        receiver: form.state.receiver,
      });
    },
  });

  const options: SelectList<IInvoice.Bank> = useMemo(
    () => [
      { label: intl("banks.labels.cib"), value: BANKS[0] },
      { label: intl("banks.labels.alex"), value: BANKS[1] },
      { label: intl("banks.labels.nbe"), value: BANKS[2] },
      { label: intl("banks.labels.misr"), value: BANKS[3] },
      { label: intl("banks.labels.qnb"), value: BANKS[4] },
      { label: intl("banks.labels.mashreq"), value: BANKS[5] },
      { label: intl("banks.labels.aaib"), value: BANKS[6] },
    ],
    [intl]
  );

  return (
    <div className="flex flex-col gap-6">
      <AmountAndMethod
        amount={form.state.amount}
        amountState={form.errors.amount ? "error" : undefined}
        amountHelper={form.errors.amount}
        setAmount={(val) => form.set("amount", val)}
        method={IInvoice.WithdrawMethod.Bank}
        setMethod={setMethod}
      />
      <Input
        id="instaMail"
        type="text"
        label={intl("invoices.dialog.create.username.label")}
        idleDir="ltr"
        placeholder={intl("labels.name.placeholder")}
        value={form.state.name}
        onChange={(e) => form.set("name", e.target.value)}
        state={form.errors.name ? "error" : undefined}
        helper={form.errors.name}
      />
      <div className="flex gap-6 [&>*]:flex-1">
        <Select
          options={options}
          id="bank"
          asButton={isEmpty(options)}
          value={form.state.bank}
          onChange={(value) => form.set("bank", value)}
          label={intl("invoices.bank")}
          placeholder={intl("banks.labels.cib")}
        />
        <Input
          type="text"
          id="account-number"
          label={intl("invoices.account")}
          placeholder={intl("invoices.dialog.account-number.placeholder")}
          onChange={(e) => form.set("receiver", e.target.value)}
          value={form.state.receiver}
        />
      </div>
      <Actions submit={form.submit} close={onClose} loading={loading} />
    </div>
  );
};

export default Bank;
