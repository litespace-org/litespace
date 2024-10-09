import { useAppDispatch } from "@/redux/store";
import { setUserProfile } from "@/redux/user/profile";
import { Route } from "@/types/routes";
import {
  Button,
  Field,
  Form,
  Input,
  InputType,
  Label,
  messages,
  toaster,
  useValidation,
  atlas,
  Controller,
} from "@litespace/luna";
import { IUser, NumericString } from "@litespace/types";
import { isEmpty } from "lodash";
import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

type IForm = {
  email: string;
  password: string;
  name: string;
  birthYear: NumericString | "";
  phoneNumber: string;
  gender: string;
};

const CompleteInfo: React.FC<{ profile: IUser.Self }> = ({ profile }) => {
  const intl = useIntl();
  const validation = useValidation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<IForm>({
    defaultValues: {
      email: profile.email || "",
      password: "",
      name: profile.name || "",
      birthYear: "",
      gender: "",
      phoneNumber: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (payload: IUser.UpdateApiPayload) => {
      return await atlas.user.update(profile.id, payload);
    },
    onSuccess(user) {
      toaster.success({
        title: intl.formatMessage({
          id: messages["page.complete.profile.form.success"],
        }),
      });
      dispatch(setUserProfile({ user }));
      navigate(Route.Root);
    },
    onError(error) {
      toaster.error({
        title: intl.formatMessage({
          id: messages["page.complete.profile.form.error"],
        }),
        description: error instanceof Error ? error.message : undefined,
      });
    },
    mutationKey: ["update-user"],
  });

  const onSubmit = useMemo(
    () =>
      handleSubmit(({ email, password, birthYear, name }) => {
        mutation.mutate({
          password: !isEmpty(password) ? password : undefined,
          email: !isEmpty(email) ? email : undefined,
          birthYear: !isEmpty(birthYear) ? Number(birthYear) : undefined,
          name,
        });
      }),
    [handleSubmit, mutation]
  );

  const fields: IForm = {
    email: watch("email"),
    password: watch("password"),
    name: watch("name"),
    birthYear: watch("birthYear"),
    gender: watch("gender"),
    phoneNumber: watch("phoneNumber"),
  };

  const disabled = useMemo(() => {
    if (
      profile.email &&
      profile.password &&
      profile.name &&
      !fields.birthYear &&
      !fields.gender
    )
      return true;
    return false;
  }, [
    fields.birthYear,
    fields.gender,
    profile.email,
    profile.name,
    profile.password,
  ]);

  return (
    <div className="min-w-[400px]">
      <Form onSubmit={onSubmit} className="flex flex-col gap-4">
        {profile.email === null ? (
          <Field
            label={
              <Label>
                {intl.formatMessage({
                  id: messages["global.form.email.label"],
                })}
              </Label>
            }
            field={
              <Controller.Input
                placeholder={intl.formatMessage({
                  id: messages["global.form.email.placeholder"],
                })}
                value={fields.email}
                register={register("email", validation.email)}
                error={errors["email"]?.message}
                autoComplete="off"
                disabled={mutation.isPending}
              />
            }
          />
        ) : null}

        {profile.password === false ? (
          <Field
            label={
              <Label>
                {intl.formatMessage({
                  id: messages["global.form.password.label"],
                })}
              </Label>
            }
            field={
              <Input
                value={fields.password}
                register={register("password", validation.password)}
                type={InputType.Password}
                error={errors["password"]?.message}
                autoComplete="off"
                disabled={mutation.isPending}
              />
            }
          />
        ) : null}

        {profile.name === null ? (
          <Field
            label={
              <Label>
                {intl.formatMessage({
                  id: messages["page.complete.profile.form.name.label"],
                })}
              </Label>
            }
            field={
              <Input
                placeholder={intl.formatMessage({
                  id: messages["page.complete.profile.form.name.placeholder"],
                })}
                value={fields.name}
                register={register("name", validation.name.ar)}
                type={InputType.Text}
                error={errors["name"]?.message}
                autoComplete="off"
                disabled={mutation.isPending}
              />
            }
          />
        ) : null}

        {profile.role === IUser.Role.Tutor ? (
          <Field
            label={
              <Label>
                {intl.formatMessage({
                  id: messages["page.complete.profile.form.phone.number.label"],
                })}
              </Label>
            }
            field={
              <Input
                placeholder={intl.formatMessage({
                  id: messages[
                    "page.complete.profile.form.phone.number.placeholder"
                  ],
                })}
                value={fields.phoneNumber}
                register={register("phoneNumber", validation.name.en)}
                type={InputType.Text}
                error={errors["phoneNumber"]?.message}
                autoComplete="off"
                disabled={mutation.isPending}
              />
            }
          />
        ) : null}

        {profile.birthYear === null ? (
          <Field
            label={
              <Label>
                {intl.formatMessage({
                  id: messages["page.complete.profile.form.birth.year.label"],
                })}
              </Label>
            }
            field={
              <Input
                placeholder={intl.formatMessage({
                  id: messages[
                    "page.complete.profile.form.birth.year.placeholder"
                  ],
                })}
                value={fields.birthYear}
                register={register("birthYear", validation.birthYear)}
                type={InputType.Text}
                error={errors["birthYear"]?.message}
                autoComplete="off"
                disabled={mutation.isPending}
              />
            }
          />
        ) : null}

        {profile.gender === null ? (
          <Field
            label={
              <Label>
                {intl.formatMessage({
                  id: messages["page.complete.profile.form.gender.label"],
                })}
              </Label>
            }
            field={
              <Input
                value={fields.gender}
                register={register("gender")}
                type={InputType.Text}
                error={errors["gender"]?.message}
                autoComplete="off"
                disabled={mutation.isPending}
              />
            }
          />
        ) : null}
        <Button
          disabled={mutation.isPending || disabled}
          loading={mutation.isPending}
          htmlType="submit"
          className="mt-8"
        >
          {intl.formatMessage({
            id: messages["global.labels.next"],
          })}
        </Button>
      </Form>
    </div>
  );
};

export default CompleteInfo;
