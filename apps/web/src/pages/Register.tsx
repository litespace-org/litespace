import { Form, Controller } from "@litespace/ui/Form";
import { Button } from "@litespace/ui/Button";
import { useToast } from "@litespace/ui/Toast";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import React, { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { IUser } from "@litespace/types";
import { useRegisterUser } from "@litespace/headless/user";
import { useUserContext } from "@litespace/headless/context/user";
import Aside from "@/components/Auth/Aside";
import Header from "@/components/Auth/Header";
import Logo from "@litespace/assets/Logo";
import { Typography } from "@litespace/ui/Typography";
import {
  useValidateEmail,
  useValidatePassword,
} from "@litespace/ui/hooks/validation";
import { useGoogle } from "@/hooks/google";
import Google from "@litespace/assets/Google";
import { getErrorMessageId } from "@litespace/ui/errorMessage";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import { capture } from "@/lib/sentry";
import { Web } from "@litespace/utils/routes";

interface IForm {
  email: string;
  password: string;
  confirmedPassword: string;
}

type Role = (typeof roles)[number];

const roles = [IUser.Role.Tutor, IUser.Role.Student] as const;

const origin = location.origin;
const callbackUrl = origin.concat(Web.VerifyEmail);

const Register: React.FC = () => {
  const intl = useFormatMessage();
  const mq = useMediaQuery();
  const user = useUserContext();
  const navigate = useNavigate();
  const toast = useToast();
  const { role } = useParams<{ role: Role }>();
  const { watch, handleSubmit, control, formState } = useForm<IForm>({
    defaultValues: {
      email: "",
      password: "",
      confirmedPassword: "",
    },
  });
  const errors = formState.errors;

  const validateEmail = useValidateEmail(true);
  const validatePassword = useValidatePassword(true);
  const isValidRole = useMemo(() => role && roles.includes(role), [role]);
  const google = useGoogle({ role: isValidRole ? role : undefined });
  const email = watch("email");
  const password = watch("password");
  const confirmedPassword = watch("confirmedPassword");

  useEffect(() => {
    if (!isValidRole) return navigate(Web.Root);
  }, [isValidRole, navigate]);

  const onSuccess = useCallback(
    async ({ user: info, token }: IUser.RegisterApiResponse) => {
      user.set({ user: info, token });
      navigate(Web.CompleteProfile);
    },
    [navigate, user]
  );

  const onError = useCallback(
    (error: unknown) => {
      capture(error);
      const errorMessage = getErrorMessageId(error);
      toast.error({
        title: intl("register.error"),
        description: intl(errorMessage),
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
    <div className="flex flex-row gap-8 h-full p-4 sm:p-6">
      <main className="flex flex-col gap-10 sm:gap-0 items-center flex-1 flex-shrink-0 w-full">
        <Header />

        <div className="flex-1 flex flex-col sm:justify-center max-w-[404px] w-full">
          <div className="flex flex-row items-center justify-center gap-4 mb-6 sm:mb-8">
            <Logo className="h-[87px]" />
            <div className="flex flex-col gap-2 items-start justify-center">
              <Typography tag="h1" className="text-brand-500 text-h3 font-bold">
                {intl("labels.litespace")}
              </Typography>
              <Typography tag="h2" className="text-natural-700 text-body">
                {intl("register.welcome")}
              </Typography>
            </div>
          </div>

          <Form onSubmit={onSubmit}>
            <div className="flex flex-col gap-4 sm:gap-6">
              <div className="flex flex-col gap-2 sm:gap-4">
                <Controller.Input
                  id="email"
                  control={control}
                  name="email"
                  value={email}
                  autoComplete="off"
                  label={intl("labels.email")}
                  rules={{ validate: validateEmail }}
                  placeholder={intl("labels.email.placeholder")}
                  disabled={mutation.isPending || google.loading}
                  state={errors.email ? "error" : undefined}
                  helper={errors.email?.message}
                  idleDir="rtl"
                />

                <Controller.Password
                  idleDir="rtl"
                  id="password"
                  name="password"
                  value={password}
                  control={control}
                  label={intl("labels.password")}
                  helper={errors.password?.message}
                  rules={{ validate: validatePassword }}
                  state={errors.password ? "error" : undefined}
                  disabled={mutation.isPending || google.loading}
                  placeholder={intl("register.password.placeholder")}
                />

                <Controller.Password
                  control={control}
                  id="confirmedPassword"
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
                  label={intl("register.confirm-password")}
                  placeholder={intl("register.confirm-password.placeholder")}
                  state={errors.confirmedPassword ? "error" : undefined}
                  helper={errors.confirmedPassword?.message}
                  idleDir="rtl"
                />

                <Typography
                  tag="span"
                  className="text-natural-600 text-caption font-medium"
                >
                  {intl("register.accept-terms")}
                </Typography>
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
                  {intl("register.create-account")}
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
                  {intl("register.with-google")}
                </Button>

                <Typography
                  tag="span"
                  className="text-natural-950 text-center text-caption font-medium"
                >
                  {intl.node("register.has-account", {
                    link: (
                      <Link to={Web.Login}>
                        <Typography
                          tag="span"
                          className="text-brand-700 text-caption font-medium"
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

      {mq.lg ? <Aside /> : null}
    </div>
  );
};

export default Register;
