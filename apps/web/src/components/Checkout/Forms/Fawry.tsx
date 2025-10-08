import React, { useCallback } from "react";
import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useMakeValidators } from "@litespace/ui/hooks/validation";
import { Typography } from "@litespace/ui/Typography";
import { useForm } from "@litespace/headless/form";
import { validatePhone } from "@litespace/ui/lib/validate";
import { PatternInput } from "@litespace/ui/PatternInput";
import { Void } from "@litespace/types";
import { useOnError } from "@/hooks/error";
import { usePayWithFawry } from "@litespace/headless/fawry";
import { useToast } from "@litespace/ui/Toast";
import { TxTypeData } from "@/components/Checkout/types";
import { useCreateLessonWithFawry } from "@litespace/headless/lessons";

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

  const onSuccess = useCallback(() => {
    sync();
  }, [sync]);

  const pay = usePayWithFawry({ onError, onSuccess });
  const createLesson = useCreateLessonWithFawry({
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
        pay.mutate({
          phone: data.phone,
          planId: txTypeData.data.plan.id,
          period: txTypeData.data.period,
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
      <form onSubmit={form.onSubmit} className="flex flex-col gap-6">
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
            label={intl("checkout.payment.fawry.phone")}
            placeholder={intl("checkout.payment.fawry.phone-placeholder")}
            state={form.errors.phone ? "error" : undefined}
            helper={form.errors.phone}
            value={form.state.phone}
            autoComplete="off"
            disabled={
              !!phone || pay.isPending || createLesson.isPending || syncing
            }
            onValueChange={({ value }) => form.set("phone", value)}
          />
        </div>

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
      </form>
    </div>
  );
};

export default Payment;
