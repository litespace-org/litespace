import { VerifyEmail } from "@/components/Common/VerifyEmail";
import { useOnError } from "@/hooks/error";
import { useGoogle } from "@/hooks/google";
import { useRender } from "@litespace/headless/common";
import { router } from "@/lib/routes";
import Google from "@litespace/assets/Google";
import { useUser } from "@litespace/headless/context/user";
import { useForm } from "@litespace/headless/form";
import { useRegisterUser } from "@litespace/headless/user";
import { IUser } from "@litespace/types";
import { Button } from "@litespace/ui/Button";
import { Form } from "@litespace/ui/Form";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useMakeValidators } from "@litespace/ui/hooks/validation";
import { Input, Password } from "@litespace/ui/Input";
import { validateEmail, validatePassword } from "@litespace/ui/lib/validate";
import { useToast } from "@litespace/ui/Toast";
import { Typography } from "@litespace/ui/Typography";
import { Landing, Web } from "@litespace/utils/routes";
import { useCallback, useEffect, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

type Form = {
  email: string;
  password: string;
  confirmPassword: string;
};

type Role = "student" | "tutor";

const RegisterForm: React.FC = () => {
  const intl = useFormatMessage();
  const toast = useToast();
  const user = useUser();

  const verifyEmailDialog = useRender();

  const navigate = useNavigate();

  // ======== Google Registeration ============
  const params = useParams<{ role: Role }>();
  const role = useMemo(() => {
    if (params.role === "student") return IUser.Role.Student;
    if (params.role === "tutor") return IUser.Role.Tutor;
    return null;
  }, [params.role]);

  useEffect(() => {
    if (!role) return navigate(Web.Root);
  }, [navigate, role]);

  const google = useGoogle({
    role: role || undefined,
  });

  // ========== manual registeration ============
  const onSuccess = useCallback(
    async ({ user: info, token }: IUser.RegisterApiResponse) => {
      user.set({ user: info, token });
      verifyEmailDialog.show();
    },
    [user, verifyEmailDialog]
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

  // ============= form ==============
  const validators = useMakeValidators<Form>({
    email: {
      required: true,
      validate: validateEmail,
    },
    password: {
      required: true,
      validate: validatePassword,
    },
    confirmPassword: {
      required: true,
      validate: (value, form) => {
        if (value !== form.password) return "register.password-not-the-same";
        return validatePassword(value);
      },
    },
  });

  const form = useForm<Form>({
    defaults: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    validators,
    onSubmit: (data) => {
      if (!role) return;
      return mutation.mutate({
        email: data.email,
        password: data.password,
        role,
      });
    },
  });

  return (
    <Form onSubmit={form.onSubmit}>
      <div className="flex flex-col gap-4 sm:gap-6">
        <div className="flex flex-col gap-2 sm:gap-4">
          <Input
            id="email"
            name="email"
            value={form.state.email}
            onChange={(e) => form.set("email", e.target.value)}
            autoComplete="off"
            label={intl("labels.email")}
            placeholder={intl("labels.email.placeholder")}
            disabled={mutation.isPending || google.loading}
            state={form.errors.email ? "error" : undefined}
            helper={form.errors.email}
            idleDir="rtl"
          />

          <Password
            idleDir="rtl"
            id="password"
            name="password"
            value={form.state.password}
            onChange={(e) => form.set("password", e.target.value)}
            label={intl("labels.password")}
            helper={form.errors.password}
            state={form.errors.password ? "error" : undefined}
            disabled={mutation.isPending || google.loading}
            placeholder={intl("register.password.placeholder")}
          />

          <Password
            id="confirmPassword"
            name="confirmPassword"
            value={form.state.confirmPassword}
            onChange={(e) => form.set("confirmPassword", e.target.value)}
            disabled={mutation.isPending || google.loading}
            label={intl("register.confirm-password")}
            placeholder={intl("register.confirm-password.placeholder")}
            state={form.errors.confirmPassword ? "error" : undefined}
            helper={form.errors.confirmPassword}
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
      <VerifyEmail
        emailSent
        open={verifyEmailDialog.open}
        close={() => {
          verifyEmailDialog.hide();
          navigate(Web.CompleteProfile);
        }}
      />
    </Form>
  );
};

export default RegisterForm;
