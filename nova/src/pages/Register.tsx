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
      name: { ar: "", en: "" },
      email: "",
      password: "",
    },
  });

  const isValidRole = useMemo(() => role && roles.includes(role), [role]);

  useEffect(() => {
    if (!isValidRole) return navigate(Route.Root);
  }, [isValidRole, navigate]);

  const mutation = useMutation(
    async ({
      payload,
      role,
    }: {
      payload: IForm;
      role: IUser.TutorOrStudent;
    }) => {
      console.log({ payload, role });
      // if (role === IUser.Role.Tutor) return await atlas.tutor.create(payload);
      // return atlas.student.register(payload);
    },
    {
      async onSuccess() {
        // await atlas.auth.token(token);
        // await dispatch(findMe());
        // navigate(Route.Root);
        console.log({ success: true });
      },
    }
  );

  const onSubmit = useMemo(
    () =>
      handleSubmit((payload: IForm) => {
        if (!isValidRole || !role) return;
        return mutation.mutate({ payload, role });
      }),
    [handleSubmit, isValidRole, mutation, role]
  );

  const tutor = useMemo(() => role === IUser.Role.Tutor, [role]);

  const birthYearField = useMemo(
    () =>
      register("birthYear", {
        required: {
          value: true,
          message: intl.formatMessage({
            id: messages["errors.required"],
          }),
        },
      }),
    [intl, register]
  );

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
              register={register("name.ar", validation.name)}
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
              register={register("name.en", validation.name)}
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
