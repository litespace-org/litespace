import { router } from "@/lib/route";
import { useUser } from "@litespace/headless/context/user";
import { useLoginUser } from "@litespace/headless/user";
import { Button } from "@litespace/ui/Button";
import { Form } from "@litespace/ui/Form";
import { useToast } from "@litespace/ui/Toast";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { isRegularUser } from "@litespace/utils";
import { Dashboard, Landing } from "@litespace/utils/routes";
import React from "react";
import { useForm } from "@litespace/headless/form";
import { useNavigate } from "react-router-dom";
import { Input, Password } from "@litespace/ui/Input";
import { useMakeValidators } from "@litespace/ui/hooks/validation";
import { validateEmail, validatePassword } from "@litespace/ui/lib/validate";

interface Form {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const intl = useFormatMessage();
  const navigate = useNavigate();
  const toast = useToast();
  const user = useUser();

  const mutation = useLoginUser({
    onSuccess(result) {
      const regularUser = isRegularUser(result.user);
      if (regularUser) {
        user.logout();
        return window.location.replace(
          router.landing({ route: Landing.Home, full: true })
        );
      }

      user.set(result);
      return navigate(Dashboard.Root);
    },
    onError(error) {
      toast.error({
        title: intl("login.error"),
        description: error instanceof Error ? error.message : undefined,
      });
    },
  });

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
      email: "",
      password: "",
    },
    validators,
    onSubmit(data) {
      mutation.mutate(data);
    },
  });

  return (
    <div className="flex flex-row flex-1 min-h-screen text-foreground">
      <main className="flex flex-col items-center flex-1 flex-shrink-0 px-5 pt-16 pb-8 text-right border-l shadow-lg bg-studio border-border">
        <div className="flex flex-col justify-center flex-1 w-full max-w-sm">
          <div className="mb-4">
            <h1 className="text-3xl text-right font-simi-bold">
              {intl("page.login.form.title")}
            </h1>
          </div>

          <Form onSubmit={form.onSubmit}>
            <div className="flex flex-col gap-4">
              <Input
                id="email"
                name="email"
                value={form.state.email}
                placeholder={intl("labels.email.placeholder")}
                onChange={(e) => form.set("email", e.target.value)}
                autoComplete="off"
                disabled={mutation.isPending}
                label={intl("labels.email")}
                state={form.errors.email ? "error" : undefined}
                helper={form.errors.email}
              />

              <Password
                id="password"
                idleDir="rtl"
                name="password"
                autoComplete="off"
                value={form.state.password}
                onChange={(e) => form.set("password", e.target.value)}
                disabled={mutation.isPending}
                label={intl("labels.password")}
                helper={form.errors.password}
                state={form.errors.password ? "error" : undefined}
              />

              <Button
                size="medium"
                disabled={mutation.isPending}
                loading={mutation.isPending}
              >
                {intl("login.button.label")}
              </Button>
            </div>
          </Form>
        </div>
      </main>
    </div>
  );
};

export default Login;
