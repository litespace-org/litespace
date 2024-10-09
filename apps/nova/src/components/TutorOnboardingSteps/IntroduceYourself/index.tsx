import { useAppDispatch, useAppSelector } from "@/redux/store";
import { profileSelectors } from "@/redux/user/profile";
import { findTutorMeta } from "@/redux/user/tutor";
import {
  Button,
  Field,
  Form,
  Label,
  toaster,
  useValidation,
  atlas,
  Controller,
  useFormatMessage,
} from "@litespace/luna";
import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";

type IForm = {
  bio: string;
  about: string;
};

const IntorduceYourself: React.FC = () => {
  const intl = useFormatMessage();
  const dispatch = useAppDispatch();
  const validation = useValidation();
  const profile = useAppSelector(profileSelectors.user);
  const {
    watch,
    formState: { errors },
    control,
    handleSubmit,
    reset,
  } = useForm<IForm>({
    defaultValues: {
      bio: "",
      about: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (fields: IForm) => {
      if (!profile) return;
      return await atlas.tutor.update(profile.id, {
        bio: fields.bio,
        about: fields.about,
      });
    },
    onSuccess() {
      reset();
      toaster.success({
        title: intl("global.notify.update.data"),
      });
      if (profile) dispatch(findTutorMeta.call(profile.id));
    },
    onError() {
      toaster.error({
        title: intl("error.update.data"),
      });
    },
    mutationKey: ["update-tutor-info"],
  });

  const onSubmit = useMemo(
    () => handleSubmit((payload: IForm) => mutation.mutate(payload)),
    [handleSubmit, mutation]
  );

  const disabled = useMemo(
    () => mutation.isPending || !profile,
    [mutation.isPending, profile]
  );

  return (
    <div>
      <Form onSubmit={onSubmit} className="flex flex-col gap-6 max-w-lg">
        <Field
          label={
            <Label>
              {intl(
                "page.tutor.onboarding.steps.third.introduce.yourself.form.bio.label"
              )}
            </Label>
          }
          field={
            <Controller.Input
              control={control}
              name="bio"
              placeholder={intl(
                "page.tutor.onboarding.steps.third.introduce.yourself.form.bio.placeholder"
              )}
              value={watch("bio")}
              error={errors["bio"]?.message}
              disabled={disabled}
              autoComplete="off"
            />
          }
        />

        <Field
          label={
            <Label>
              {intl(
                "page.tutor.onboarding.steps.third.introduce.yourself.form.about.label"
              )}
            </Label>
          }
          field={
            <Controller.TextEditor
              rules={validation.about}
              value={watch("about")}
              control={control}
              name="about"
            />
          }
        />

        <div className="mt-6 w-fit min-w-[130px]">
          <Button
            htmlType="submit"
            loading={mutation.isPending}
            disabled={disabled}
          >
            {intl("global.labels.next")}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default IntorduceYourself;
