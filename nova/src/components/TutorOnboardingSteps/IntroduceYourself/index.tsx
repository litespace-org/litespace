import { atlas } from "@/lib/atlas";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { profileSelector } from "@/redux/user/me";
import { findTutorMeta } from "@/redux/user/tutor";
import {
  Button,
  Field,
  Form,
  Input,
  Label,
  messages,
  TextEditor,
  toaster,
  useValidation,
} from "@litespace/luna";
import React, { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import { useMutation } from "react-query";

type IForm = {
  bio: string;
  about: string;
};

const IntorduceYourself: React.FC = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const validation = useValidation();
  const profile = useAppSelector(profileSelector);
  const {
    register,
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
        title: intl.formatMessage({
          id: messages["global.notify.update.data"],
        }),
      });
      if (profile) dispatch(findTutorMeta(profile.id));
    },
    onError() {
      toaster.error({
        title: intl.formatMessage({
          id: messages["error.update.data"],
        }),
      });
    },
    mutationKey: "update-tutor-info",
  });

  const onSubmit = useMemo(
    () => handleSubmit((payload: IForm) => mutation.mutate(payload)),
    [handleSubmit, mutation]
  );

  const disabled = useMemo(
    () => mutation.isLoading || !profile,
    [mutation.isLoading, profile]
  );

  return (
    <div>
      <Form onSubmit={onSubmit} className="flex flex-col gap-6 max-w-lg">
        <Field
          label={
            <Label>
              {intl.formatMessage({
                id: messages[
                  "page.tutor.onboarding.steps.third.introduce.yourself.form.bio.label"
                ],
              })}
            </Label>
          }
          field={
            <Input
              placeholder={intl.formatMessage({
                id: messages[
                  "page.tutor.onboarding.steps.third.introduce.yourself.form.bio.placeholder"
                ],
              })}
              value={watch("bio")}
              register={register("bio", validation.bio)}
              error={errors["bio"]?.message}
              disabled={disabled}
              autoComplete="off"
            />
          }
        />

        <Field
          label={
            <Label>
              {intl.formatMessage({
                id: messages[
                  "page.tutor.onboarding.steps.third.introduce.yourself.form.about.label"
                ],
              })}
            </Label>
          }
          field={
            <Controller
              name="about"
              control={control}
              rules={validation.about}
              render={({ field }) => (
                <TextEditor
                  onChange={field.onChange}
                  error={errors["about"]?.message}
                  disabled={disabled}
                />
              )}
            />
          }
        />

        <div className="mt-6 w-fit min-w-[130px]">
          <Button
            htmlType="submit"
            loading={mutation.isLoading}
            disabled={disabled}
          >
            {intl.formatMessage({
              id: messages["global.labels.next"],
            })}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default IntorduceYourself;
