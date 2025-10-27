import React, { useCallback, useEffect, useMemo } from "react";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useMakeValidators } from "@litespace/ui/hooks/validation";
import { useForm } from "@litespace/headless/form";
import { validateCvv, validatePhone } from "@litespace/ui/lib/validate";
import { SelectList } from "@litespace/ui/Select";
import {
  useGetAddCardUrl,
  useFindCardTokens,
  useDeleteCardToken,
  usePayWithCard,
  useCancelUnpaidOrder,
} from "@litespace/headless/fawry";
import { first } from "lodash";
import { useHotkeys } from "react-hotkeys-hook";
import { env } from "@/lib/env";
import { useOnError } from "@/hooks/error";
import { ITransaction } from "@litespace/types";
import { useToast } from "@litespace/ui/Toast";
import { IframeMessage } from "@/constants/iframe";
import { useLogger } from "@litespace/headless/logger";
import PayWithVisa from "@litespace/assets/PayWithVisa";
import { useBlock } from "@litespace/ui/hooks/common";
import { useRender } from "@litespace/headless/common";
import { TxTypeData } from "@/components/Checkout/types";
import {
  useCreateLessonWithCard,
  useLessonCheckoutUrl,
} from "@litespace/headless/lessons";
import { track } from "@/lib/analytics";
import { PLAN_PERIOD_LITERAL_TO_PLAN_PERIOD } from "@litespace/utils";
import { usePlanCheckoutUrl } from "@litespace/headless/plans";
import { Button } from "@litespace/ui/Button";
import { Typography } from "@litespace/ui/Typography";

type Form = {
  card: string;
  phone: string;
  cvv: string;
};

