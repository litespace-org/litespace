import React, { useCallback } from "react";
import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useMakeValidators } from "@litespace/ui/hooks/validation";
import { Typography } from "@litespace/ui/Typography";
import { useForm } from "@litespace/headless/form";
import { validatePhone } from "@litespace/ui/lib/validate";
import { PatternInput } from "@litespace/ui/PatternInput";
import { useOnError } from "@/hooks/error";
import { usePayWithEWallet } from "@litespace/headless/fawry";
import { IFawry, ILesson, Void } from "@litespace/types";
import { walletPaymentQrCode } from "@/lib/cache";
import { useToast } from "@litespace/ui/Toast";
import { TxTypeData } from "@/components/Checkout/types";
import { useCreateLessonWithEWallet } from "@litespace/headless/lessons";

type Form = {
  phone: string;
};

const Payment: React.FC<{
  txTypeData: TxTypeData;
  phone: string | null;
  syncing: boolean;
  sync: Void;
}> = ({ phone, txTypeData, syncing, sync }) => {
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

  const onSuccess = useCallback(
    (
      response:
        | ILesson.CreateWithEWalletApiResponse
        | IFawry.PayWithEWalletResponse
    ) => {
      if (response.walletQr) walletPaymentQrCode.save(response.walletQr);
      sync();
    },
    [sync]
  );

  const payWithEWallet = usePayWithEWallet({ onError, onSuccess });
  const createLessonWithEWallet = useCreateLessonWithEWallet({
    onError,
    onSuccess,
  });

  // ==================== form ====================
  const validators = useMakeValidators<Form>({
    phone: {
      required: true,
      validate: validatePhone,
    },
  });

  const form = useForm<Form>({
    defaults: {
      phone: phone || "",
    },
    validators,
    onSubmit(data) {
      if (txTypeData.type === "paid-plan" && txTypeData.data.plan)
        payWithEWallet.mutate({
          planId: txTypeData.data.plan.id,
          period: txTypeData.data.period,
          phone: data.phone,
        });

      if (txTypeData.type === "paid-lesson" && txTypeData.data.tutor)
        createLessonWithEWallet.mutate({
          tutorId: txTypeData.data.tutor.id,
          slotId: txTypeData.data.slotId,
          start: txTypeData.data.start,
          duration: txTypeData.data.duration,
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
