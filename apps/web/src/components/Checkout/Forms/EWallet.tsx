import React from "react";
import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useMakeValidators } from "@litespace/ui/hooks/validation";
import { Typography } from "@litespace/ui/Typography";
import { useForm } from "@litespace/headless/form";
import { validatePhone } from "@litespace/ui/lib/validate";
import { PatternInput } from "@litespace/ui/PatternInput";
import { useOnError } from "@/hooks/error";
import { usePayWithEWallet } from "@litespace/headless/fawry";
import { IPlan, Void } from "@litespace/types";
import { walletPaymentQrCode } from "@/lib/cache";
import { useToast } from "@litespace/ui/Toast";

type Form = {
  phone: string;
  wphone: string;
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

  // ==================== pay with ewallet ====================
  const onError = useOnError({
    type: "mutation",
    handler({ messageId }) {
      toast.error({
        title: intl("checkout.payment.failed.title"),
        description: intl(messageId),
      });
    },
  });

  const payWithEWallet = usePayWithEWallet({
    onError,
    onSuccess(response) {
      if (response.walletQr) walletPaymentQrCode.save(response.walletQr);
      sync();
    },
  });

  // ==================== form ====================
  const validators = useMakeValidators<Form>({
    phone: {
      required: true,
      validate: validatePhone,
    },
    wphone: {
      required: true,
      validate: validatePhone,
    },
  });

  const form = useForm<Form>({
    defaults: {
      phone: phone || "",
      wphone: "",
    },
    validators,
    onSubmit(data) {
      payWithEWallet.mutate({
        planId,
        period,
        wallet: data.wphone,
        phone: data.phone,
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
          <Typography tag="p" className="text-caption md:text-body font-medium">
            {intl("checkout.payment.description")}
          </Typography>

          <PatternInput
            id="wallet-phone"
            mask=" "
            idleDir="ltr"
            inputSize="large"
            name="wallet-phone"
            format="### #### ####"
            label={intl("checkout.payment.ewallet.wallet-phone-number")}
            placeholder={intl(
              "checkout.payment.ewallet.wallet-phone-number-placeholder"
            )}
            state={form.errors.wphone ? "error" : undefined}
            helper={form.errors.wphone}
            value={form.state.wphone}
            autoComplete="off"
            onValueChange={({ value }) => form.set("wphone", value)}
            disabled={syncing || payWithEWallet.isPending}
          />

          <PatternInput
            id="phone"
            mask=" "
            idleDir="ltr"
            inputSize="large"
            name="phone"
            format="### #### ####"
            label={intl("checkout.payment.ewallet.personal-phone")}
            placeholder={intl(
              "checkout.payment.ewallet.personal-phone-placeholder"
            )}
            state={form.errors.phone ? "error" : undefined}
            helper={form.errors.phone}
            value={form.state.phone}
            autoComplete="off"
            disabled={!!phone || syncing || payWithEWallet.isPending}
            onValueChange={({ value }) => form.set("phone", value)}
          />
        </div>

        <Button
          type="main"
          size="large"
          htmlType="submit"
          className="w-full"
          disabled={payWithEWallet.isPending || syncing}
          loading={payWithEWallet.isPending}
        >
          <Typography tag="span" className="text text-body font-medium">
            {intl("checkout.payment.confirm")}
          </Typography>
        </Button>
      </form>
    </div>
  );
};

export default Payment;
