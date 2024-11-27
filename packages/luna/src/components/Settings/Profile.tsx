import React, { useEffect, useMemo } from "react";
import { Field, Form } from "@/components/Form";
import {
  useFormatMessage,
  useUpdateUser,
  useValidatePassword,
  useValidateEmail,
} from "@/hooks";
import { ITutor, IUser, Void } from "@litespace/types";
import { Button, ButtonSize } from "@/components/Button";
import { Controller } from "@/components/Form";
import { useForm } from "react-hook-form";
import { useValidateBirthYear } from "@/hooks/user";
import { diff } from "@litespace/sol/diff";
import { orUndefined } from "@litespace/sol/utils";
import { isEmpty } from "lodash";
import Media from "@/components/Settings/Media";
import Title from "@/components/Settings/Title";

type IForm = {
  name: string;
  gender?: IUser.Gender;
  birthYear?: string;
  bio: string;
  about: string;
  email?: string;
  password?: { current: string; new: string };
};

const Profile: React.FC<{
  profile: IUser.Self | null;
  tutor: ITutor.Self | null;
  refresh: Void;
  loading: boolean;
  fetching: boolean;
  first?: boolean;
}> = ({ profile, tutor, loading, fetching, refresh, first }) => {
  const intl = useFormatMessage();
  const form = useForm<IForm>({
    defaultValues: {
      name: "",
      birthYear: "",
      bio: "",
      about: "",
      email: "",
      password: {
        current: "",
        new: "",
      },
    },
  });

  const data = form.watch();

  useEffect(() => {
    if (profile?.name) form.setValue("name", profile.name);
    if (profile?.birthYear)
      form.setValue("birthYear", profile.birthYear.toString());
    if (profile?.gender) form.setValue("gender", profile.gender);
    if (profile?.email) form.setValue("email", profile.email);
    if (tutor?.bio) form.setValue("bio", tutor.bio);
    if (tutor?.about) form.setValue("about", tutor.about);
  }, [
    form,
    profile?.birthYear,
    profile?.email,
    profile?.gender,
    profile?.name,
    tutor?.about,
    tutor?.bio,
  ]);

  const mutation = useUpdateUser(refresh);
  // const validateName = useValidateName();
  const validateBirthYear = useValidateBirthYear();
  const validatePassword = useValidatePassword();
  const validateEmail = useValidateEmail();

  const onSubmit = useMemo(
    () =>
      form.handleSubmit((data: IForm) => {
        if (!profile) return;
        const payload = diff<IUser.UpdateApiPayload>(
          {
            birthYear: data.birthYear ? Number(data.birthYear) : undefined,
            password: orUndefined(data.password),
            gender: orUndefined(data.gender),
            email: orUndefined(data.email),
            about: orUndefined(data.about),
            name: orUndefined(data.name),
            bio: orUndefined(data.bio),
          },
          {
            birthYear: orUndefined(profile.birthYear),
            gender: orUndefined(profile.gender),
            name: orUndefined(profile.name),
            about: orUndefined(tutor?.about),
            bio: orUndefined(tutor?.bio),
            email: profile.email,
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

  const editDisabled = useMemo(() => {
    if (!profile) return true;
    const payload = diff<IUser.UpdateApiPayload>(
      {
        birthYear: data.birthYear ? Number(data.birthYear) : undefined,
        password: orUndefined(data.password),
        email: orUndefined(data.email),
        gender: orUndefined(data.gender),
        about: orUndefined(data.about),
        name: orUndefined(data.name),
        bio: orUndefined(data.bio),
      },
      {
        birthYear: orUndefined(profile.birthYear),
        gender: orUndefined(profile.gender),
        name: orUndefined(profile.name),
        email: orUndefined(profile.email),
        about: orUndefined(tutor?.about),
        bio: orUndefined(tutor?.bio),
      }
    );

    return isEmpty(payload);
  }, [
    data.about,
    data.bio,
    data.birthYear,
    data.email,
    data.gender,
    data.name,
    data.password,
    profile,
    tutor?.about,
    tutor?.bio,
  ]);

  const isTutor = useMemo(
    () => profile?.role === IUser.Role.Tutor,
    [profile?.role]
  );

  const showPassword = useMemo(() => {
    return (first && profile?.password === false) || !first;
  }, [first, profile?.password]);

  const showEamil = useMemo(() => {
    return (first && profile?.email === null) || !first;
  }, [first, profile?.email]);

  return (
    <div className="tw-mb-8">
      <Title
        loading={loading || fetching}
        title={
          first ? "settings.profile.title.first" : "settings.profile.title"
        }
      />

      <div className="tw-flex tw-flex-col-reverse sm:tw-flex-row tw-gap-4 md:tw-gap-8 lg:tw-gap-16">
        <Form
          onSubmit={onSubmit}
          className="tw-flex tw-flex-col tw-gap-4 md:tw-w-full lg:tw-w-[500px]"
        >
          <Field
            label={intl("labels.name")}
            field={
              <Controller.Input
                placeholder={intl("labels.name.placeholder")}
                // rules={{ validate: validateName }}
                control={form.control}
                disabled={disabled}
                autoComplete="off"
                name="name"
              />
            }
          />

          {showEamil ? (
            <Field
              label={intl("labels.email")}
              field={
                <Controller.Input
                  placeholder={intl("labels.email.placeholder")}
                  control={form.control}
                  rules={{ validate: validateEmail }}
                  disabled={disabled}
                  name="email"
                />
              }
            />
          ) : null}

          {showPassword ? (
            <Field
              label={intl("labels.password")}
              field={
                <Controller.Input
                  type="password"
                  control={form.control}
                  name="password.current"
                  autoComplete="off"
                  disabled={disabled}
                  rules={{ validate: validatePassword }}
                />
              }
            />
          ) : null}

          <Field
            label={intl("labels.birthYear")}
            field={
              <Controller.NumericInput
                control={form.control}
                name="birthYear"
                rules={{
                  // validate: validateBirthYear.validate,
                  required: validateBirthYear.required,
                }}
                placeholder={intl("labels.birthYear.placeholder")}
                min={validateBirthYear.min}
                max={validateBirthYear.max}
                allowNegative={false}
                decimalScale={0}
                disabled={disabled}
              />
            }
          />

          {isTutor && !first ? (
            <React.Fragment>
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
            </React.Fragment>
          ) : null}

          <Field
            label={intl("labels.gender")}
            field={
              <Controller.Gender
                value={form.watch("gender")}
                control={form.control}
                disabled={disabled}
                student={profile?.role === IUser.Role.Student}
                name="gender"
              />
            }
          />

          <Button
            loading={mutation.isPending}
            disabled={disabled || editDisabled}
            size={ButtonSize.Small}
            className="tw-mt-4"
          >
            {intl("global.labels.edit")}
          </Button>
        </Form>
        <Media
          displayOnly={displayOnly}
          refresh={refresh}
          user={profile?.id}
          image={profile?.image}
          video={tutor?.video}
          name={profile?.name}
        />
      </div>
    </div>
  );
};

export default Profile;
