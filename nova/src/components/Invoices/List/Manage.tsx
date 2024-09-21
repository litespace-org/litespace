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
  toaster,
  useFormatMessage,
} from "@litespace/luna";
import { IInvoice, IWithdrawMethod } from "@litespace/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import React, { useCallback, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";

type IForm = {
  method: IWithdrawMethod.Type;
  bank?: IInvoice.Bank | null;
  phoneNumber?: string;
  accountNumber?: string;
  username?: string;
  amount: number;
};

const defaultMethod = IWithdrawMethod.Type.Instapay;

const ManageInvoice: React.FC<{
  open: boolean;
  close: () => void;
  refresh?: () => void;
  invoice?: IInvoice.Self;
}> = ({ open, close, refresh, invoice }) => {
  const form = useForm<IForm>({
    defaultValues: {
      method: defaultMethod,
      username: invoice?.receiver || "",
      phoneNumber: invoice?.receiver || "",
      accountNumber: invoice?.receiver || "",
      amount: invoice?.amount || 0,
      bank: invoice?.bank,
    },
  });
  const formData = form.watch();
  const { bank, instapay, wallet } = useWithdrawMethod(formData.method);

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

  const onSuccess = useCallback(() => {
    toaster.success({
      title: intl(
        invoice ? "invoices.edit.success" : "invoices.create.success"
      ),
    });
    close();
    form.reset();
    if (refresh) return refresh();
  }, [close, form, intl, invoice, refresh]);

  const onError = useCallback(
    (error: unknown) => {
      toaster.error({
        title: intl(invoice ? "invoices.edit.error" : "invoices.create.error"),
        description: error instanceof Error ? error.message : undefined,
      });
    },
    [intl, invoice]
  );

  const createUserInvoice = useCallback(
    async (payload: IInvoice.CreateApiPayload) => {
      return await atlas.invoice.create(payload);
    },
    []
  );

  const create = useMutation({
    mutationFn: createUserInvoice,
    mutationKey: ["create-invoice"],
    onSuccess,
    onError,
  });

  const updateUserInvoice = useCallback(
    async ({
      id,
      payload,
    }: {
      id: number;
      payload: IInvoice.UpdateByReceiverApiPayload;
    }) => {
      return await atlas.invoice.updateByReceiver(id, payload);
    },
    []
  );

  const update = useMutation({
    mutationFn: updateUserInvoice,
    mutationKey: ["update-invoice"],
    onSuccess,
    onError,
  });

  const constructReceiver = useCallback((fields: IForm) => {
    const { bank, wallet, instapay } = destructureWithdrawMethod(fields.method);
    if (instapay) return fields.username || null;
    if (wallet) return fields.phoneNumber || null;
    if (bank) return fields.accountNumber || null;
    return null;
  }, []);

  const constructPayload = useCallback(
    (fields: IForm) => {
      const receiver = constructReceiver(fields);
      const bank = fields.method === IWithdrawMethod.Type.Bank;
      if (!receiver) return null;
      return {
        method: fields.method,
        receiver,
        amount: fields.amount,
        bank: bank && fields.bank ? fields.bank : null,
      };
    },
    [constructReceiver]
  );

  const editInvoice = useCallback(
    (fields: IForm) => {
      const payload = constructPayload(fields);
      if (!invoice?.id || !payload) return;
      return update.mutate({
        id: invoice.id,
        payload: { updateRequest: payload },
      });
    },
    [constructPayload, invoice?.id, update]
  );
  const createInvoice = useCallback(
    (fields: IForm) => {
      const payload = constructPayload(fields);
      if (!payload) return null;
      return create.mutate(payload);
    },
    [constructPayload, create]
  );

  const onSubmit = useMemo(
    () =>
      form.handleSubmit((fields: IForm) => {
        if (invoice) return editInvoice(fields);
        return createInvoice(fields);
      }),
    [createInvoice, editInvoice, form, invoice]
  );

  const disabled = useMemo(() => {
    return (
      !!invoice &&
      invoice.method === formData.method &&
      invoice.receiver === constructReceiver(formData) &&
      invoice.amount == formData.amount &&
      invoice.bank === formData.bank
    );
  }, [constructReceiver, formData, invoice]);

  return (
    <Dialog
      title={
        invoice
          ? intl("invoices.edit.title", {
              id: invoice.id,
            })
          : intl("invoices.create.title")
      }
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
                autoComplete="off"
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
                value={form.watch("username")}
                register={form.register("username")}
                error={form.formState.errors.username?.message}
                autoComplete="off"
              />
            }
          />
        ) : null}

        <Field
          label={<Label>{intl("invoices.create.form.amount")}</Label>}
          field={
            <Input
              placeholder={intl("invoices.create.form.amount.placeholder")}
              register={form.register("amount")}
              value={form.watch("amount").toString()}
              error={form.formState.errors.amount?.message}
              autoComplete="off"
            />
          }
        />

        <div className="mt-4">
          <Button
            size={ButtonSize.Small}
            disabled={create.isPending || disabled}
            loading={create.isPending}
          >
            {intl(invoice ? "global.labels.edit" : "global.labels.confirm")}
          </Button>
        </div>
      </Form>
    </Dialog>
  );
};

export default ManageInvoice;
