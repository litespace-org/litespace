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
import { track } from "@/lib/analytics";
import Lock from "@litespace/assets/Lock";

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
      track("pay_with_ewallet_err", "checkout");
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

  const pay = usePayWithEWallet({ onError, onSuccess });
  const createLesson = useCreateLessonWithEWallet({
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
      track("pay_with_ewallet", "checkout", txTypeData.type);
      if (txTypeData.type === "paid-plan" && txTypeData.data.plan)
        pay.mutate({
          planId: txTypeData.data.plan.id,
          period: txTypeData.data.period,
          phone: data.phone,
        });

      if (txTypeData.type === "paid-lesson" && txTypeData.data.tutor)
        createLesson.mutate({
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
        name="pay-with-ewallet"
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
            disabled={
              !!phone || syncing || pay.isPending || createLesson.isPending
            }
            onValueChange={({ value }) => form.set("phone", value)}
            onBlur={() => {
              track("enter_phone", "checkout", form.state.phone);
            }}
          />
        </div>
        <div>
          <Typography
            tag="p"
            className="hidden md:block text-caption text-brand-700 mb-1"
          >
            {intl("checkout.payment.conditions-acceptance")}
          </Typography>
          <Button
            type="main"
            size="large"
            htmlType="submit"
            className="w-full"
            disabled={pay.isPending || createLesson.isPending || syncing}
            loading={pay.isPending || createLesson.isPending}
          >
            <Typography tag="span" className="text text-body font-medium">
              {intl("checkout.payment.confirm")}
            </Typography>
          </Button>
        </div>
        <div className="hidden md:flex flex-col gap-2">
          <div className="flex gap-2">
            <Lock className="w-6 h-6" />
            <Typography tag="p" className="text-body font-semibold">
              {intl("checkout.payment.safe-and-crypted")}
            </Typography>
          </div>
          <Typography tag="p" className="text-caption text-natural-600">
            {intl("checkout.payment.ensure-your-financial-privacy")}
          </Typography>
        </div>
      </form>
    </div>
  );
};

export default Payment;
