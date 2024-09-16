import { useInterviewStatus } from "@/hooks/interview";
import { atlas } from "@/lib/atlas";
import {
  Button,
  ButtonType,
  Dialog,
  Field,
  Form,
  Label,
  messages,
  Select,
  TextEditor,
  toaster,
} from "@litespace/luna";
import { IInterview } from "@litespace/types";
import React, { useCallback, useMemo } from "react";
import { Check, Info, X } from "react-feather";
import { Controller, useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import { useMutation } from "@tanstack/react-query";

export type Status = Exclude<
  IInterview.Status,
  typeof IInterview.Status.Pending
>;

const Description: React.FC<{ status: Status }> = ({ status }) => {
  const intl = useIntl();
  const passed = useMemo(() => status === IInterview.Status.Passed, [status]);
  const rejected = useMemo(
    () => status === IInterview.Status.Rejected,
    [status]
  );
  const canceled = useMemo(
    () => status === IInterview.Status.Canceled,
    [status]
  );

  const title = useMemo(() => {
    if (passed) return messages["page.interviews.actions.pass.desc.header"];
    if (canceled) return messages["page.interviews.actions.cancel.desc.header"];
    return messages["page.interviews.actions.reject.desc.header"];
  }, [canceled, passed]);

  const description = useMemo(() => {
    const list = [
      messages["page.interviews.actions.pass.desc.1"],
      messages["page.interviews.actions.pass.desc.2"],
      messages["page.interviews.actions.pass.desc.3"],
      messages["page.interviews.actions.pass.desc.4"],
    ];
    if (passed || rejected) return list;
    return [
      messages["page.interviews.actions.cancel.desc.1"],
      messages["page.interviews.actions.cancel.desc.2"],
    ];
  }, [passed, rejected]);

  return (
    <div>
      <h3 className="mb-3 text-foreground text-base">
        {intl.formatMessage({ id: title })}
      </h3>
      <ul className="text-foreground-light flex flex-col gap-2">
        {description.map((id) => (
          <li key={id} className="flex flex-row gap-2">
            {passed ? <Check /> : rejected ? <X /> : <Info />}
            <p>{intl.formatMessage({ id })}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

type IForm = {
  feedback?: string;
  note?: string;
  level?: number;
};

const Update: React.FC<{
  status: Status;
  open: boolean;
  close: () => void;
  onUpdate: () => void;
  tutor: string;
  interview: number;
}> = ({ open, close, onUpdate, tutor, status, interview }) => {
  const { passed, rejected } = useInterviewStatus(status);
  const intl = useIntl();
  const form = useForm<IForm>({
    defaultValues: { level: 1 },
  });
  const update = useCallback(
    async (payload: IInterview.UpdateApiPayload) => {
      return atlas.interview.update(interview, payload);
    },
    [interview]
  );

  const onSuccess = useCallback(() => {
    toaster.success({
      title: intl.formatMessage({
        id: messages["page.interviews.update.success"],
      }),
    });
    close();
    onUpdate();
  }, [close, intl, onUpdate]);

  const onError = useCallback(
    (error: unknown) => {
      toaster.error({
        title: intl.formatMessage({
          id: messages["page.interviews.update.error"],
        }),
        description: error instanceof Error ? error.message : undefined,
      });
    },
    [intl]
  );

  const mutation = useMutation({
    mutationFn: update,
    onSuccess,
    onError,
  });

  const onSubmit = useMemo(
    () =>
      form.handleSubmit((fields: IForm) => {
        mutation.mutate({
          feedback: { interviewer: fields.feedback },
          note: fields.note,
          level: fields.level,
          status,
        });
      }),
    [form, mutation, status]
  );

  const levels = useMemo(() => {
    return [
      {
        label: intl.formatMessage({ id: messages["global.tutor.level.1"] }),
        value: 1,
      },
      {
        label: intl.formatMessage({ id: messages["global.tutor.level.2"] }),
        value: 2,
      },
      {
        label: intl.formatMessage({ id: messages["global.tutor.level.3"] }),
        value: 3,
      },
      {
        label: intl.formatMessage({ id: messages["global.tutor.level.4"] }),
        value: 4,
      },
      {
        label: intl.formatMessage({ id: messages["global.tutor.level.5"] }),
        value: 5,
      },
    ];
  }, [intl]);

  return (
    <Dialog
      open={open}
      close={close}
      title={intl.formatMessage(
        { id: messages["page.interviews.update.title"] },
        { name: tutor }
      )}
      className="w-full md:max-w-[700px]"
    >
      <Description status={status} />

      <Form onSubmit={onSubmit} className="mt-5 mb-3 flex flex-col gap-4 ">
        <Field
          label={
            <Label>
              {intl.formatMessage({
                id: messages["page.interviews.update.form.feedback.label"],
              })}
            </Label>
          }
          field={
            <Controller
              name="feedback"
              control={form.control}
              render={({ field }) => (
                <TextEditor
                  onChange={field.onChange}
                  error={form.formState.errors.feedback?.message}
                />
              )}
            />
          }
        />

        <div>
          <Field
            label={
              <Label>
                {intl.formatMessage({
                  id: messages["page.interviews.update.form.note.label"],
                })}
              </Label>
            }
            field={
              <Controller
                name="note"
                control={form.control}
                render={({ field }) => (
                  <TextEditor
                    onChange={field.onChange}
                    error={form.formState.errors.note?.message}
                  />
                )}
              />
            }
          />

          <p className="text-sm text-foreground-light mt-3">
            {intl.formatMessage({
              id: messages["page.interviews.update.form.note.desc"],
            })}
          </p>
        </div>

        <Field
          label={
            <Label>
              {intl.formatMessage({
                id: messages["page.interviews.update.form.level.label"],
              })}
            </Label>
          }
          field={
            <Controller
              name="level"
              control={form.control}
              render={({ field }) => (
                <Select
                  onChange={field.onChange}
                  options={levels}
                  value={form.watch("level")}
                />
              )}
            />
          }
        />

        <Button
          type={passed ? ButtonType.Primary : ButtonType.Error}
          loading={mutation.isPending}
          disabled={mutation.isPending}
          className="text-foreground"
        >
          {intl.formatMessage({
            id: passed
              ? messages["page.interviews.actions.pass"]
              : rejected
                ? messages["page.interviews.actions.reject"]
                : messages["page.interviews.actions.cancel"],
          })}
        </Button>
      </Form>
    </Dialog>
  );
};

export default Update;
