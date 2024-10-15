import React, { useCallback } from "react";
import { useRateTutor } from "@litespace/headless/rating";
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
import { IRating } from "@litespace/types";

type IForm = {
  feedback?: string;
  rating: number;
};

type RateFormProps = {
  tutor: number;
  rate?: IRating.Populated;
};

const RateForm: React.FC<RateFormProps> = ({ tutor, rate }) => {
  const intl = useFormatMessage();

  const onSuccess = useCallback(() => {
    toaster.success({ title: "Ratings successful" });
  }, []);
  const onError = useCallback((error: Error) => {
    toaster.error({
      title: "An error has occured",
      description: error.message,
    });
  }, []);
  const rateTutor = useRateTutor({ onSuccess, onError });

  // Create new tutor hook to edit rating

  const form = useForm<IForm>({
    defaultValues: { feedback: rate?.feedback || "", rating: rate?.value || 5 },
  });

  const onSubmit = useCallback((data: IForm) => {
    if (rate) {
      // TODO: invoke updateRating mutate
      return;
    }
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
              minLength: { value: 10, message: "must be above 10 characters" },
              maxLength: {
                value: 1000,
                message: "must be less than 1000 characters",
              },
            }}
            control={form.control}
            value={form.watch("feedback")}
            name="feedback"
          />
        }
      />
      {/* handle different cases of editing or creating  */}
      <Button
        type={ButtonType.Primary}
        disabled={rateTutor.isPending}
        loading={rateTutor.isPending}
        size={ButtonSize.Small}
      >
        {intl(rate ? "global.labels.update" : "global.labels.confirm")}
      </Button>
    </Form>
  );
};

export default RateForm;
