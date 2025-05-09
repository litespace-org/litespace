import { Button } from "@litespace/ui/Button";
import { Dialog } from "@litespace/ui/Dialog";
import { Field, Form, Controller, Label } from "@litespace/ui/Form";
import { useToast } from "@litespace/ui/Toast";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { IInvoice } from "@litespace/types";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Action } from "@/components/Invoices/type";
import { useMutation } from "@tanstack/react-query";
import { Typography } from "@litespace/ui/Typography";
import { X } from "react-feather";
import { useApi } from "@litespace/headless/api";

type IForm = {
  note: string;
};

const Process: React.FC<{
  open: boolean;
  id: number;
  status: IInvoice.Status;
  action: Action;
  note: string | null;
  close: () => void;
  onUpdate?: () => void;
}> = ({ open, close, onUpdate, id, action, note }) => {
  const intl = useFormatMessage();
  const toast = useToast();
  const api = useApi();
  const ref = useRef<HTMLInputElement>(null);
  const [receipt, setReceipt] = useState<File | undefined>(undefined);
  const form = useForm<IForm>({
    defaultValues: {
      note: "",
    },
  });

  const onSuccess = useCallback(() => {
    toast.success({
      title: intl("invoices.process.success"),
    });
    close();
    if (onUpdate) return onUpdate();
  }, [close, intl, onUpdate, toast]);

  const onError = useCallback(
    (error: unknown) => {
      toast.error({
        title: intl("invoices.process.error"),
        description: error instanceof Error ? error.message : undefined,
      });
    },
    [intl, toast]
  );

  const update = useMutation({
    mutationFn: async (
      payload: IInvoice.UpdateByAdminApiPayload & { receipt?: File }
    ) => {
      return await api.invoice.updateByAdmin(id, payload);
    },
    onSuccess,
    onError,
  });

  const deleteNote = useMutation({
    mutationFn: async () => {
      // todo: update the invocie api with a "deleteNote" option
      return await api.invoice.updateByAdmin(id, { note: "" });
    },
    onSuccess,
    onError,
  });

  const {
    approveCancelRequest,
    approveUpdateRequest,
    markAsRejected,
    markAsFulfilled,
    editNote,
  } = useMemo(
    () => ({
      approveUpdateRequest: action === Action.ApproveUpdateRequest,
      approveCancelRequest: action === Action.ApproveCancelRequest,
      markAsFulfilled: action === Action.MarkAsFulfilled,
      markAsRejected: action === Action.MarkAsRejected,
      editNote: action === Action.EditNote,
    }),
    [action]
  );

  const status = useMemo(() => {
    if (approveCancelRequest)
      return IInvoice.Status.CancellationApprovedByAdmin;
    if (approveUpdateRequest) return IInvoice.Status.Pending;
    if (markAsFulfilled) return IInvoice.Status.Fulfilled;
    if (markAsRejected) return IInvoice.Status.Rejected;
    return null;
  }, [
    approveCancelRequest,
    approveUpdateRequest,
    markAsFulfilled,
    markAsRejected,
  ]);

  const onSubmit = useMemo(
    () =>
      form.handleSubmit(({ note }) => {
        update.mutate({ note, status: status || undefined, receipt });
      }),
    [form, status, update, receipt]
  );

  const label = useMemo(() => {
    if (approveUpdateRequest)
      return intl("invoices.process.submit.approveUpdateRequest");
    if (approveCancelRequest)
      return intl("invoices.process.submit.approveCancelRequest");
    if (markAsFulfilled) return intl("invoices.process.submit.markAsFulfilled");
    if (markAsRejected) return intl("invoices.process.submit.markAsRejected");
    if (editNote) return intl("global.labels.edit");
    return null;
  }, [
    approveUpdateRequest,
    approveCancelRequest,
    markAsFulfilled,
    markAsRejected,
    editNote,
    intl,
  ]);

  const title = useMemo(() => {
    if (approveUpdateRequest)
      return intl("invoices.process.actions.approveUpdateRequest");
    if (approveCancelRequest)
      return intl("invoices.process.actions.approveCancelRequest");
    if (markAsFulfilled)
      return intl("invoices.process.actions.markAsFulfilled");
    if (markAsRejected) return intl("invoices.process.actions.markAsRejected");
    if (editNote) return intl("invoices.process.actions.editNote");
  }, [
    approveUpdateRequest,
    intl,
    approveCancelRequest,
    markAsFulfilled,
    markAsRejected,
    editNote,
  ]);
  return (
    <Dialog
      open={open}
      close={close}
      title={intl("invoices.process.title", { number: id }) + " / " + title}
      className="w-full md:w-[700px] text-foreground"
    >
      <Form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Field
          label={<Label>{intl("invoices.process.note.label")}</Label>}
          field={
            <Controller.TextEditor
              control={form.control}
              value={form.watch("note")}
              name="note"
            />
          }
        />

        {action === Action.MarkAsFulfilled ? (
          <div className="flex gap-4 items-center">
            <Button
              htmlType="button"
              size={"small"}
              variant={"secondary"}
              onClick={() => {
                if (!ref.current) return;
                ref.current.click();
              }}
            >
              {intl("labels.invoice.receipt.upload")}
            </Button>
            {receipt ? (
              <div className="flex gap-1">
                <Typography tag="span" className="text-caption">
                  {receipt.name}
                </Typography>
                <button
                  type="button"
                  className="hover:cursor-pointer"
                  onClick={() => setReceipt(undefined)}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : null}
          </div>
        ) : null}

        <input
          type="file"
          className="hidden"
          ref={ref}
          accept="image/png, image/jpeg"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setReceipt(file);
          }}
        />

        <div className="flex flex-row items-center gap-2 ">
          <Button
            type={
              action === Action.ApproveCancelRequest ||
              action === Action.MarkAsRejected
                ? "error"
                : "main"
            }
            variant={"primary"}
            size={"medium"}
            loading={update.isPending}
            disabled={update.isPending || deleteNote.isPending}
          >
            {label}
          </Button>

          {editNote && note !== null ? (
            <Button
              type={"error"}
              size={"medium"}
              loading={deleteNote.isPending}
              disabled={update.isPending || deleteNote.isPending}
              htmlType="button"
              onClick={() => deleteNote.mutate()}
            >
              {intl("invoices.process.actions.removeNote")}
            </Button>
          ) : null}
        </div>
      </Form>
    </Dialog>
  );
};

export default Process;
