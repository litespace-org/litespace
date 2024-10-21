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
  Controller,
  useFormatMessage,
} from "@litespace/luna";
import React, { useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useIntroduceTutor } from "@litespace/headless/tutor";

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

  const onCreateSucces = useCallback(() => {
    reset();
    toaster.success({
      title: intl("global.notify.update.data"),
    });
    if (profile) dispatch(findTutorMeta.call(profile.id));
  }, []);
  const onCreateError = useCallback(() => {
    toaster.error({
      title: intl("error.update.data"),
    });
  }, []);

  const mutation = useIntroduceTutor({
    profile,
    onSuccess: onCreateSucces,
    onError: onCreateError,
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
      <Form onSubmit={onSubmit} className="flex flex-col max-w-lg gap-6">
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
