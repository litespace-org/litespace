import { Form, Controller, Label } from "@litespace/luna/Form";
import { Button, ButtonSize, ButtonVariant } from "@litespace/luna/Button";
import { useToast } from "@litespace/luna/Toast";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Route } from "@/types/routes";
import { IUser } from "@litespace/types";
import { useLoginUser } from "@litespace/headless/user";
import { useUserContext } from "@litespace/headless/context/user";
import Logo from "@litespace/assets/Logo";
import Google from "@litespace/assets/Google";
import { Typography } from "@litespace/luna/Typography";
import { useGoogle } from "@/hooks/google";
import {
  useValidateEmail,
  useValidatePassword,
} from "@litespace/luna/hooks/validation";
import Aside from "@/components/Auth/Aside";
import Header from "@/components/Auth/Header";

interface IForm {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const intl = useFormatMessage();
  const navigate = useNavigate();
  const toast = useToast();
  const user = useUserContext();
  const google = useGoogle({});
  const validateEmail = useValidateEmail(true);
  const validatePassword = useValidatePassword(true);
  const { control, handleSubmit, watch } = useForm<IForm>({
    defaultValues: {
      email: "student@litespace.org",
      password: "Password@8",
    },
  });

  const email = watch("email");
  const password = watch("password");

  const mutation = useLoginUser({
    onSuccess(result) {
      user.set(result);
      return navigate(Route.Root);
    },
    onError(error) {
      toast.error({
        title: intl("login.error"),
        description: error instanceof Error ? error.message : undefined,
      });
    },
  });

  const onSubmit = useMemo(
    () =>
      handleSubmit(
        async (credentials: IUser.Credentials) =>
          await mutation.mutateAsync(credentials)
      ),
    [handleSubmit, mutation]
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
                {intl("login.welcome")}
              </Typography>
            </div>
          </div>
          <Form onSubmit={onSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4">
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

                <Link to={Route.ForgetPassword}>
                  <Typography
                    element="caption"
                    weight="medium"
                    className="text-brand-700"
                  >
                    {intl("login.forget-password")}
                  </Typography>
                </Link>
              </div>

              <div className="flex flex-col gap-4">
                <Button
                  size={ButtonSize.Small}
                  disabled={mutation.isPending || google.loading}
                  loading={mutation.isPending}
                  className="w-full"
                  htmlType="submit"
                >
                  {intl("login.button.label")}
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
                  {intl("login.with-google")}
                </Button>

                <Typography
                  element="caption"
                  weight="medium"
                  className="text-natural-950 text-center"
                >
                  {intl.node("login.has-no-account", {
                    link: (
                      <Link
                        to={Route.Register.replace(":role", IUser.Role.Student)}
                      >
                        <Typography
                          element="caption"
                          weight="medium"
                          className="text-brand-700"
                        >
                          {intl("login.create-account")}
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

export default Login;
