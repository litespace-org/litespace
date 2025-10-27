import React, { useCallback } from "react";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useOnError } from "@/hooks/error";
import { ITransaction } from "@litespace/types";
import { useToast } from "@litespace/ui/Toast";
import PayWithVisa from "@litespace/assets/PayWithVisa";
import { TxTypeData } from "@/components/Checkout/types";
import { useLessonCheckoutUrl } from "@litespace/headless/lessons";
import { track } from "@/lib/analytics";
import { PLAN_PERIOD_LITERAL_TO_PLAN_PERIOD } from "@litespace/utils";
import { usePlanCheckoutUrl } from "@litespace/headless/plans";
import { Button } from "@litespace/ui/Button";
import { Typography } from "@litespace/ui/Typography";

const Payment: React.FC<{
  txTypeData: TxTypeData;
  transactionStatus?: ITransaction.Status;
}> = ({ txTypeData }) => {
  const intl = useFormatMessage();
  const toast = useToast();

  // ==================== pay with card ====================
  const onPayError = useOnError({
    type: "mutation",
    handler({ messageId }) {
      track("pay_with_card_err", "checkout");
      toast.error({
        title: intl("checkout.payment.failed.title"),
        description: intl(messageId),
      });
    },
  });

  // ==================== form ====================
  const onCheckoutUrlSuccess = useCallback((url: string) => {
    if (!url) return;
    document.location.assign(url);
  }, []);

  const planCheckoutMutation = usePlanCheckoutUrl({
    onSuccess: (url) => onCheckoutUrlSuccess(url),
    onError: onPayError,
  });

  const lessonCheckoutMutation = useLessonCheckoutUrl({
    onSuccess: (url) => onCheckoutUrlSuccess(url),
    onError: onPayError,
  });

  const onCheckout = useCallback(() => {
    if (txTypeData.type === "paid-plan") {
      return planCheckoutMutation.mutate({
        planId: txTypeData.data.plan?.id || -1,
        period: PLAN_PERIOD_LITERAL_TO_PLAN_PERIOD[txTypeData.data.period],
        returnUrl: document.location.toString(),
        paymentMethod: "CARD",
        saveCardInfo: true,
      });
    }

    if (txTypeData.type === "paid-lesson") {
      return lessonCheckoutMutation.mutate({
        duration: txTypeData.data.duration,
        tutorId: txTypeData.data.tutor?.id || -1,
        slotId: txTypeData.data.slotId,
        start: txTypeData.data.start,
        returnUrl: document.location.toString(),
        paymentMethod: "CARD",
        saveCardInfo: true,
      });
    }
  }, [
    planCheckoutMutation,
    lessonCheckoutMutation,
    txTypeData.data,
    txTypeData.type,
  ]);

  return (
    <div className="flex flex-col items-center gap-4 max-w-[320px] md:max-w-full">
      <PayWithVisa />

      <div className="flex flex-col gap-4">
        <Typography tag="h1" className="text-caption font-bold text-center">
          {intl("checkout.payment.card.ready-to-pay.title")}
        </Typography>

        <Typography tag="p" className="text-caption font-medium text-center">
          {intl("checkout.payment.card.ready-to-pay.desc")}
        </Typography>
      </div>

      <Button
        size="large"
        type="main"
        className="w-full mt-2"
        onClick={onCheckout}
        loading={
          lessonCheckoutMutation.isPending || planCheckoutMutation.isPending
        }
        disabled={
          lessonCheckoutMutation.isPending || planCheckoutMutation.isPending
        }
      >
        {intl("checkout.payment.go-to-pay-page")}
      </Button>
    </div>
  );
};

export default Payment;
