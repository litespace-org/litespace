import { atlas } from "@/lib/atlas";
import {
  Button,
  ButtonType,
  Field,
  Form,
  Label,
  messages,
  TextEditor,
  useValidation,
} from "@litespace/luna";
import React, { useCallback, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import { useMutation } from "@tanstack/react-query";

const PassedInterview: React.FC<{
  feedback: string | null;
  interviewer: string | null;
  interviewId: number;
}> = ({ feedback, interviewer, interviewId }) => {
  const intl = useIntl();
  const validation = useValidation();

  const share = useCallback(
    async (feedback: string) => {
      return await atlas.interview.update(interviewId, {
        feedback: { interviewee: feedback },
      });
    },
    [interviewId]
  );

  const next = useMutation({
    mutationFn: (feedback: string) => share(feedback),
    mutationKey: ["submit-feedback"],
  });

  const skip = useMutation({
    mutationFn: () => share(""),
    mutationKey: ["skip-feedback"],
  });

  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm({
    defaultValues: {
      feedback: "",
    },
  });

  const onSubmit = useMemo(
    () => handleSubmit(({ feedback }) => next.mutate(feedback)),
    [handleSubmit, next]
  );

  return (
    <div className="max-w-screen-md">
      <div>
        <h3 className="text-4xl text-brand mb-4">
          {intl.formatMessage({
            id: messages[
              "page.tutor.onboarding.steps.first.booked.interview.passed.title"
            ],
          })}
        </h3>

        <div className="flex flex-col gap-2">
          {interviewer ? (
            <p className="text-foreground-light text-sm">
              {intl.formatMessage(
                {
                  id: messages[
                    "page.tutor.onboarding.steps.first.booked.interview.feedback.title"
                  ],
                },
                { interviewer }
              )}
            </p>
          ) : null}

          <p className="bg-selection leading-loose text-base px-4 py-2 rounded-md border border-border-strong hover:border-border-stronger">
            {feedback}
          </p>
        </div>
      </div>

      <Form onSubmit={onSubmit} className="mt-6">
        <Field
          label={
            <Label>
              {intl.formatMessage({
                id: messages[
                  "page.tutor.onboarding.steps.first.booked.interview.passed.form.feedback"
                ],
              })}
            </Label>
          }
          field={
            <Controller
              control={control}
              name="feedback"
              rules={{ required: validation.required }}
              render={({ field }) => (
                <TextEditor
                  onChange={field.onChange}
                  disabled={next.isPending}
                  error={errors["feedback"]?.message}
                />
              )}
            />
          }
        />

        <div className="flex flex-row gap-3 mt-6">
          <Button
            htmlType="submit"
            loading={next.isPending}
            disabled={next.isPending}
          >
            {intl.formatMessage({
              id: messages["global.labels.next"],
            })}
          </Button>
          <Button
            onClick={() => skip.mutate()}
            type={ButtonType.Secondary}
            loading={skip.isPending}
            disabled={skip.isPending}
          >
            {intl.formatMessage({
              id: messages["global.labels.skip"],
            })}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default PassedInterview;
