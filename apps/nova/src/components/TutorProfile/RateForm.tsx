import React, { useCallback } from "react";
import { useEditRateTutor, useRateTutor } from "@litespace/headless/rating";
import {
  Button,
  ButtonSize,
  ButtonType,
  Controller,
  Field,
  Form,
  Label,
  toaster,
  useFormatMessage,
} from "@litespace/luna";
import { useForm } from "react-hook-form";
import { IRating, Void } from "@litespace/types";
import { useQueryClient } from "@tanstack/react-query";

type IForm = {
  feedback?: string;
  rating: number;
};

type RateFormProps = {
  tutor: number;
  rate?: IRating.Populated;
  close?: Void;
};

const RateForm: React.FC<RateFormProps> = ({ tutor, rate, close }) => {
  const intl = useFormatMessage();
  const queryClient = useQueryClient();
  const onSuccess = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["tutor-rating", tutor] });
    toaster.success({ title: intl("tutor.rate.succes") });
    if (rate && close) {
      close();
    }
    form.reset();
  }, []);
  const onError = useCallback((error: Error) => {
    toaster.error({
      title: intl("tutor.rate.error"),
      description: error.message,
    });
    if (rate && close) close();
  }, []);
  const rateTutor = useRateTutor({ onSuccess, onError });

  const editRateTutor = useEditRateTutor({
    id: rate?.id || 0,
    onSuccess,
    onError,
  });

  const form = useForm<IForm>({
    defaultValues: { feedback: rate?.feedback || "", rating: rate?.value || 5 },
  });

  const onSubmit = useCallback((data: IForm) => {
    if (rate)
      return editRateTutor.mutate({
        feedback: data.feedback,
        value: data.rating,
      });

    rateTutor.mutate({
      feedback: data.feedback || null,
      value: data.rating,
      rateeId: tutor,
    });
  }, []);

  return (
    <Form onSubmit={form.handleSubmit(onSubmit)}>
      <Field
        label={<Label>Rate your tutor</Label>}
        field={
          <Controller.Rating
            value={form.watch("rating")}
            control={form.control}
            name="rating"
          />
        }
      />
      <Field
        label={<Label>Rate your tutor</Label>}
        field={
          <Controller.Textarea
            rules={{
              minLength: {
                value: 10,
                message: intl("rating.form.rule.feedback.less"),
              },
              maxLength: {
                value: 1000,
                message: intl("rating.form.rule.feedback.more"),
              },
            }}
            control={form.control}
            value={form.watch("feedback")}
            name="feedback"
          />
        }
      />
      <Button
        type={ButtonType.Primary}
        disabled={rateTutor.isPending || editRateTutor.isPending}
        loading={rateTutor.isPending || editRateTutor.isPending}
        size={ButtonSize.Small}
      >
        {intl(rate ? "global.labels.update" : "global.labels.confirm")}
      </Button>
    </Form>
  );
};

export default RateForm;
