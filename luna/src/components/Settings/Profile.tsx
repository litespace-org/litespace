import React, { useEffect, useMemo } from "react";
import { Field, Form } from "@/components/Form";
import { Input, InputType } from "@/components/Input";
import { useFormatMessage, useUpdateUser } from "@/hooks";
import { ITutor, IUser, Void } from "@litespace/types";
import { Button, ButtonSize, ButtonType } from "@/components/Button";
import { Controller } from "@/components/Form";
import { useForm } from "react-hook-form";
import { useValidateBirthYear, useValidateName } from "@/hooks/user";
import { diff } from "@litespace/sol";
import Spinner from "@/icons/Spinner";
import { isEmpty } from "lodash";
import Media from "@/components/Settings/Media";

type IForm = {
  name: string;
  gender?: IUser.Gender;
  birthYear?: string;
  bio: string;
  about: string;
};

const Profile: React.FC<{
  profile: IUser.Self | null;
  tutor: ITutor.Self | null;
  refresh: Void;
  loading: boolean;
  fetching: boolean;
}> = ({ profile, tutor, loading, fetching, refresh }) => {
  const intl = useFormatMessage();
  const form = useForm<IForm>({
    defaultValues: { name: "", birthYear: "", bio: "", about: "" },
  });

  useEffect(() => {
    if (profile?.name) form.setValue("name", profile.name);
    if (profile?.birthYear)
      form.setValue("birthYear", profile.birthYear.toString());
    if (profile?.gender) form.setValue("gender", profile.gender);
    if (tutor?.bio) form.setValue("bio", tutor.bio);
    if (tutor?.about) form.setValue("about", tutor.about);
  }, [
    form,
    profile?.birthYear,
    profile?.gender,
    profile?.name,
    tutor?.about,
    tutor?.bio,
  ]);

  const mutation = useUpdateUser(refresh);
  const validateName = useValidateName();
  const validateBirthYear = useValidateBirthYear();

  const onSubmit = useMemo(
    () =>
      form.handleSubmit((data: IForm) => {
        if (!profile) return;
        const payload = diff<IUser.UpdateApiPayload>(
          {
            birthYear: data.birthYear ? Number(data.birthYear) : undefined,
            gender: data.gender,
            about: data.about,
            name: data.name,
            bio: data.bio,
          },
          {
            birthYear: profile.birthYear || undefined,
            gender: profile.gender || undefined,
            name: profile.name || undefined,
            about: tutor?.about || undefined,
            bio: tutor?.bio || undefined,
          }
        );

        if (isEmpty(payload)) return;
        return mutation.mutate({ id: profile.id, payload });
      }),
    [form, mutation, profile, tutor?.about, tutor?.bio]
  );

  const disabled = useMemo(
    () => loading || fetching || mutation.isPending,
    [fetching, loading, mutation.isPending]
  );

  const displayOnly = useMemo(
    () => disabled || !profile || profile.role === IUser.Role.Tutor,
    [disabled, profile]
  );

  return (
    <div>
      <div className="flex flex-row items-center gap-2 mb-4">
        <h3 className="text-2xl">{intl("settings.profile.title")}</h3>
        <Spinner
          data-show={loading || fetching}
          className="hidden data-[show=true]:block"
        />
      </div>

      <div className="flex flex-col sm:!flex-row gap-4 md:!gap-8">
        <Media
          displayOnly={displayOnly}
          refresh={refresh}
          user={profile?.id}
          image={profile?.image}
          video={tutor?.video}
          name={profile?.name}
        />

        <Form
          onSubmit={onSubmit}
          className="flex flex-col gap-4 md:w-full lg:w-[500px]"
        >
          <Field
            label={intl("labels.name")}
            field={
              <Controller.Input
                placeholder={intl("labels.name.placeholder")}
                rules={{ validate: validateName }}
                control={form.control}
                autoComplete="off"
                name="name"
                disabled={disabled}
              />
            }
          />

          <Field
            label={intl("labels.email")}
            field={
              <div className="flex flex-row gap-2 items-center justify-center">
                <Input
                  placeholder={intl("labels.email.placeholder")}
                  value={profile?.email}
                  readOnly
                  disabled
                />
                <Button
                  htmlType="button"
                  type={ButtonType.Text}
                  size={ButtonSize.Small}
                  disabled={disabled}
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
                  disabled={disabled}
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
                disabled={disabled}
              />
            }
          />

          <Field
            label={intl("labels.bio")}
            field={
              <Controller.Input
                control={form.control}
                placeholder={intl("labels.bio.placeholder")}
                disabled={disabled}
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
                disabled={disabled}
                name="about"
              />
            }
          />

          <Field
            label={intl("labels.gender")}
            field={
              <Controller.Gender
                value={form.watch("gender")}
                control={form.control}
                disabled={disabled}
                name="gender"
              />
            }
          />

          <Button
            loading={mutation.isPending}
            disabled={disabled}
            size={ButtonSize.Small}
            className="mt-4"
          >
            {intl("global.labels.edit")}
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default Profile;
