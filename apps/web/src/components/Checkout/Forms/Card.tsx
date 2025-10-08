import React, { useCallback, useEffect, useMemo } from "react";
import { Button } from "@litespace/ui/Button";
import AddCard from "@litespace/assets/AddCard";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useMakeValidators } from "@litespace/ui/hooks/validation";
import { Typography } from "@litespace/ui/Typography";
import { useForm } from "@litespace/headless/form";
import { validateCvv, validatePhone } from "@litespace/ui/lib/validate";
import { Select, SelectList } from "@litespace/ui/Select";
import { PatternInput } from "@litespace/ui/PatternInput";
import {
  useGetAddCardUrl,
  useFindCardTokens,
  useDeleteCardToken,
  usePayWithCard,
  useCancelUnpaidOrder,
} from "@litespace/headless/fawry";
import { IframeDialog } from "@litespace/ui/IframeDilaog";
import { first, isEmpty } from "lodash";
import { useHotkeys } from "react-hotkeys-hook";
import { env } from "@/lib/env";
import { useOnError } from "@/hooks/error";
import { ITransaction, Void } from "@litespace/types";
import { useToast } from "@litespace/ui/Toast";
import { IframeMessage } from "@/constants/iframe";
import { useLogger } from "@litespace/headless/logger";
import { ConfirmationDialog } from "@litespace/ui/ConfirmationDialog";
import RemoveCard from "@litespace/assets/RemoveCard";
import { useBlock } from "@litespace/ui/hooks/common";
import { useRender } from "@litespace/headless/common";
import { TxTypeData } from "@/components/Checkout/types";
import { useCreateLessonWithCard } from "@litespace/headless/lessons";

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
      toast.error({
        title: intl("checkout.payment.failed.title"),
        description: intl(messageId),
      });
    },
  });

  const pay = usePayWithCard({ onError: onPayError });
  const createLesson = useCreateLessonWithCard({ onError: onPayError });

  // ==================== form ====================
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
      if (event.data.action === "close") addCardDialog.hide();

      if (event.data.action === "try-again") {
        // close then re-open the dialog
        addCardDialog.hide();
        setTimeout(() => addCardDialog.show(), 200);
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
    },
  });

  useHotkeys(
    "ctrl+d",
    () => {
      if (!form.state.card) return;
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

      if (isTransactionPending && transactionId)
        return cancelUnpaidOrder.mutate({ transactionId });
    }
  );

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.submit();
        }}
        className="flex flex-col gap-6 md:gap-4 lg:gap-6"
      >
        <div className="flex flex-col gap-4">
          <Typography tag="p" className="text-caption md:text-body font-medium">
            {intl("checkout.payment.description")}
          </Typography>

          <Select
            id="card"
            label={intl("checkout.payment.card.card-number")}
            className="flex-1"
            value={form.state.card}
            options={cardOptions}
            placeholder={intl("checkout.payment.card.card-number-placeholder")}
            valueDir="ltr"
            onChange={(value) => form.set("card", value)}
            state={form.errors.card ? "error" : undefined}
            helper={form.errors.card}
            asButton={isEmpty(cardOptions)}
            onTriggerClick={() => {
              if (!isEmpty(cardOptions)) return;
              addCardDialog.show();
            }}
            onOpenChange={(open) => {
              if (!open || !isEmpty(cardOptions)) return;
              addCardDialog.show();
            }}
            post={
              <Button
                type="natural"
                variant="primary"
                size="large"
                htmlType="button"
                startIcon={<AddCard className="icon" />}
                disabled={false}
                loading={false}
                onClick={() => addCardDialog.show()}
                className="ms-2 lg:ms-4 flex-shrink-0"
              >
                <Typography
                  tag="span"
                  className="text-caption md:text-body font-medium"
                >
                  {intl("checkout.payment.card.add-card")}
                </Typography>
              </Button>
            }
          />

          <div className="flex flex-col lg:flex-row gap-4">
            <PatternInput
              id="cvv"
              size={3}
              mask=" "
              format="###"
              idleDir="rtl"
              inputSize="large"
              label={intl("checkout.payment.card.cvv")}
              placeholder={intl("checkout.payment.card.cvv-placeholder")}
              state={form.errors.cvv ? "error" : undefined}
              helper={form.errors.cvv}
              onValueChange={({ value }) => form.set("cvv", value)}
              autoComplete="off"
            />
            <PatternInput
              id="phone"
              mask=" "
              idleDir="ltr"
              inputSize="large"
              name="phone"
              format="### #### ####"
              label={intl("checkout.payment.card.phone")}
              placeholder={intl("checkout.payment.card.phone-placeholder")}
              state={form.errors.phone ? "error" : undefined}
              helper={form.errors.phone}
              value={form.state.phone}
              autoComplete="off"
              disabled={!!phone}
              onValueChange={({ value }) => form.set("phone", value)}
            />
          </div>
        </div>

        <Button
          type="main"
          size="large"
          htmlType="submit"
          className="w-full"
          disabled={pay.isPending || createLesson.isPending}
          loading={pay.isPending || createLesson.isPending}
        >
          <Typography tag="span" className="text text-body font-medium">
            {intl("checkout.payment.confirm")}
          </Typography>
        </Button>

        <Typography tag="p" className="text-tiny font-normal text-natural-800">
          {intl("checkout.payment.card.confirmation-code-note")}
        </Typography>
      </form>

      <IframeDialog
        open={addCardDialog.open}
        url={addCardTokenUrlQuery.data?.url}
        loading={addCardTokenUrlQuery.isPending}
        onOpenChange={(open) => {
          if (!open) confirmCloseAddCardDialog.show();
        }}
      />

      <ConfirmCloseAddCardDialog
        open={confirmCloseAddCardDialog.open}
        back={() => {
          confirmCloseAddCardDialog.hide();
        }}
        cancel={() => {
          confirmCloseAddCardDialog.hide();
          addCardDialog.hide();
        }}
      />

      {pay.data || createLesson.data ? (
        <IframeDialog
          open
          onOpenChange={(open) => {
            if (!open && isTransactionPending)
              return confirmClosePayDialog.show();
            createLesson.reset();
            pay.reset();
          }}
          url={pay.data?.redirectUrl || createLesson.data?.redirectUrl}
        />
      ) : null}

      <ConfirmClosePayDialog
        open={confirmClosePayDialog.open}
        back={() => {
          confirmClosePayDialog.hide();
        }}
        canceling={cancelUnpaidOrder.isPending}
        cancel={() => {
          if (!pay.data && !createLesson.data) return;

          const pendingTx =
            transactionStatus !== ITransaction.Status.New &&
            transactionStatus === ITransaction.Status.Processed;
          const sameTx =
            pay.data?.transactionId === transactionId ||
            createLesson.data?.transactionId === transactionId;
          // only cancel the transaction in case it is still in the `new` status
          if (sameTx && !pendingTx) return;

          const cancelTxId =
            pay.data?.transactionId || createLesson?.data?.transactionId;

          if (cancelTxId)
            cancelUnpaidOrder.mutate({ transactionId: cancelTxId });
        }}
      />
    </div>
  );
};

