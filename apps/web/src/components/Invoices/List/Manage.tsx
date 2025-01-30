import { useWithdrawMethod } from "@/hooks/withdraw";
import { Button, ButtonSize } from "@litespace/ui/Button";
import {
  destructureWithdrawMethod,
  getWithdrawMethodIntlId,
} from "@litespace/ui/utils";
import { Dialog } from "@litespace/ui/Dialog";
import { Form, Field, Label, Controller } from "@litespace/ui/Form";
import { useToast } from "@litespace/ui/Toast";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { IInvoice, IWithdrawMethod } from "@litespace/types";
import React, { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import {
  useCreateInvoice,
  useEditUserInvoice,
  useFindWithdrawalMethods,
} from "@litespace/headless/invoices";
import { price } from "@litespace/utils/value";

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
  const methods = useFindWithdrawalMethods();
  const toast = useToast();

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
    toast.success({
      title: intl(
        invoice ? "invoices.edit.success" : "invoices.create.success"
      ),
    });
    close();
    form.reset();
    if (refresh) return refresh();
  }, [close, form, intl, invoice, refresh, toast]);

  const onError = useCallback(
    (error: unknown) => {
      toast.error({
        title: intl(invoice ? "invoices.edit.error" : "invoices.create.error"),
        description: error instanceof Error ? error.message : undefined,
      });
    },
    [intl, invoice, toast]
  );

  const create = useCreateInvoice({ onSuccess, onError });
  const update = useEditUserInvoice({ onSuccess, onError });

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
        amount: price.scale(fields.amount),
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
            <Controller.Select
              control={form.control}
              name="method"
              options={methodOptions}
              value={form.watch("method")}
            />
          }
        />

        {bank ? (
          <Field
            label={<Label>{intl("invoices.create.form.bank")}</Label>}
            field={
              <Controller.Select
                control={form.control}
                name="bank"
                options={banks}
                placeholder={intl("invoices.create.form.bank.placeholder")}
                value={form.watch("bank") || ""}
              />
            }
          />
        ) : null}

        {bank ? (
          <Field
            label={<Label>{intl("invoices.create.form.accountNumber")}</Label>}
            field={
              <Controller.Input control={form.control} name="accountNumber" />
            }
          />
        ) : null}

        {wallet ? (
          <Field
            label={<Label>{intl("invoices.create.form.phoneNumber")}</Label>}
            field={
              <Controller.Input
                control={form.control}
                name="phoneNumber"
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
              <Controller.Input
                control={form.control}
                name="username"
                placeholder={intl("invoices.create.form.username.placeholder")}
                value={form.watch("username")}
                state={
                  form.formState.errors.username?.message ? "error" : "success"
                }
                helper={form.formState.errors.username?.message}
                autoComplete="off"
              />
            }
          />
        ) : null}

        <Field
          label={<Label>{intl("invoices.create.form.amount")}</Label>}
          field={
            <Controller.Input
              control={form.control}
              name="amount"
              placeholder={intl("invoices.create.form.amount.placeholder")}
              value={form.watch("amount").toString()}
              state={
                form.formState.errors.amount?.message ? "error" : "success"
              }
              helper={form.formState.errors.amount?.message}
              autoComplete="off"
            />
          }
        />

        <div className="mt-4">
          <Button
            size={ButtonSize.Small}
            disabled={create.isPending || update.isPending || disabled}
            loading={create.isPending || update.isPending}
          >
            {intl(invoice ? "global.labels.edit" : "labels.confirm")}
          </Button>
        </div>
      </Form>
    </Dialog>
  );
};

export default ManageInvoice;
