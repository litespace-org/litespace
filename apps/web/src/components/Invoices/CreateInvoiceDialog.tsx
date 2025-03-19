import React, { useCallback } from "react";
import { Dialog } from "@litespace/ui/Dialog";
import { IInvoice, IWithdrawMethod, Void } from "@litespace/types";
import TransactionMinus from "@litespace/assets/TransactionMinus";
import { Typography } from "@litespace/ui/Typography";
import dayjs from "@/lib/dayjs";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Controller, Field, Form, Label } from "@litespace/ui/Form";
import { useForm } from "react-hook-form";
import {
  useRequired,
  useValidateInstapayEmail,
  useValidateInvoiceAmount,
  useValidatePhone,
  useValidateUserName,
} from "@litespace/ui/hooks/validation";
import { Button } from "@litespace/ui/Button";
import { useCreateInvoice } from "@litespace/headless/invoices";
import { useToast } from "@litespace/ui/Toast";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import { price } from "@litespace/utils";

type IForm = {
  amount: number;
  method: IWithdrawMethod.Type;
  name: string;
  bank: IInvoice.Bank;
  account: string;
  phone: string;
  instapay: string;
};

export const CreateInvoiceDialog: React.FC<{
  open: boolean;
  close: Void;
  refresh: Void;
}> = ({ open, refresh, close }) => {
  const intl = useFormatMessage();
  const toast = useToast();
  const required = useRequired();
  const { md } = useMediaQuery();

  const { control, formState, handleSubmit, watch, reset } = useForm<IForm>();

  const onClose = useCallback(() => {
    reset();
    close();
  }, [close, reset]);

  const onSuccess = useCallback(() => {
    toast.success({ title: intl("invoices.create.success") });
    refresh();
    onClose();
  }, [intl, onClose, refresh, toast]);

  const onError = useCallback(
    (error: unknown) => {
      toast.error({
        title: intl("invoices.create.error"),
        description: (error as Error).message,
      });
    },
    [intl, toast]
  );

  const createInvoice = useCreateInvoice({ onSuccess, onError });
  const amountRules = useValidateInvoiceAmount();
  const validateUsername = useValidateUserName(true);
  const validatePhone = useValidatePhone(true);
  const validateInstapay = useValidateInstapayEmail(true);

  const onSubmit = useCallback(
    (data: IForm) => {
      const payload = {
        amount: price.scale(data.amount),
        method: data.method,
        name: data.name,
        bank: data.bank,
        receiver: data.account || data.phone || data.instapay,
      };

      createInvoice.mutate(payload);
    },
    [createInvoice]
  );

  return (
    <Dialog
      open={open}
      close={onClose}
      position={md ? "center" : "bottom"}
      title={
        <div className="flex gap-2">
          <TransactionMinus className="w-6 h-6 md:w-8 md:h-8 stroke-natural-950" />
          <Typography
            tag="h5"
            className="text-body md:text-subtitle-2 font-bold text-natural-950 "
          >
            {intl("invoices.withdrawal-request.create")}
          </Typography>
        </div>
      }
      className="w-full max-w-[450px] md:max-w-[695px] md:w-[695px]"
    >
      <Form onSubmit={handleSubmit(onSubmit)}>
        <div className="pt-4 md:pt-6 grid grid-cols-2 gap-y-6 gap-x-6">
          <Typography
            tag="p"
            className="text-natural-950 text-body font-bold col-span-2 mb-2 md:mb-0"
          >
            {dayjs().format("dddd - DD MMMM YYYY")}
          </Typography>
          <Field
            className="col-span-2 md:col-span-1 !gap-1"
            label={
              <Label className="!text-caption !font-semibold !mb-0">
                {intl("invoices.dialog.amount")}
              </Label>
            }
            field={
              <Controller.NumericInput
                control={control}
                name="amount"
                value={watch("amount")}
                dir="rtl"
                allowNegative={false}
                decimalScale={2}
                rules={amountRules}
                state={formState.errors.amount ? "error" : undefined}
                helper={formState.errors.amount?.message}
                placeholder={intl("invoices.dialog.placeholder.amount")}
              />
            }
          />
          <Field
            className="col-span-2 md:col-span-1 !gap-1"
            label={
              <Label className="!text-caption !font-semibold !mb-0">
                {intl("invoices.table.withdrawal-method")}
              </Label>
            }
            field={
              <Controller.Select
                control={control}
                name="method"
                options={[
                  {
                    label: intl("invoices.method.bank"),
                    value: IWithdrawMethod.Type.Bank,
                  },
                  {
                    label: intl("invoices.method.instapay"),
                    value: IWithdrawMethod.Type.Instapay,
                  },
                  {
                    label: intl("invoices.method.wallet"),
                    value: IWithdrawMethod.Type.Wallet,
                  },
                ]}
                placeholder={intl("invoices.dialog.placeholder.method")}
                value={watch("method")}
                helper={formState.errors.method?.message}
                rules={{ required }}
                state={formState.errors.method ? "error" : undefined}
              />
            }
          />
          {watch("method") === IWithdrawMethod.Type.Bank ? (
            <>
              <Field
                className="col-span-2 !gap-1"
                label={
                  <Label className="!text-caption !font-semibold !mb-0">
                    {intl("invoices.dialog.user-name")}
                  </Label>
                }
                field={
                  <Controller.Input
                    control={control}
                    name="name"
                    placeholder={intl("invoices.dialog.placeholder.name")}
                    value={watch("name")}
                    rules={{ validate: validateUsername }}
                    state={formState.errors.name ? "error" : undefined}
                    helper={formState.errors.name?.message}
                  />
                }
              />

              <Field
                className="col-span-2 md:col-span-1 !gap-1"
                label={
                  <Label className="!text-caption !font-semibold !mb-0">
                    {intl("invoices.method.bank")}
                  </Label>
                }
                field={
                  <Controller.Select
                    control={control}
                    name="bank"
                    options={[
                      {
                        label: intl("banks.labels.alex"),
                        value: IInvoice.Bank.Alex,
                      },
                      {
                        label: intl("banks.labels.cib"),
                        value: IInvoice.Bank.Cib,
                      },
                    ]}
                    placeholder={intl("invoices.dialog.placeholder.bank")}
                    value={watch("bank")}
                    rules={{ required }}
                    helper={formState.errors.bank?.message}
                    state={formState.errors.bank ? "error" : undefined}
                  />
                }
              />

              <Field
                className="col-span-2 md:col-span-1 !gap-1"
                label={
                  <Label className="!text-caption !font-semibold !mb-0">
                    {intl("invoices.account")}
                  </Label>
                }
                field={
                  <Controller.Input
                    control={control}
                    name="account"
                    dir="rtl"
                    value={watch("account")}
                    rules={{
                      required,
                    }}
                    state={formState.errors.account ? "error" : undefined}
                    helper={formState.errors.account?.message}
                    placeholder={intl("invoices.dialog.placeholder.account")}
                  />
                }
              />
            </>
          ) : null}

          {watch("method") === IWithdrawMethod.Type.Wallet ? (
            <Field
              className="col-span-2 !gap-1"
              label={
                <Label className="!text-caption !font-semibold !mb-0">
                  {intl("invoices.phone.e-wallet")}
                </Label>
              }
              field={
                <Controller.PatternInput
                  name="phone"
                  control={control}
                  value={watch("phone")}
                  format="### #### ####"
                  rules={{ required, validate: validatePhone }}
                  placeholder={intl("invoices.dialog.placeholder.phone")}
                  state={formState.errors.phone ? "error" : undefined}
                  helper={formState.errors.phone?.message}
                  autoComplete="off"
                  idleDir="rtl"
                />
              }
            />
          ) : null}

          {watch("method") === IWithdrawMethod.Type.Instapay ? (
            <Field
              className="col-span-2 !gap-1"
              label={
                <Label className="!text-caption !font-semibold !mb-0">
                  {intl("invoices.dialog.instapay-email")}
                </Label>
              }
              field={
                <Controller.Input
                  name="instapay"
                  control={control}
                  value={watch("instapay")}
                  state={formState.errors.instapay ? "error" : undefined}
                  helper={formState.errors.instapay?.message}
                  placeholder={intl("invoices.dialog.placeholder.instapay")}
                  type="text"
                  rules={{ required, validate: validateInstapay }}
                />
              }
            />
          ) : null}
        </div>

        <div className="flex gap-6 w-full [&>*]:flex-1 mt-8 md:mt-6">
          <Button
            size="large"
            className="col-span-1"
            loading={createInvoice.isPending}
            disabled={createInvoice.isPending || !formState.isValid}
            htmlType="submit"
          >
            <Typography
              tag="span"
              className="text-body font-medium text-natural-50"
            >
              {intl("invoices.dialog.create")}
            </Typography>
          </Button>
          <Button
            onClick={close}
            size="large"
            variant="secondary"
            className="col-span-1"
            htmlType="button"
            disabled={createInvoice.isPending}
          >
            <Typography
              tag="span"
              className="text-brand-700 text-body font-medium"
            >
              {intl("labels.cancel")}
            </Typography>
          </Button>
        </div>
      </Form>
    </Dialog>
  );
};

export default CreateInvoiceDialog;
