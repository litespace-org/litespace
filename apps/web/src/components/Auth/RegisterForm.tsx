import { Form, Controller } from "@litespace/ui/Form";
import { Button } from "@litespace/ui/Button";
import { useToast } from "@litespace/ui/Toast";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { IUser } from "@litespace/types";
import { useRegisterUser } from "@litespace/headless/user";
import { useUser } from "@litespace/headless/context/user";
import { Typography } from "@litespace/ui/Typography";
import {
  useValidateEmail,
  useValidatePassword,
} from "@litespace/ui/hooks/validation";
import { useGoogle } from "@/hooks/google";
import Google from "@litespace/assets/Google";
import { Landing, Web } from "@litespace/utils/routes";
import { router } from "@/lib/routes";
import { useOnError } from "@/hooks/error";
import { VerifyEmail } from "@/components/Common/VerifyEmail";

interface IForm {
  email: string;
  password: string;
  confirmedPassword: string;
}

type Role = "student" | "tutor";

const RegisterForm: React.FC = () => {
  const intl = useFormatMessage();
  const user = useUser();
  const navigate = useNavigate();
  const toast = useToast();
  const params = useParams<{ role: Role }>();

  const [showVerifyDialog, setShowVerifyDialog] = useState<boolean>(false);

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
  const role = useMemo(() => {
    if (params.role === "student") return IUser.Role.Student;
    if (params.role === "tutor") return IUser.Role.Tutor;
    return null;
  }, [params.role]);
  const google = useGoogle({
    role: role || undefined,
  });
  const email = watch("email");
  const password = watch("password");
  const confirmedPassword = watch("confirmedPassword");

  useEffect(() => {
    if (!role) return navigate(Web.Root);
  }, [navigate, role]);

  const onSuccess = useCallback(
    async ({ user: info, token }: IUser.RegisterApiResponse) => {
      user.set({ user: info, token });
      setShowVerifyDialog(true);
    },
    [user]
  );

  const onError = useOnError({
    type: "mutation",
    handler: ({ messageId }) => {
      toast.error({
        title: intl("register.error"),
        description: intl(messageId),
      });
    },
  });

  const mutation = useRegisterUser({ onSuccess, onError });

  const onSubmit = useMemo(
    () =>
      handleSubmit((payload: IForm) => {
        if (!role) return;
        return mutation.mutate({
          email: payload.email,
          password: payload.password,
          role,
        });
      }),
    [handleSubmit, mutation, role]
  );

  return (
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
            tag="p"
            className="text-natural-600 text-caption font-medium"
          >
            {intl.rich("register.accept-terms", {
              terms: (text: string[]) => (
                <Link
                  target="_blank"
                  className="text-brand-700 underline"
                  to={router.landing({ route: Landing.Terms, full: true })}
                >
                  {text}
                </Link>
              ),
              privacy: (text: string[]) => (
                <Link
                  target="_blank"
                  className="text-brand-700 underline"
                  to={router.landing({ route: Landing.Privacy, full: true })}
                >
                  {text}
                </Link>
              ),
            })}
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
            tag="p"
            className="text-natural-950 text-center text-caption font-medium"
          >
            {intl.rich("register.has-account", {
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
      {showVerifyDialog ? (
        <VerifyEmail
          emailSent
          close={() => {
            setShowVerifyDialog(false);
            navigate(Web.CompleteProfile);
          }}
        />
      ) : null}
    </Form>
  );
};

export default RegisterForm;
