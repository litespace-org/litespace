import { Form, Label, Field, Controller } from "@litespace/ui/Form";
import { Button, ButtonSize } from "@litespace/ui/Button";
import { useToast } from "@litespace/ui/Toast";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Route } from "@/lib/route";
import { IUser } from "@litespace/types";
import { useUserContext } from "@litespace/headless/context/user";
import { useLoginUser } from "@litespace/headless/user";

interface IForm {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const intl = useFormatMessage();
  const navigate = useNavigate();
  const toast = useToast();
  const user = useUserContext();
  const { control, handleSubmit, watch } = useForm<IForm>({
    defaultValues: {
      email: "admin@litespace.org",
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
              <Field
                label={<Label id="email">{intl("labels.email")}</Label>}
                field={
                  <Controller.Input
                    control={control}
                    name="email"
                    value={email}
                    placeholder={intl("labels.email.placeholder")}
                    autoComplete="off"
                    disabled={mutation.isPending}
                  />
                }
              />

              <Field
                label={<Label id="password">{intl("labels.password")}</Label>}
                field={
                  <Controller.Password
                    control={control}
                    name="password"
                    autoComplete="off"
                    value={password}
                    disabled={mutation.isPending}
                  />
                }
              />

              <Button
                size={ButtonSize.Small}
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
