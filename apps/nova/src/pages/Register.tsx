import { Form, Label, Controller } from "@litespace/luna/Form";
import { Button, ButtonSize, ButtonVariant } from "@litespace/luna/Button";
import { useToast } from "@litespace/luna/Toast";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import React, { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Route } from "@/types/routes";
import { IUser } from "@litespace/types";
import { useRegisterUser } from "@litespace/headless/user";
import { useUserContext } from "@litespace/headless/context/user";
import Aside from "@/components/Auth/Aside";
import Header from "@/components/Auth/Header";
import Logo from "@litespace/assets/Logo";
import { Typography } from "@litespace/luna/Typography";
import {
  useValidateEmail,
  useValidatePassword,
  useValidateUserName,
} from "@litespace/luna/hooks/validation";
import { useGoogle } from "@/hooks/google";
import Google from "@litespace/assets/Google";

interface IForm {
  name: string;
  email: string;
  password: string;
  confirmedPassword: string;
}

type Role = (typeof roles)[number];

const roles = [IUser.Role.Tutor, IUser.Role.Student] as const;

const origin = location.origin;
const callbackUrl = origin.concat(Route.VerifyEmail);

const Register: React.FC = () => {
  const intl = useFormatMessage();
  const user = useUserContext();
  const navigate = useNavigate();
  const toast = useToast();
  const { role } = useParams<{ role: Role }>();
  const { watch, handleSubmit, control } = useForm<IForm>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmedPassword: "",
    },
  });

  const validateUserName = useValidateUserName(true);
  const validateEmail = useValidateEmail(true);
  const validatePassword = useValidatePassword(true);
  const isValidRole = useMemo(() => role && roles.includes(role), [role]);
  const google = useGoogle({ role: isValidRole ? role : undefined });
  const name = watch("name");
  const email = watch("email");
  const password = watch("password");
  const confirmedPassword = watch("confirmedPassword");

  useEffect(() => {
    if (!isValidRole) return navigate(Route.Root);
  }, [isValidRole, navigate]);

  const onSuccess = useCallback(
    async ({ user: info, token }: IUser.RegisterApiResponse) => {
      user.set({ user: info, token });
      navigate(Route.Root);
    },
    [navigate, user]
  );

  const onError = useCallback(
    (error: Error) => {
      toast.error({
        title: intl("register.error"),
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
    <div className="flex flex-row gap-8 h-full p-6">
      <main className="flex flex-col items-center flex-1 flex-shrink-0 w-full">
        <Header />
        <div className="flex-1 flex flex-col justify-center max-w-[404px] w-full">
          <div className="flex flex-row items-center justify-center gap-4 mb-8">
            <Logo className="h-[87px]" />
            <div className="flex flex-col gap-2 items-start justify-center">
              <Typography element="h3" weight="bold" className="text-brand-500">
                {intl("labels.litespace")}
              </Typography>
              <Typography element="body" className="text-natural-700">
                {intl("register.welcome")}
              </Typography>
            </div>
          </div>
          <Form onSubmit={onSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col">
                  <Label id="email">{intl("register.full-name")}</Label>
                  <Controller.Input
                    control={control}
                    name="name"
                    value={name}
                    autoComplete="off"
                    rules={{ validate: validateUserName }}
                    placeholder={intl("register.full-name")}
                    disabled={mutation.isPending || google.loading}
                    idleDir="rtl"
                  />
                </div>
                <div className="flex flex-col">
                  <Label id="email">{intl("labels.email")}</Label>
                  <Controller.Input
                    control={control}
                    name="email"
                    value={email}
                    autoComplete="off"
                    rules={{ validate: validateEmail }}
                    placeholder={intl("labels.email.placeholder")}
                    disabled={mutation.isPending || google.loading}
                    idleDir="ltr"
                  />
                </div>

                <div className="flex flex-col">
                  <Label id="password">{intl("labels.password")}</Label>
                  <Controller.Password
                    control={control}
                    name="password"
                    value={password}
                    rules={{ validate: validatePassword }}
                    disabled={mutation.isPending || google.loading}
                  />
                </div>
                <div className="flex flex-col">
                  <Label id="password">
                    {intl("register.confirm-password")}
                  </Label>
                  <Controller.Password
                    control={control}
                    name="confirmedPassword"
                    value={confirmedPassword}
                    rules={{
                      validate: (value) => {
                        if (value !== watch("password"))
                          return intl("register.password-not-the-same");
                        return validatePassword(value);
                      },
                    }}
                    disabled={mutation.isPending || google.loading}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <Button
                  size={ButtonSize.Small}
                  disabled={mutation.isPending || google.loading}
                  loading={mutation.isPending}
                  className="w-full"
                  htmlType="submit"
                >
                  {intl("register.create-account")}
                </Button>

                <Button
                  variant={ButtonVariant.Secondary}
                  size={ButtonSize.Small}
                  className="w-full"
                  endIcon={<Google />}
                  onClick={google.login}
                  htmlType="button"
                  loading={google.loading}
                  disabled={google.loading || mutation.isPending}
                >
                  {intl("register.with-google")}
                </Button>

                <Typography
                  element="caption"
                  weight="medium"
                  className="text-natural-950 text-center"
                >
                  {intl.node("register.has-account", {
                    link: (
                      <Link to={Route.Login}>
                        <Typography
                          element="caption"
                          weight="medium"
                          className="text-brand-700"
                        >
                          {intl("register.login")}
                        </Typography>
                      </Link>
                    ),
                  })}
                </Typography>
              </div>
            </div>
          </Form>
        </div>
      </main>
      <Aside />
    </div>
  );
};

export default Register;
