import React, { useMemo } from "react";
import { Field, Form } from "@/components/Form";
import { Input, InputType } from "@/components/Input";
import { useFormatMessage, useUpdateUser } from "@/hooks";
import { Controlled as ControlledGender } from "@/components/Gender";
import { ITutor, IUser } from "@litespace/types";
import { Button, ButtonSize, ButtonType } from "@/components/Button";
import { Controller } from "@/components/Form";
import { useForm } from "react-hook-form";
import { useValidateBirthYear, useValidateName } from "@/hooks/user";

type IForm = {
  name: string;
  gender?: IUser.Gender;
  birthYear?: string;
  bio: string;
  about: string;
};

const Profile: React.FC<{ profile: IUser.Self; tutor: ITutor.Self | null }> = ({
  profile,
  tutor,
}) => {
  const intl = useFormatMessage();
  const form = useForm<IForm>({
    defaultValues: {
      name: profile.name || "",
      birthYear: profile.birthYear ? profile.birthYear.toString() : "",
      gender: profile.gender || undefined,
      bio: tutor?.bio || "",
      about: tutor?.about || "",
    },
  });

  const mutation = useUpdateUser();
  const validateName = useValidateName();
  const validateBirthYear = useValidateBirthYear();

  const onSubmit = useMemo(
    () =>
      form.handleSubmit((data: IForm) => {
        mutation.mutate({
          id: profile.id,
          payload: {
            birthYear: data.birthYear ? Number(data.birthYear) : undefined,
            gender: data.gender,
            about: data.about,
            name: data.name,
            bio: data.bio,
          },
        });
      }),
    [form, mutation, profile.id]
  );

  return (
    <div>
      <h3 className="text-2xl mb-4">{intl("settings.profile.title")}</h3>
      <Form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Field
          label={intl("labels.name")}
          field={
            <Controller.Input
              placeholder={intl("labels.name.placeholder")}
              rules={{ validate: validateName }}
              control={form.control}
              autoComplete="off"
              name="name"
            />
          }
        />

        <Field
          label={intl("labels.email")}
          field={
            <div className="flex flex-row gap-2 items-center justify-center">
              <Input
                placeholder={intl("labels.email.placeholder")}
                value={profile.email}
                readOnly
                disabled
              />
              <Button
                htmlType="button"
                type={ButtonType.Text}
                size={ButtonSize.Small}
              >
                {intl("global.labels.edit")}
              </Button>
            </div>
          }
        />

        <Field
          label={intl("labels.password")}
          field={
            <div className="flex flex-row gap-2 items-center justify-center">
              <Input type={InputType.Password} disabled autoComplete="off" />
              <Button
                htmlType="button"
                type={ButtonType.Text}
                size={ButtonSize.Small}
              >
                {intl("global.labels.edit")}
              </Button>
            </div>
          }
        />

        <Field
          label={intl("labels.birthYear")}
          field={
            <Controller.NumericInput
              control={form.control}
              name="birthYear"
              rules={{ validate: validateBirthYear.validate }}
              placeholder={intl("labels.birthYear.placeholder")}
              min={validateBirthYear.min}
              max={validateBirthYear.max}
              allowNegative={false}
              decimalScale={0}
            />
          }
        />

        <Field
          label={intl("labels.bio")}
          field={
            <Controller.Input
              control={form.control}
              placeholder={intl("labels.bio.placeholder")}
              name="bio"
            />
          }
        />

        <Field
          label={intl("labels.about")}
          field={
            <Controller.TextEditor
              value={form.watch("about")}
              control={form.control}
              name="about"
            />
          }
        />

        <Field
          label={intl("labels.gender")}
          field={
            <ControlledGender
              value={form.watch("gender")}
              control={form.control}
              name="gender"
            />
          }
        />

        <Button
          loading={mutation.isPending}
          disabled={mutation.isPending}
          size={ButtonSize.Small}
          className="mt-4"
        >
          {intl("global.labels.edit")}
        </Button>
      </Form>
    </div>
  );
};

export default Profile;
