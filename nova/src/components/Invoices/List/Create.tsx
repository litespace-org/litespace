import { useWithdrawMethod } from "@/hooks/withdraw";
import { atlas } from "@/lib/atlas";
import {
  Button,
  ButtonSize,
  destructureWithdrawMethod,
  Dialog,
  Field,
  Form,
  getWithdrawMethodIntlId,
  Input,
  Label,
  Select,
  useFormatMessage,
} from "@litespace/luna";
import { IInvoice, IWithdrawMethod } from "@litespace/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import React, { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";

type IForm = {
  method?: IWithdrawMethod.Type;
  bank?: IInvoice.Bank;
  phoneNumber?: string;
  accountNumber?: string;
  username?: string;
  amount?: number;
};

const CreateInvoice: React.FC<{
  open: boolean;
  close: () => void;
}> = ({ open, close }) => {
  const form = useForm<IForm>({
    defaultValues: {
      method: IWithdrawMethod.Type.Instapay,
    },
  });
  const { bank, instapay, wallet } = useWithdrawMethod(
    form.watch("method") || IWithdrawMethod.Type.Instapay
  );
  const intl = useFormatMessage();
  const methods = useQuery({
    queryFn: async () => await atlas.withdrawMethod.find(),
    queryKey: ["withdraw-methods"],
  });

  const methodOptions = useMemo(() => {
    if (!methods.data) return [];
    return methods.data
      .filter((method) => method.enabled)
      .map((method) => ({
        label: intl(getWithdrawMethodIntlId(method.type)),
        value: method.type,
      }));
  }, [intl, methods.data]);

  const banks = useMemo(() => {
    return [
      { label: intl("banks.labels.cib"), value: IInvoice.Bank.Cib },
      { label: intl("banks.labels.alex"), value: IInvoice.Bank.Alex },
    ];
  }, [intl]);

  const create = useMutation({
    mutationFn: async (payload: IInvoice.CreateApiPayload) => {
      return await atlas.invoice.create(payload);
    },
    mutationKey: ["create-invoice"],
  });

  const onSubmit = useMemo(
    () =>
      form.handleSubmit((fields: IForm) => {
        if (!fields.method || !fields.amount) return;
        const { bank, wallet, instapay } = destructureWithdrawMethod(
          fields.method
        );

        if (instapay && fields.username)
          return create.mutate({
            method: IWithdrawMethod.Type.Instapay,
            receiver: fields.username,
            amount: fields.amount,
            bank: null,
          });

        if (bank && fields.bank && fields.accountNumber)
          return create.mutate({
            method: IWithdrawMethod.Type.Bank,
            receiver: fields.accountNumber,
            bank: fields.bank,
            amount: fields.amount,
          });

        if (wallet && fields.phoneNumber)
          return create.mutate({
            method: IWithdrawMethod.Type.Wallet,
            receiver: fields.phoneNumber,
            amount: fields.amount,
            bank: null,
          });
      }),
    [create, form]
  );

  return (
    <Dialog
      title={intl("invoices.create.title")}
      open={open}
      close={close}
      className="w-full md:max-w-[700px]"
    >
      <Form onSubmit={onSubmit} className="flex flex-col gap-3">
        <Field
          label={<Label>{intl("invoices.method")}</Label>}
          field={
            <Controller
              control={form.control}
              name="method"
              render={({ field }) => (
                <Select
                  options={methodOptions}
                  value={form.watch("method")}
                  onChange={field.onChange}
                />
              )}
            />
          }
        />

        {bank ? (
          <Field
            label={<Label>{intl("invoices.create.form.bank")}</Label>}
            field={
              <Controller
                control={form.control}
                name="bank"
                render={({ field }) => (
                  <Select
                    options={banks}
                    onChange={field.onChange}
                    placeholder={intl("invoices.create.form.bank.placeholder")}
                    value={form.watch("bank")}
                  />
                )}
              />
            }
          />
        ) : null}

        {bank ? (
          <Field
            label={<Label>{intl("invoices.create.form.accountNumber")}</Label>}
            field={<Input />}
          />
        ) : null}

        {wallet ? (
          <Field
            label={<Label>{intl("invoices.create.form.phoneNumber")}</Label>}
            field={
              <Input
                placeholder={intl(
                  "invoices.create.form.phoneNumber.placeholder"
                )}
              />
            }
          />
        ) : null}

        {instapay ? (
          <Field
            label={<Label>{intl("invoices.create.form.username")}</Label>}
            field={
              <Input
                placeholder={intl("invoices.create.form.username.placeholder")}
              />
            }
          />
        ) : null}

        <Field
          label={<Label>{intl("invoices.create.form.amount")}</Label>}
          field={
            <Input
              placeholder={intl("invoices.create.form.amount.placeholder")}
            />
          }
        />

        <div className="mt-4">
          <Button
            size={ButtonSize.Small}
            disabled={create.isPending}
            loading={create.isPending}
          >
            {intl("global.labels.confirm")}
          </Button>
        </div>
      </Form>
    </Dialog>
  );
};

export default CreateInvoice;
