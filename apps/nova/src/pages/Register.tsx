import { Form, Field, Label, Controller } from "@litespace/luna/Form";
import { Button, ButtonSize } from "@litespace/luna/Button";
import { useToast } from "@litespace/luna/Toast";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import React, { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { Route } from "@/types/routes";
import { IUser } from "@litespace/types";
import RegisterLight from "@litespace/assets/RegisterLight";
import RegisterDark from "@litespace/assets/RegisterDark";
import GoogleAuth from "@/components/Common/GoogleAuth";
import { useRegisterUser } from "@litespace/headless/user";
import { useUser } from "@litespace/headless/context/user";

interface IForm {
  email: string;
  password: string;
}

type Role = (typeof roles)[number];

const roles = [IUser.Role.Tutor, IUser.Role.Student] as const;

const origin = location.origin;
const callbackUrl = origin.concat(Route.VerifyEmail);

const Register: React.FC = () => {
  const intl = useFormatMessage();
  const user = useUser();
  const navigate = useNavigate();
  const toast = useToast();
  const { role } = useParams<{ role: Role }>();
  const {
    watch,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<IForm>({
    defaultValues: {
      email: "me@ahmedibrahim.dev",
      password: "LiteSpace432%^&",
    },
  });

  const isValidRole = useMemo(() => role && roles.includes(role), [role]);
  const tutor = useMemo(() => role === IUser.Role.Tutor, [role]);

  useEffect(() => {
    if (!isValidRole) return navigate(Route.Root);
  }, [isValidRole, navigate]);

  const onSuccess = useCallback(
    async ({ user: info, token }: IUser.RegisterApiResponse) => {
      toast.success({ title: intl("page.register.success") });
      user.set({ user: info, token });
      navigate(Route.Root);
    },
    [intl, navigate, toast, user]
  );

  const onError = useCallback(
    (error: Error) => {
      toast.error({
        title: intl("page.register.failed"),
        description: error instanceof Error ? error.message : undefined,
      });
    },
    [intl, toast]
  );

  const mutation = useRegisterUser({ onSuccess, onError });

  const onSubmit = useMemo(
    () =>
      handleSubmit((payload: IForm) => {
        if (!isValidRole || !role) return;
        return mutation.mutate({
          ...payload,
          role,
          callbackUrl,
        });
      }),
    [handleSubmit, isValidRole, mutation, role]
  );

  return (
    <div className="flex flex-row flex-1 h-full">
      <main className="flex flex-col items-center flex-1 flex-shrink-0 px-5 pt-16 pb-8 text-right border-l shadow-lg bg-studio border-border">
        <div className="flex-1 flex flex-col justify-center w-[330px] sm:w-[384px]">
          <div className="mb-4">
            <h1 className="text-3xl font-simi-bold">
              {intl(
                tutor
                  ? "page.register.tutor.title"
                  : "page.register.student.title"
              )}
            </h1>
          </div>

          <Form onSubmit={onSubmit}>
            <div className="flex flex-col items-start justify-start gap-4">
              <Field
                label={<Label>{intl("global.form.email.label")}</Label>}
                field={
                  <Controller.Input
                    control={control}
                    name="email"
                    placeholder={intl("global.form.email.placeholder")}
                    value={watch("email")}
                    error={!!errors["email"]?.message}
                    helper={errors["email"]?.message}
                    autoComplete="off"
                    disabled={mutation.isPending}
                  />
                }
              />

              <Field
                label={<Label>{intl("global.form.password.label")}</Label>}
                field={
                  <Controller.Password
                    control={control}
                    name="password"
                    value={watch("password")}
                    disabled={mutation.isPending}
                  />
                }
              />

              <Button
                loading={mutation.isPending}
                htmlType="submit"
                className="w-full mt-2"
                size={ButtonSize.Small}
              >
                {intl("page.register.form.button.submit.label")}
              </Button>
            </div>
          </Form>
          <div className="mt-4">
            <GoogleAuth purpose="register" role={role} />
          </div>
        </div>
      </main>
      <aside className="flex-col items-center justify-center flex-1 flex-shrink hidden basis-1/4 xl:flex bg-alternative">
        <div className="flex flex-col gap-4 text-center mb-14">
          <p className="text-7xl">LiteSpace</p>
          <p className="text-3xl text-foreground-light">
            {intl("page.login.slogan")}
          </p>
        </div>
        <div className="w-3/4 p-6">
          <RegisterLight className="block dark:hidden" />
          <RegisterDark className="hidden dark:block" />
        </div>
      </aside>
    </div>
  );
};

export default Register;
