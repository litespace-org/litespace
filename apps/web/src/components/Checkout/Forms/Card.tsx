import React, { useCallback, useEffect, useMemo } from "react";
import { Button } from "@litespace/ui/Button";
import AddCard from "@litespace/assets/AddCard";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useMakeValidators } from "@litespace/ui/hooks/validation";
import { Typography } from "@litespace/ui/Typography";
import { useForm } from "@litespace/headless/form";
import { isValidCvv, isValidPhone } from "@litespace/ui/lib/validate";
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
import { IPlan, Void } from "@litespace/types";
import { useToast } from "@litespace/ui/Toast";
import { IframeMessage } from "@/constants/iframe";
import { useLogger } from "@litespace/headless/logger";
import { ConfirmationDialog } from "@litespace/ui/ConfirmationDialog";
import RemoveCard from "@litespace/assets/RemoveCard";
import { useRender, useBlock } from "@litespace/ui/hooks/common";

type Form = {
  card: string;
  phone: string;
  cvv: string;
};

const Payment: React.FC<{
  planId: number;
  period: IPlan.PeriodLiteral;
  phone: string | null;
}> = ({ planId, period, phone }) => {
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

  const payWithCard = usePayWithCard({
    onError: onPayError,
  });

  // ==================== form ====================
  const validators = useMakeValidators<Form>({
    phone: {
      required: true,
      validate: isValidPhone,
    },
    cvv: {
      required: true,
      validate: isValidCvv,
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
      payWithCard.mutate({
        cardToken: data.card,
        cvv: data.cvv,
        phone: data.phone,
        period,
        planId,
      });
    },
  });

  const { query: addCardTokenUrlQuery } = useGetAddCardUrl();
  const { query: findCardTokensQuery } = useFindCardTokens();

  const cardOptions = useMemo((): SelectList<string> => {
    if (!findCardTokensQuery.data) return [];
    return findCardTokensQuery.data.cards.map((card) => ({
      label: `${card.lastFourDigits} **** **** ****`,
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
      deleteCardToken.mutate({ cardToken: form.state.card });
    },
    {
      preventDefault: true,
      enabled: !deleteCardToken.isPending && env.client !== "production",
    },
    [deleteCardToken, form.state]
  );

  // ==================== unsaved changes ====================

  useBlock(() => {
    return (
      addCardDialog.open ||
      confirmCloseAddCardDialog.open ||
      !!payWithCard.data ||
      confirmClosePayDialog.open
    );
  });

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
                type="main"
                variant="tertiary"
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
          disabled={payWithCard.isPending}
          loading={payWithCard.isPending}
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

      {payWithCard.data ? (
        <IframeDialog
          open
          onOpenChange={(open) => {
            if (!open) payWithCard.reset();
          }}
          url={payWithCard.data.redirectUrl}
        />
      ) : null}

      <ConfirmClosePayDialog
        open={confirmClosePayDialog.open}
        back={() => {
          confirmClosePayDialog.hide();
        }}
        canceling={cancelUnpaidOrder.isPending}
        cancel={() => {
          if (!payWithCard.data) return;
          cancelUnpaidOrder.mutate({
            transactionId: payWithCard.data.transactionId,
          });
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
          loading: canceling,
          disabled: canceling,
          onClick: back,
        },
        secondary: {
          label: intl("labels.confirm"),
          disabled: canceling,
          onClick: cancel,
        },
      }}
    />
  );
};

export default Payment;
