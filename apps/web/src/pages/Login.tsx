import { Form, Controller } from "@litespace/ui/Form";
import { Button } from "@litespace/ui/Button";
import { useToast } from "@litespace/ui/Toast";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { IUser } from "@litespace/types";
import { useLoginUser } from "@litespace/headless/user";
import { useUserContext } from "@litespace/headless/context/user";
import Logo from "@litespace/assets/Logo";
import Google from "@litespace/assets/Google";
import { Typography } from "@litespace/ui/Typography";
import { useGoogle } from "@/hooks/google";
import {
  useValidateEmail,
  useValidatePassword,
} from "@litespace/ui/hooks/validation";
import Aside from "@/components/Auth/Aside";
import Header from "@/components/Auth/Header";
import { getErrorMessageId } from "@litespace/ui/errorMessage";
import { isDev } from "@/constants/env";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import { capture } from "@/lib/sentry";
import { isValidRoute, Web } from "@litespace/utils/routes";
import { router } from "@/lib/routes";
import { omit } from "lodash";

interface IForm {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const intl = useFormatMessage();
  const navigate = useNavigate();
  const toast = useToast();
  const user = useUserContext();
  const mq = useMediaQuery();
  const [searchParams] = useSearchParams();
  const validateEmail = useValidateEmail(true);
  const validatePassword = useValidatePassword(true);

  const redirect = useMemo(() => {
    const query = Object.fromEntries(searchParams);
    const route = searchParams.get("redirect");
    if (!route || !isValidRoute(route)) return null;
    return router.generic({ route, query: omit(query, "redirect") });
  }, [searchParams]);

  const google = useGoogle({ redirect });

  const { control, handleSubmit, watch, formState } = useForm<IForm>({
    defaultValues: {
      email: isDev ? "student@litespace.org" : "",
      password: isDev ? "Password@8" : "",
    },
  });

  const email = watch("email");
  const password = watch("password");
  const errors = formState.errors;

  const mutation = useLoginUser({
    onSuccess(result) {
      user.set(result);
      return navigate(redirect || Web.Root);
    },
    onError(error) {
      capture(error);
      const errorMessage = getErrorMessageId(error);
      toast.error({
        title: intl("login.error"),
        description: intl(errorMessage),
      });
    },
  });

  const onSubmit = useMemo(
    () =>
      handleSubmit((credentials: IUser.Credentials) =>
        mutation.mutate(credentials)
      ),
    [handleSubmit, mutation]
  );

  return (
    <div className="flex flex-row gap-8 h-full p-4 sm:p-6">
      <main className="flex flex-col gap-10 sm:gap-0 items-center justify-start flex-1 flex-shrink-0 w-full">
        <Header />

        <div className="flex-1 flex flex-col sm:justify-center max-w-[404px] w-full">
          <div className="flex flex-row items-center justify-center gap-4 mb-6 sm:mb-8">
            <Logo className="h-[87px]" />
            <div className="flex flex-col gap-2 items-start justify-center">
              <Typography tag="h1" className="text-brand-500 text-h3 font-bold">
                {intl("labels.litespace")}
              </Typography>
              <Typography tag="span" className="text-natural-700 text-body">
                {intl("login.welcome")}
              </Typography>
            </div>
          </div>

          <Form onSubmit={onSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2 sm:gap-4">
                <Controller.Input
                  id="email"
                  name="email"
                  idleDir="rtl"
                  value={email}
                  inputSize="large"
                  autoComplete="off"
                  control={control}
                  helper={errors.email?.message}
                  label={intl("labels.email")}
                  rules={{ validate: validateEmail }}
                  state={errors.email ? "error" : undefined}
                  placeholder={intl("labels.email.placeholder")}
                  disabled={mutation.isPending || google.loading}
                />

                <Controller.Password
                  id="password"
                  idleDir="rtl"
                  control={control}
                  name="password"
                  inputSize="large"
                  value={password}
                  rules={{ validate: validatePassword }}
                  disabled={mutation.isPending || google.loading}
                  label={intl("labels.password")}
                  placeholder={intl("login.enter-password")}
                  state={errors.password ? "error" : undefined}
                  helper={errors.password?.message}
                />

                <div className="mt-2 sm:mt-0">
                  <Link to={Web.ForgetPassword}>
                    <Typography
                      tag="span"
                      className="text-brand-700 text-caption font-medium"
                    >
                      {intl("login.forget-password")}
                    </Typography>
                  </Link>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <Button
                  type="main"
                  size="large"
                  disabled={mutation.isPending || google.loading}
                  loading={mutation.isPending}
                  className="w-full"
                  htmlType="submit"
                >
                  {intl("login.button.label")}
                </Button>

                <Button
                  variant="secondary"
                  size="large"
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
                  tag="p"
                  className="text-natural-950 text-center text-caption font-medium"
                >
                  {intl.rich("login.has-no-account", {
                    link: (
                      <Link
                        to={router.web({
                          route: Web.Register,
                          role: "student",
                        })}
                      >
                        <Typography
                          tag="span"
                          className="text-brand-700 text-caption font-medium"
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

      {mq.lg ? <Aside /> : null}
    </div>
  );
};

export default Login;
