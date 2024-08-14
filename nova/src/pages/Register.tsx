import {
  Input,
  Form,
  Button,
  messages,
  Field,
  Label,
  useValidation,
  InputType,
  toaster,
} from "@litespace/luna";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
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
      email: "me@ahmedibrahim.dev",
      password: "LiteSpace432%^&",
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
        toaster.success({
          title: intl.formatMessage({ id: messages["page.register.success"] }),
        });
        dispatch(setUserProfile(user));
        navigate(Route.Root);
      },
      onError(error) {
        toaster.error({
          title: intl.formatMessage({ id: messages["page.register.failed"] }),
          description: error instanceof Error ? error.message : undefined,
        });
      },
    }
  );

  const onSubmit = useMemo(
    () =>
      handleSubmit((payload: IForm) => {
        if (!isValidRole || !role) return;
        return mutation.mutate(merge(payload, { role }));
      }),
    [handleSubmit, isValidRole, mutation, role]
  );

  const tutor = useMemo(() => role === IUser.Role.Tutor, [role]);

  return (
    <div className="flex flex-row flex-1 h-full">
      <main className="flex flex-col items-center text-right flex-1 flex-shrink-0 px-5 pt-16 pb-8 border-l shadow-lg bg-studio border-border">
        <div className="flex-1 flex flex-col justify-center w-[330px] sm:w-[384px]">
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
            <div className="flex flex-col gap-4">
              <Field
                label={
                  <Label>
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
                    disabled={mutation.isLoading}
                  />
                }
              />

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
                    value={watch("password")}
                    register={register("password", validation.password)}
                    type={InputType.Password}
                    error={errors["password"]?.message}
                    disabled={mutation.isLoading}
                    autoComplete="off"
                  />
                }
              />

              <Button
                loading={mutation.isLoading}
                htmlType="submit"
                className="w-full mt-8"
              >
                {intl.formatMessage({
                  id: messages["page.register.form.button.submit.label"],
                })}
              </Button>
            </div>
          </Form>
        </div>
      </main>
      <aside className="flex-col items-center justify-center flex-1 flex-shrink hidden basis-1/4 xl:flex bg-alternative">
        <div className="flex flex-col gap-4 items-center justify-center">
          <p className="text-4xl">LiteSpace</p>
          <p className="text-lg">
            {intl.formatMessage({ id: messages["page.login.slogan"] })}
          </p>
        </div>
      </aside>
    </div>
  );
};

export default Register;
