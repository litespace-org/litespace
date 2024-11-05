import React, { useCallback } from "react";
import {
  useEditRatingTutor,
  useCreateRatingTutor,
} from "@litespace/headless/rating";
import { Button, ButtonSize, ButtonType } from "@litespace/luna/Button";
import { Form, Field, Controller, Label } from "@litespace/luna/Form";
import { useToast } from "@litespace/luna/Toast";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { useForm } from "react-hook-form";
import { IRating, Void } from "@litespace/types";
import { useInvalidateQuery } from "@litespace/headless/query";
import { QueryKey } from "@litespace/headless/constants";
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
  const invalidate = useInvalidateQuery();
  const toast = useToast();
  const form = useForm<IForm>({
    defaultValues: { feedback: rate?.feedback || "", rating: rate?.value || 5 },
  });

  const onSuccess = useCallback(() => {
    invalidate([QueryKey.FindTutorRating, tutor]);
    toast.success({ title: intl("tutor.rate.succes") });
    if (rate && close) close();
    form.reset();
  }, [close, form, intl, invalidate, rate, toast, tutor]);

  const onError = useCallback(
    (error: Error) => {
      toast.error({
        title: intl("tutor.rate.error"),
        description: error.message,
      });
      if (rate && close) close();
    },
    [close, intl, rate, toast]
  );

  const rateTutor = useCreateRatingTutor({ onSuccess, onError });

  const editRateTutor = useEditRatingTutor({
    onSuccess,
    onError,
  });

  const onSubmit = useCallback(
    (data: IForm) => {
      if (rate)
        return editRateTutor.mutate({
          payload: {
            feedback: data.feedback,
            value: data.rating,
          },
          id: rate.id,
        });

      rateTutor.mutate({
        feedback: data.feedback || null,
        value: data.rating,
        rateeId: tutor,
      });
    },
    [editRateTutor, rate, rateTutor, tutor]
  );

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
