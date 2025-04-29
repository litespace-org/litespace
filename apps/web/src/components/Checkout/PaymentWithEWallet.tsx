import React from "react";
import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useMakeValidators } from "@litespace/ui/hooks/validation";
import { Typography } from "@litespace/ui/Typography";
import { useForm } from "@litespace/headless/form";
import { isValidPhone } from "@litespace/ui/lib/validate";
import { PatternInput } from "@litespace/ui/PatternInput";

type Form = {
  phone: string;
  wphone: string;
};

const Payment: React.FC<{
  phone: string | null;
}> = ({ phone }) => {
  const intl = useFormatMessage();

  // ==================== form ====================
  const validators = useMakeValidators<Form>({
    phone: {
      required: true,
      validate: isValidPhone,
    },
    wphone: {
      required: true,
      validate: isValidPhone,
    },
  });

  const form = useForm<Form>({
    defaults: {
      phone: phone || "",
      wphone: "",
    },
    validators,
    onSubmit(_) {
      alert("not implemeted yet!")
    },
  });

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.submit();
        }}
        className="flex flex-col gap-6"
      >
        <div className="flex flex-col gap-4">
          <Typography tag="p" className="text-body font-medium">
            {intl("checkout.payment.description")}
          </Typography>

          <PatternInput
            id="wallet-phone"
            mask=" "
            idleDir="rtl"
            inputSize="large"
            name="wallet-phone"
            format="### #### ####"
            label={intl("checkout.payment.wallet-phone-number")}
            placeholder={intl("checkout.payment.wallet-phone-number-placeholder")}
            state={form.errors.wphone ? "error" : undefined}
            helper={form.errors.wphone}
            value={form.state.wphone}
            autoComplete="off"
            onValueChange={({ value }) => form.set("wphone", value)}
          />

          <PatternInput
            id="phone"
            mask=" "
            idleDir="rtl"
            inputSize="large"
            name="phone"
            format="### #### ####"
            label={intl("checkout.payment.phone-number")}
            placeholder={intl("checkout.payment.phone-number-placeholder")}
            state={form.errors.phone ? "error" : undefined}
            helper={form.errors.phone}
            value={form.state.phone}
            autoComplete="off"
            disabled={!!phone}
            onValueChange={({ value }) => form.set("phone", value)}
          />
        </div>

        <Button
          type="main"
          size="large"
          htmlType="submit"
          className="w-full"
          disabled={false}
          loading={false}
        >
          {intl("checkout.payment.confirm-button")}
        </Button>
      </form>
    </div>
  );
};

export default Payment;
