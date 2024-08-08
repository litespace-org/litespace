import {
  Input,
  Form,
  Button,
  messages,
  Google,
  Discord,
  Facebook,
  Field,
  Label,
  useValidation,
  Select,
  years,
  Dir,
  InputType,
} from "@litespace/luna";
import React, { useCallback, useEffect, useMemo } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import { useMutation } from "react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAppDispatch } from "@/redux/store";
import { findMe } from "@/redux/user/me";
import { Route } from "@/types/routes";
import {
  RegisterStudentPayload,
  RegisterTutorPayload,
  IUser,
} from "@litespace/types";
import { atlas } from "@/lib/atlas";

interface IForm {
  name: { ar: string; en: string };
  email: string;
  password: string;
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
    formState: { errors },
  } = useForm<IForm>({
    defaultValues: {
      name: { ar: "", en: "" },
      email: "",
      password: "",
    },
  });

  console.log({ errors });

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
              register={register("name.ar", validation.name)}
              error={errors["name"]?.ar?.message}
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
              register={register("name.en", validation.name)}
              error={errors["name"]?.en?.message}
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
              register={register("email", validation.email)}
              error={errors["email"]?.message}
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
              register={register("password", validation.password)}
              type={InputType.Password}
              error={errors["password"]?.message}
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
            <Select
              dir={Dir.RTL}
              list={years}
              placeholder={intl.formatMessage({
                id: messages["page.register.form.age.placeholder"],
              })}
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
