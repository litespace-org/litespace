import React from "react";
import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useMakeValidators } from "@litespace/ui/hooks/validation";
import { Typography } from "@litespace/ui/Typography";
import { useForm } from "@litespace/headless/form";
import { isValidPhone } from "@litespace/ui/lib/validate";
import { PatternInput } from "@litespace/ui/PatternInput";
import { IPlan, Void } from "@litespace/types";
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
  syncing: boolean;
  sync: Void;
}> = ({ phone, planId, period, syncing, sync }) => {
  const intl = useFormatMessage();
  const toast = useToast();

  // ==================== pay with fawry ====================
  const onError = useOnError({
    type: "mutation",
    handler({ messageId }) {
      toast.error({
        title: intl("checkout.payment.failed.title"),
        description: intl(messageId),
      });
    },
  });

  const payWithFawry = usePayWithFawry({
    onError,
    onSuccess() {
      sync();
    },
  });

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
      payWithFawry.mutate({
        phone: data.phone,
        planId,
        period,
      });
    },
  });

  return (
    <div>
      <form onSubmit={form.onSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <Typography tag="p" className="text-body font-medium">
            {intl("checkout.payment.description")}
          </Typography>

          <PatternInput
            id="phone"
            mask=" "
            idleDir="ltr"
            inputSize="large"
            name="phone"
            format="### #### ####"
            label={intl("checkout.payment.fawry.phone")}
            placeholder={intl("checkout.payment.fawry.phone-placeholder")}
            state={form.errors.phone ? "error" : undefined}
            helper={form.errors.phone}
            value={form.state.phone}
            autoComplete="off"
            disabled={!!phone || payWithFawry.isPending || syncing}
            onValueChange={({ value }) => form.set("phone", value)}
          />
        </div>

        <Button
          type="main"
          size="large"
          htmlType="submit"
          className="w-full"
          disabled={payWithFawry.isPending || syncing}
          loading={payWithFawry.isPending}
        >
          {intl("checkout.payment.confirm")}
        </Button>
      </form>
    </div>
  );
};

export default Payment;
