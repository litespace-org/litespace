import {
  Input,
  Form,
  Button,
  messages,
  Field,
  Label,
  useValidation,
  Select,
  years,
  InputType,
} from "@litespace/luna";
import React, { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import { useMutation } from "react-query";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch } from "@/redux/store";
import { Route } from "@/types/routes";
import { IUser } from "@litespace/types";
import { atlas } from "@/lib/atlas";
import { merge } from "lodash";
import { setUserProfile } from "@/redux/user/me";

interface IForm {
  name: { ar: string; en: string };
  email: string;
  password: string;
  birthYear: string;
}

type Role = (typeof roles)[number];

const roles = [IUser.Role.Tutor, IUser.Role.Student] as const;

const Register: React.FC = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const validation = useValidation();
  const { role } = useParams<{ role: Role }>();
  const {
    register,
    watch,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<IForm>({
    defaultValues: {
      name: { ar: "أحمد", en: "Ahmed" },
      email: "me@ahmedibrahim.dev",
      password: "LiteSpace432%^&",
      birthYear: "2001",
    },
  });

  const isValidRole = useMemo(() => role && roles.includes(role), [role]);

  useEffect(() => {
    if (!isValidRole) return navigate(Route.Root);
  }, [isValidRole, navigate]);

  const mutation = useMutation(
    async (payload: IUser.CreateApiPayload): Promise<IUser.Self> =>
      await atlas.user.create(payload),
    {
      async onSuccess(user: IUser.Self) {
        dispatch(setUserProfile(user));
        navigate(Route.Root);
      },
    }
  );

  const onSubmit = useMemo(
    () =>
      handleSubmit((payload: IForm) => {
        if (!isValidRole || !role) return;
        return mutation.mutate(
          merge(payload, { role, birthYear: Number(payload.birthYear) })
        );
      }),
    [handleSubmit, isValidRole, mutation, role]
  );

  const tutor = useMemo(() => role === IUser.Role.Tutor, [role]);

  return (
    <div className="max-w-screen-sm mx-auto my-10">
      <div className="mb-4">
        <h1 className="text-3xl font-simi-bold text-center">
          <FormattedMessage
            id={
              tutor
                ? messages["page.register.tutor.title"]
                : messages["page.register.student.title"]
            }
          />
        </h1>
      </div>

      <Form onSubmit={onSubmit}>
        <Field
          label={
            <Label required>
              {intl.formatMessage({
                id: messages["page.register.form.name.label.ar"],
              })}
            </Label>
          }
          field={
            <Input
              placeholder={intl.formatMessage({
                id: messages["page.register.form.name.placeholder"],
              })}
              value={watch("name.ar")}
              register={register("name.ar", validation.name.ar)}
              error={errors["name"]?.ar?.message}
              autoComplete="off"
            />
          }
        />

        <Field
          label={
            <Label required>
              {intl.formatMessage({
                id: messages["page.register.form.name.label.en"],
              })}
            </Label>
          }
          field={
            <Input
              placeholder={intl.formatMessage({
                id: messages["page.register.form.name.placeholder"],
              })}
              value={watch("name.en")}
              register={register("name.en", validation.name.en)}
              error={errors["name"]?.en?.message}
              autoComplete="off"
            />
          }
        />

        <Field
          label={
            <Label required>
              {intl.formatMessage({
                id: messages["global.form.email.label"],
              })}
            </Label>
          }
          field={
            <Input
              placeholder={intl.formatMessage({
                id: messages["global.form.email.placeholder"],
              })}
              value={watch("email")}
              register={register("email", validation.email)}
              error={errors["email"]?.message}
              autoComplete="off"
            />
          }
        />

        <Field
          label={
            <Label required>
              {intl.formatMessage({
                id: messages["global.form.password.label"],
              })}
            </Label>
          }
          field={
            <Input
              placeholder={intl.formatMessage({
                id: messages["global.form.password.placeholder"],
              })}
              value={watch("password")}
              register={register("password", validation.password)}
              type={InputType.Password}
              error={errors["password"]?.message}
              autoComplete="off"
            />
          }
        />

        <Field
          label={
            <Label required>
              {intl.formatMessage({
                id: messages["page.register.form.age.label"],
              })}
            </Label>
          }
          field={
            <Controller
              name="birthYear"
              control={control}
              render={({ field }) => (
                <Select
                  list={years}
                  placeholder={intl.formatMessage({
                    id: messages["page.register.form.age.placeholder"],
                  })}
                  onChange={field.onChange}
                  value={field.value}
                />
              )}
            />
          }
        />

        <Button type="submit" className="w-full mt-[56px]">
          {intl.formatMessage({
            id: messages["page.register.form.button.submit.label"],
          })}
        </Button>
      </Form>
    </div>
  );
};

export default Register;
