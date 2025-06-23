import { IInvoice, Void } from "@litespace/types";
import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { NumericInput } from "@litespace/ui/NumericInput";
import { Select, SelectList } from "@litespace/ui/Select";
import { Typography } from "@litespace/ui/Typography";
import { isEmpty } from "lodash";
import { useMemo } from "react";

export const AmountAndMethod: React.FC<{
  amount?: number;
  amountState?: "error";
  amountHelper?: string;
  setAmount: (val: number) => void;
  method?: IInvoice.WithdrawMethod;
  methodState?: "error";
  methodHelper?: string;
  setMethod: (val: IInvoice.WithdrawMethod) => void;
}> = ({
  amount,
  amountState,
  amountHelper,
  setAmount,
  method,
  methodState,
  methodHelper,
  setMethod,
}) => {
  const intl = useFormatMessage();

  const options: SelectList<IInvoice.WithdrawMethod> = useMemo(
    () => [
      {
        label: intl("withdraw.methods.instapay"),
        value: IInvoice.WithdrawMethod.Instapay,
      },
      {
        label: intl("withdraw.methods.bank"),
        value: IInvoice.WithdrawMethod.Bank,
      },
      {
        label: intl("withdraw.methods.wallet"),
        value: IInvoice.WithdrawMethod.Wallet,
      },
    ],
    [intl]
  );

  return (
    <div className="flex flex-col sm:flex-row items-start gap-6 [&>*]:flex-1">
      <NumericInput
        id="amount"
        label={intl("invoices.create-dialog.amount")}
        dir="rtl"
        placeholder={intl("invoices.create-dialog.amount-placeholder")}
        onValueChange={({ floatValue }) => {
          if (floatValue === undefined) return;
          setAmount(floatValue);
        }}
        value={amount}
        autoComplete="off"
        state={amountState}
        helper={amountHelper || intl("invoice.amount.range")}
        thousandSeparator=","
        decimalScale={0}
        allowNegative={false}
      />

      <Select
        id="method"
        label={intl("invoices.create-dialog.withdrawal-method")}
        asButton={isEmpty(options)}
        options={options}
        placeholder={intl(
          "invoices.create-dialog.withdrawal-method.placeholder"
        )}
        value={method}
        state={methodState}
        onChange={(value) => setMethod(value)}
        helper={methodHelper}
      />
    </div>
  );
};

export const Actions: React.FC<{
  loading?: boolean;
  submit: Void;
  close: Void;
}> = ({ loading, submit, close }) => {
  const intl = useFormatMessage();

  return (
    <div className="flex gap-6">
      <Button
        className="flex-1"
        size="large"
        onClick={submit}
        loading={loading}
        disabled={loading}
      >
        <Typography
          tag="span"
          className="text text-natural-50 text-body font-medium"
        >
          {intl("invoices.create-dialog.btn-label")}
        </Typography>
      </Button>
      <Button
        className="flex-1"
        size="large"
        type="main"
        variant="secondary"
        onClick={close}
      >
        <Typography
          tag="span"
          className="text text-brand-500 text-body font-medium"
        >
          {intl("labels.cancel")}
        </Typography>
      </Button>
    </div>
  );
};
