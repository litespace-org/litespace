import { Button, ButtonType, ButtonVariant } from "@litespace/luna/Button";
import { Controller, Form, Label, Field } from "@litespace/luna/Form";
import { useValidation } from "@litespace/luna/hooks/validation";
import { messages } from "@litespace/luna/locales";
import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import { useShareFeedback } from "@litespace/headless/tutor";

const PassedInterview: React.FC<{
  feedback: string | null;
  interviewer: string | null;
  interviewId: number;
}> = ({ feedback, interviewer, interviewId }) => {
  const intl = useIntl();
  const validation = useValidation();

  const next = useShareFeedback(interviewId);

  const skip = useShareFeedback(interviewId);

  const { control, handleSubmit, watch } = useForm({
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
        <h3 className="mb-4 text-4xl text-brand">
          {intl.formatMessage({
            id: messages[
              "page.tutor.onboarding.steps.first.booked.interview.passed.title"
            ],
          })}
        </h3>

        <div className="flex flex-col gap-2">
          {interviewer ? (
            <p className="text-sm text-foreground-light">
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

          <p className="px-4 py-2 text-base leading-loose border rounded-md bg-selection border-border-strong hover:border-border-stronger">
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
            <Controller.TextEditor
              control={control}
              name="feedback"
              rules={{ required: validation.required }}
              disabled={next.isPending}
              value={watch("feedback")}
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
            onClick={() => skip.mutate("")}
            type={ButtonType.Main}
            variant={ButtonVariant.Secondary}
            loading={skip.isPending}
            disabled={skip.isPending}
            htmlType="button"
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
