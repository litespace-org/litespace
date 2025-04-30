import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useMakeValidators } from "@litespace/ui/hooks/validation";
import { Typography } from "@litespace/ui/Typography";
import { useForm } from "@litespace/headless/form";
import { isValidPhone } from "@litespace/ui/lib/validate";
import { PatternInput } from "@litespace/ui/PatternInput";
import { IPlan } from "@litespace/types";
import { useOnError } from "@/hooks/error";
import { usePayWithFawry } from "@litespace/headless/fawry";
import { useToast } from "@litespace/ui/Toast";

type Form = {
  phone: string;
};

const Payment: React.FC<{
  planId: number;
  period: IPlan.PeriodLiteral;
  phone: string | null;
  onStateChange: (pending: boolean) => void;
}> = ({ phone, planId, period, onStateChange }) => {
  const intl = useFormatMessage();
  const [submitDisabled, setSubmitDisabled] = useState(false);
  const toast = useToast();

  // ==================== pay with fawry ====================
  const onError = useOnError({
    type: "mutation",
    handler(error) {
      setSubmitDisabled(false);
      toast.error({ title: intl(error.messageId) });
    },
  });

  const payWithFawry = usePayWithFawry({
    onError,
    onSuccess() {
      window.location.reload();
    },
  });

  const disabled = useMemo(
    () => payWithFawry.isPending || submitDisabled,
    [payWithFawry.isPending, submitDisabled]
  );

  useEffect(() => onStateChange(disabled), [disabled, onStateChange]);

  // ==================== form ====================
  const validators = useMakeValidators<Form>({
    phone: {
      required: true,
      validate: isValidPhone,
    },
  });

  const form = useForm<Form>({
    defaults: {
      phone: phone || "",
    },
    validators,
    onSubmit(data) {
      setSubmitDisabled(true);
      payWithFawry.mutate({
        phone: data.phone,
        planId,
        period,
      });
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
          disabled={disabled}
          loading={payWithFawry.isPending}
        >
          {intl("checkout.payment.confirm-button")}
        </Button>
      </form>
    </div>
  );
};

export default Payment;
