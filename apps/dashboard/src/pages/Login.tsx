import { production } from "@/lib/env";
import { router } from "@/lib/route";
import { useUserContext } from "@litespace/headless/context/user";
import { useLoginUser } from "@litespace/headless/user";
import { IUser } from "@litespace/types";
import { Button } from "@litespace/ui/Button";
import { Controller, Form } from "@litespace/ui/Form";
import { useToast } from "@litespace/ui/Toast";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { isRegularUser } from "@litespace/utils";
import { Dashboard, Landing } from "@litespace/utils/routes";
import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

interface IForm {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const intl = useFormatMessage();
  const navigate = useNavigate();
  const toast = useToast();
  const user = useUserContext();
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<IForm>({
    defaultValues: {
      email: production ? "admin@litespace.org" : "",
      password: production ? "Password@8" : "",
    },
  });

  const email = watch("email");
  const password = watch("password");

  const mutation = useLoginUser({
    onSuccess(result) {
      const regularUser = isRegularUser(result.user);
      if (regularUser)
        return window.location.replace(
          router.landing({ route: Landing.Home, full: true })
        );

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

  const onSubmit = useMemo(
    () =>
      handleSubmit((credentials: IUser.Credentials) =>
        mutation.mutate(credentials)
      ),
    [handleSubmit, mutation]
  );

  return (
    <div className="flex flex-row flex-1 min-h-screen text-foreground">
      <main className="flex flex-col items-center flex-1 flex-shrink-0 px-5 pt-16 pb-8 text-right border-l shadow-lg bg-studio border-border">
        <div className="flex flex-col justify-center flex-1 w-full max-w-sm">
          <div className="mb-4">
            <h1 className="text-3xl text-right font-simi-bold">
              {intl("page.login.form.title")}
            </h1>
          </div>

          <Form onSubmit={onSubmit}>
            <div className="flex flex-col gap-4">
              <Controller.Input
                control={control}
                name="email"
                value={email}
                placeholder={intl("labels.email.placeholder")}
                autoComplete="off"
                disabled={mutation.isPending}
                label={intl("labels.email")}
                state={errors.email ? "error" : undefined}
                helper={errors.email?.message}
              />

              <Controller.Password
                control={control}
                name="password"
                autoComplete="off"
                value={password}
                disabled={mutation.isPending}
                label={intl("labels.password")}
                state={errors.password ? "error" : undefined}
                helper={errors.password?.message}
              />

              <Button
                size={"medium"}
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
