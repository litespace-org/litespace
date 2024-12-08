import { useInterviewStatus } from "@/hooks/interview";
import {
  Button,
  ButtonSize,
  ButtonType,
  ButtonVariant,
} from "@litespace/luna/Button";
import { Dialog } from "@litespace/luna/Dialog";
import { Field, Form, Label } from "@litespace/luna/Form";
import { Select } from "@litespace/luna/Select";
import { TextEditor } from "@litespace/luna/TextEditor";
import { useToast } from "@litespace/luna/Toast";
import { messages } from "@litespace/luna/locales";
import { IInterview } from "@litespace/types";
import React, { useCallback, useMemo } from "react";
import { Check, Info, X } from "react-feather";
import { Controller, useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import { isEmpty } from "lodash";
import { useUpdateInterview } from "@litespace/headless/interviews";

const Description: React.FC<{ status: IInterview.Status }> = ({ status }) => {
  const intl = useIntl();
  const { passed, rejected, canceled } = useInterviewStatus(status);

  const title = useMemo(() => {
    if (passed) return messages["page.interviews.status.passed.desc.header"];
    if (canceled)
      return messages["page.interviews.status.canceled.desc.header"];
    if (rejected)
      return messages["page.interviews.status.rejected.desc.header"];
    return null;
  }, [canceled, passed, rejected]);

  const description = useMemo(() => {
    if (passed)
      return [
        messages["page.interviews.status.passed.desc.1"],
        messages["page.interviews.status.passed.desc.2"],
        messages["page.interviews.status.passed.desc.3"],
        messages["page.interviews.status.passed.desc.4"],
      ];

    if (rejected)
      return [
        messages["page.interviews.status.rejected.desc.1"],
        messages["page.interviews.status.rejected.desc.2"],
        messages["page.interviews.status.rejected.desc.3"],
      ];
    if (canceled)
      return [
        messages["page.interviews.status.canceled.desc.1"],
        messages["page.interviews.status.canceled.desc.2"],
      ];
    return [];
  }, [canceled, passed, rejected]);

  if (!title || isEmpty(description)) return null;

  return (
    <div>
      <h3 className="mb-3 text-base text-foreground-light">
        {intl.formatMessage({ id: title })}
      </h3>
      <ul className="flex flex-col gap-2 text-sm text-foreground-lighter">
        {description.map((id) => (
          <li key={id} className="flex flex-row items-center gap-2">
            {passed ? <Check /> : rejected ? <X /> : <Info />}
            <p>{intl.formatMessage({ id })}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

type IForm = {
  status?: IInterview.Status;
  feedback?: string;
  note?: string;
  level?: number;
};

const Update: React.FC<{
  status: IInterview.Status;
  open: boolean;
  close: () => void;
  onUpdate: () => void;
  tutor: string;
  interview: number;
}> = ({ open, close, onUpdate, tutor, interview }) => {
  const intl = useIntl();
  const toast = useToast();
  const form = useForm<IForm>({
    defaultValues: { level: 1, status: IInterview.Status.Passed },
  });
  const status = form.watch("status") || IInterview.Status.Passed;
  const { passed, rejected } = useInterviewStatus(status);

  const onSuccess = useCallback(() => {
    toast.success({
      title: intl.formatMessage({
        id: messages["page.interviews.update.success"],
      }),
    });
    close();
    onUpdate();
  }, [close, intl, onUpdate, toast]);

  const onError = useCallback(
    (error: unknown) => {
      toast.error({
        title: intl.formatMessage({
          id: messages["page.interviews.update.error"],
        }),
        description: error instanceof Error ? error.message : undefined,
      });
    },
    [intl, toast]
  );

  const mutation = useUpdateInterview({
    onSuccess,
    onError,
  });

  const onSubmit = useMemo(
    () =>
      form.handleSubmit((fields: IForm) => {
        mutation.mutate({
          id: interview,
          payload: {
            feedback: { interviewer: fields.feedback },
            note: fields.note,
            level: fields.level,
            status,
          },
        });
      }),
    [form, interview, mutation, status]
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

  const options = useMemo(() => {
    return [
      {
        label: intl.formatMessage({
          id: messages["page.interviews.status.passed"],
        }),
        value: IInterview.Status.Passed,
      },
      {
        label: intl.formatMessage({
          id: messages["page.interviews.status.rejected"],
        }),
        value: IInterview.Status.Rejected,
      },
      {
        label: intl.formatMessage({
          id: messages["page.interviews.status.canceled"],
        }),
        value: IInterview.Status.Canceled,
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
      <Form onSubmit={onSubmit} className="flex flex-col gap-4 mt-5 mb-3 ">
        <div>
          <Field
            label={
              <Label>
                {intl.formatMessage({
                  id: messages["page.interviews.update.form.status.label"],
                })}
              </Label>
            }
            field={
              <Controller
                name="status"
                control={form.control}
                render={({ field }) => (
                  <Select
                    options={options}
                    onChange={field.onChange}
                    value={form.watch("status")}
                  />
                )}
              />
            }
          />

          <div className="mt-3">
            <Description status={status} />
          </div>
        </div>

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
                  setValue={field.onChange}
                  value={form.watch("feedback") || ""}
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
                    setValue={field.onChange}
                    value={form.watch("note") || ""}
                    error={form.formState.errors.note?.message}
                  />
                )}
              />
            }
          />

          <p className="mt-3 text-sm text-foreground-light">
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
          type={passed ? ButtonType.Main : ButtonType.Error}
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          loading={mutation.isPending}
          disabled={mutation.isPending}
          className="text-foreground"
        >
          {intl.formatMessage({
            id: passed
              ? messages["page.interviews.status.passed"]
              : rejected
              ? messages["page.interviews.status.rejected"]
              : messages["page.interviews.status.canceled"],
          })}
        </Button>
      </Form>
    </Dialog>
  );
};

export default Update;