const Payment: React.FC<{
  userId: number;
  txTypeData: TxTypeData;
  phone: string | null;
  transactionId?: number;
  transactionStatus?: ITransaction.Status;
}> = ({ userId, txTypeData, phone, transactionId, transactionStatus }) => {
  const intl = useFormatMessage();
  const toast = useToast();
  const logger = useLogger();
  const addCardDialog = useRender();
  const confirmCloseAddCardDialog = useRender();
  const confirmClosePayDialog = useRender();

  // ==================== cancel payment ====================
  const onCancelError = useOnError({
    type: "mutation",
    handler(payload) {
      track("cancel_payment_err", "checkout");
      toast.error({
        id: "cancel-ewallet-payment",
        title: intl("checkout.payment.cancel-error"),
        description: intl(payload.messageId),
      });
    },
  });

  const cancelUnpaidOrder = useCancelUnpaidOrder({
    onError: onCancelError,
    onSuccess() {
      track("cancel_payment_ok", "checkout");
      confirmClosePayDialog.hide();
      pay.reset();
      createLesson.reset();
      toast.success({
        title: intl("checkout.payment.cancel-success"),
      });
    },
  });

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

  const pay = usePayWithCard({ onError: onPayError });
  const createLesson = useCreateLessonWithCard({ onError: onPayError });

  // ==================== form ====================
  const planCheckoutQuery = usePlanCheckoutUrl(
    txTypeData.type === "paid-plan"
      ? {
          planId: txTypeData.data.plan?.id || -1,
          period: PLAN_PERIOD_LITERAL_TO_PLAN_PERIOD[txTypeData.data.period],
          returnUrl: document.location.toString(),
          paymentMethod: "CARD",
          saveCardInfo: true,
        }
      : undefined
  );

  const lessonCheckoutQuery = useLessonCheckoutUrl(
    txTypeData.type === "paid-lesson"
      ? {
          duration: txTypeData.data.duration,
          tutorId: txTypeData.data.tutor?.id || -1,
          slotId: txTypeData.data.slotId,
          start: txTypeData.data.start,
          returnUrl: document.location.toString(),
          paymentMethod: "CARD",
          saveCardInfo: true,
        }
      : undefined
  );

  const fawryExpressUrl = useMemo(
    () =>
      txTypeData.type === "paid-plan"
        ? planCheckoutQuery?.data
        : lessonCheckoutQuery?.data,
    [planCheckoutQuery?.data, lessonCheckoutQuery?.data, txTypeData.type]
  );

  const validators = useMakeValidators<Form>({
    phone: {
      required: true,
      validate: validatePhone,
    },
    cvv: {
      required: true,
      validate: validateCvv,
    },
    card: { required: true },
  });

  const form = useForm<Form>({
    defaults: {
      card: "",
      phone: phone || "",
      cvv: "",
    },
    validators,
    onSubmit(data) {
      track("pay_with_card", "checkout", txTypeData.type);
      if (txTypeData.type === "paid-plan" && txTypeData.data.plan)
        pay.mutate({
          period: txTypeData.data.period,
          planId: txTypeData.data.plan.id,
          cardToken: data.card,
          phone: data.phone,
          cvv: data.cvv,
        });

      if (txTypeData.type === "paid-lesson" && txTypeData.data.tutor)
        createLesson.mutate({
          tutorId: txTypeData.data.tutor.id,
          slotId: txTypeData.data.slotId,
          start: txTypeData.data.start,
          duration: txTypeData.data.duration,
          cardToken: data.card,
          phone: data.phone,
          cvv: data.cvv,
        });
    },
  });

  const addCardTokenUrlQuery = useGetAddCardUrl();
  const findCardTokensQuery = useFindCardTokens(userId);

  useOnError({
    type: "query",
    error: findCardTokensQuery.error,
    keys: findCardTokensQuery.keys,
  });

  useOnError({
    type: "query",
    error: addCardTokenUrlQuery.error,
    keys: addCardTokenUrlQuery.keys,
  });

  const cardOptions = useMemo((): SelectList<string> => {
    if (!findCardTokensQuery.data) return [];
    return findCardTokensQuery.data.cards.map((card) => ({
      label: `**** **** **** ${card.lastFourDigits} `,
      value: card.token,
    }));
  }, [findCardTokensQuery.data]);

  // pre-select card
  useEffect(() => {
    const card = first(cardOptions);
    if (!form.state.card && card) form.set("card", card.value);
  }, [cardOptions, form]);

  // ==================== iframe messages ====================

  const onWindowMessage = useCallback(
    (event: MessageEvent<IframeMessage>) => {
      if (event.data.action === "close") {
        addCardDialog.hide();
        track("add_card_ok", "checkout");
      }

      if (event.data.action === "try-again") {
        // close then re-open the dialog
        addCardDialog.hide();
        track("add_card_err", "checkout");
        setTimeout(() => {
          addCardDialog.show();
          track("add_card", "checkout");
        }, 200);
      }

      if (event.data.action === "report") {
        logger.error({
          fawryErrorCode: event.data.fawryErrorCode,
          fawryErrorDescription: event.data.fawryErrorDescription,
        });
        addCardDialog.hide();
      }

      findCardTokensQuery.refetch();
    },
    [addCardDialog, findCardTokensQuery, logger]
  );

  useEffect(() => {
    window.addEventListener("message", onWindowMessage);
    return () => {
      window.removeEventListener("message", onWindowMessage);
    };
  }, [onWindowMessage]);

  // ==================== delete card token ====================

  const deleteCardToken = useDeleteCardToken({
    onSuccess() {
      findCardTokensQuery.refetch();
      track("remove_card_ok", "checkout");
    },
    onError() {
      track("remove_card_err", "checkout");
    },
  });

  useHotkeys(
    "ctrl+d",
    () => {
      if (!form.state.card) return;
      track("remove_card", "checkout");
      deleteCardToken.mutate({ cardToken: form.state.card, userId });
    },
    {
      preventDefault: true,
      enabled: !deleteCardToken.isPending && env.client !== "production",
    },
    [deleteCardToken, form.state]
  );

  // ==================== transaction status ====================
  const isTransactionPending = useMemo(() => {
    const pendingTx =
      transactionStatus === ITransaction.Status.New ||
      transactionStatus === ITransaction.Status.Processed;

    const pendingPlanPayment =
      pay.data?.transactionId !== transactionId ||
      (pay.data?.transactionId === transactionId && pendingTx);

    const pendingLessonPayment =
      createLesson.data?.transactionId !== transactionId ||
      (createLesson.data?.transactionId === transactionId && pendingTx);

    return pendingPlanPayment || pendingLessonPayment;
  }, [
    createLesson.data?.transactionId,
    pay.data?.transactionId,
    transactionId,
    transactionStatus,
  ]);

  // ==================== unsaved changes ====================

  useBlock(
    () => {
      return (
        addCardDialog.open ||
        confirmCloseAddCardDialog.open ||
        !!pay.data ||
        !!createLesson.data ||
        confirmClosePayDialog.open ||
        pay.isPending ||
        createLesson.isPending
      );
    },
    () => {
      const transactionId =
        pay.data?.transactionId || createLesson?.data?.transactionId;

      if (isTransactionPending && transactionId) {
        track("cancel_payment", "checkout");
        return cancelUnpaidOrder.mutate({ transactionId });
      }
    }
  );

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

      <Button size="large" type="main" className="w-full mt-2">
        <a href={fawryExpressUrl || ""}>
          {intl("checkout.payment.go-to-pay-page")}
        </a>
      </Button>
    </div>
  );
};

export default Payment;