const ConfirmCloseAddCardDialog: React.FC<{
  open: boolean;
  back: Void;
  cancel: Void;
}> = ({ open, back, cancel }) => {
  const intl = useFormatMessage();
  return (
    <ConfirmationDialog
      open={open}
      type="warning"
      title={intl("checkout.payment.card.confirm-close-add-card-dialog.title")}
      description={intl(
        "checkout.payment.card.confirm-close-add-card-dialog.desc"
      )}
      closable={false}
      icon={<RemoveCard />}
      actions={{
        primary: {
          label: intl("labels.go-back"),
          onClick: back,
        },
        secondary: {
          label: intl("labels.confirm"),
          onClick: cancel,
        },
      }}
    />
  );
};

const ConfirmClosePayDialog: React.FC<{
  open: boolean;
  back: Void;
  cancel: Void;
  canceling: boolean;
}> = ({ open, back, cancel, canceling }) => {
  const intl = useFormatMessage();
  return (
    <ConfirmationDialog
      open={open}
      type="warning"
      title={intl("checkout.payment.card.confirm-close-pay-dialog.title")}
      description={intl("checkout.payment.card.confirm-close-pay-dialog.desc")}
      closable={false}
      icon={<RemoveCard />}
      actions={{
        primary: {
          label: intl("labels.go-back"),
          disabled: canceling,
          onClick: back,
        },
        secondary: {
          label: intl("labels.confirm"),
          loading: canceling,
          disabled: canceling,
          onClick: cancel,
        },
      }}
    />
  );
};

export default Payment;
