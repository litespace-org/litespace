import { isDev } from "@/constants/env";
import { useOnError } from "@/hooks/error";
import { useGoogle } from "@/hooks/google";
import { router } from "@/lib/routes";
import Google from "@litespace/assets/Google";
import { useUser } from "@litespace/headless/context/user";
import { useForm } from "@litespace/headless/form";
import { useLoginUser } from "@litespace/headless/user";
import { IUser, Void } from "@litespace/types";
import { Button } from "@litespace/ui/Button";
import { Form } from "@litespace/ui/Form";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useMakeValidators } from "@litespace/ui/hooks/validation";
import { Input, Password } from "@litespace/ui/Input";
import { validateEmail, validatePassword } from "@litespace/ui/lib/validate";
import { useToast } from "@litespace/ui/Toast";
import { Typography } from "@litespace/ui/Typography";
import { isRegularUser } from "@litespace/utils";
import { isValidRoute, Landing, Web } from "@litespace/utils/routes";
import { omit } from "lodash";
import { useCallback, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

type Form = {
  email: string;
  password: string;
};

const LoginForm: React.FC<{
  onForgetPassword: Void;
}> = ({ onForgetPassword }) => {
  const intl = useFormatMessage();
  const toast = useToast();

  const user = useUser();
  const navigate = useNavigate();

  // ======== Google Login ============
  const [searchParams] = useSearchParams();
  const redirect = useMemo(() => {
    const query = Object.fromEntries(searchParams);
    const route = searchParams.get("redirect");
    if (!route || !isValidRoute(route)) return null;
    return router.generic({ route, query: omit(query, "redirect") });
  }, [searchParams]);

  const google = useGoogle({ redirect });

  // ========== manual login ============
  const onSuccess = useCallback(
    (result: IUser.LoginApiResponse) => {
      const regularUser = isRegularUser(result.user);
      if (result.user && !regularUser) {
        user.logout();
        return window.location.replace(
          router.landing({ route: Landing.Home, full: true })
        );
      }
      user.set(result);
      return navigate(redirect || Web.Root);
    },
    [navigate, redirect, user]
  );

  const onError = useOnError({
    type: "mutation",
    handler: ({ messageId }) => {
      toast.error({
        title: intl("login.error"),
        description: intl(messageId),
      });
    },
  });

  const mutation = useLoginUser({
    onSuccess,
    onError,
  });

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
  });

  const form = useForm<Form>({
    defaults: {
      email: isDev ? "student@litespace.org" : "",
      password: isDev ? "Password@8" : "",
    },
    validators,
    onSubmit: (credentials) => {
      mutation.mutate(credentials);
    },
  });

  return (
    <Form onSubmit={form.onSubmit}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2 sm:gap-4">
          <Input
            id="email"
            name="email"
            idleDir="rtl"
            value={form.state.email}
            onChange={(e) => form.set("email", e.target.value)}
            inputSize="large"
            autoComplete="off"
            helper={form.errors.email}
            label={intl("labels.email")}
            state={form.errors.email ? "error" : undefined}
            placeholder={intl("labels.email.placeholder")}
            disabled={mutation.isPending || google.loading}
          />

          <Password
            id="password"
            idleDir="rtl"
            name="password"
            inputSize="large"
            value={form.state.password}
            onChange={(e) => form.set("password", e.target.value)}
            disabled={mutation.isPending || google.loading}
            label={intl("labels.password")}
            placeholder={intl("login.enter-password")}
            state={form.errors.password ? "error" : undefined}
            helper={form.errors.password}
          />

          <div className="mt-2 sm:mt-0">
            <button
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 rounded-md"
              type="button"
              onClick={onForgetPassword}
            >
              <Typography
                tag="span"
                className="text-brand-700 text-caption font-medium"
              >
                {intl("login.forget-password")}
              </Typography>
            </button>
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
  );
};

export default LoginForm;
