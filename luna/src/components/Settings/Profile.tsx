import React, { useMemo } from "react";
import { Field, Form } from "@/components/Form";
import { Input, InputType } from "@/components/Input";
import { useFormatMessage, useUpdateUser } from "@/hooks";
import { Controlled as ControlledGender } from "@/components/Gender";
import { ITutor, IUser } from "@litespace/types";
import { Button, ButtonSize, ButtonType } from "@/components/Button";
import { Controller } from "@/components/Form";
import { useForm } from "react-hook-form";
import { useValidateName } from "@/hooks/user";

type IForm = {
  name: string;
  gender?: IUser.Gender;
  birthYear?: number;
  bio?: string;
  about?: string;
};

const Profile: React.FC<{ profile: IUser.Self; tutor: ITutor.Self | null }> = ({
  profile,
  tutor,
}) => {
  const intl = useFormatMessage();
  const form = useForm<IForm>({
    defaultValues: {
      name: profile.name || "",
      birthYear: profile.birthYear || undefined,
      gender: profile.gender || undefined,
      bio: tutor?.bio || undefined,
      about: tutor?.about || undefined,
    },
  });

  const mutation = useUpdateUser();
  const validateName = useValidateName();

  const onSubmit = useMemo(
    () =>
      form.handleSubmit((data: IForm) => {
        mutation.mutate({
          id: profile.id,
          payload: {
            about: data.about,
            bio: data.bio,
            birthYear: data.birthYear,
            gender: data.gender,
            name: data.name,
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
            <Input
              placeholder={intl("labels.name.placeholder")}
              register={form.register("name", {
                validate: validateName,
              })}
              error={form.formState.errors.name?.message}
              autoComplete="off"
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
              <Input type={InputType.Password} disabled />
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
          field={<Input placeholder={intl("labels.birthYear.placeholder")} />}
        />

        <Field
          label={intl("labels.bio")}
          field={<Input placeholder={intl("labels.bio.placeholder")} />}
        />

        <Field
          label={intl("labels.about")}
          field={
            <Controller.TextEditor
              control={form.control}
              name="about"
              value={form.watch("about") || ""}
              error={form.formState.errors.about?.message}
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
