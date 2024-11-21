import { Form, Label, Field, Controller } from "@litespace/luna/Form";
import { Button, ButtonSize } from "@litespace/luna/Button";
import { useToast } from "@litespace/luna/Toast";
import { InputType } from "@litespace/luna/Input";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Route } from "@/lib/route";
import { IUser } from "@litespace/types";
import { useUser } from "@litespace/headless/user-ctx";
import { useLoginUser } from "@litespace/headless/user";

interface IForm {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const intl = useFormatMessage();
  const navigate = useNavigate();
  const user = useUser();
  const toast = useToast();
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<IForm>({
    defaultValues: {
      email: "admin@litespace.org",
      password: "LiteSpace432%^&",
    },
  });

  const email = watch("email");
  const password = watch("password");

  const mutation = useLoginUser({
    onSuccess(result: IUser.LoginApiResponse) {
      user.set(result);
      navigate(Route.Root);
    },
    onError(error) {
      toast.error({
        title: intl("page.login.failed"),
        description: error instanceof Error ? error.message : undefined,
      });
    },
  });

  const onSubmit = useMemo(
    () =>
      handleSubmit(async (credentials: IUser.Credentials) =>
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
                  <Controller.Input
                    control={control}
                    name="password"
                    type={InputType.Password}
                    autoComplete="off"
                    value={password}
                    error={!!errors["password"]?.message}
                    helper={errors["password"]?.message}
                    disabled={mutation.isPending}
                  />
                }
              />

              <Button
                size={ButtonSize.Small}
                disabled={mutation.isPending}
                loading={mutation.isPending}
              >
                {intl("page.login.form.button.submit.label")}
              </Button>
            </div>
          </Form>
        </div>
      </main>
    </div>
  );
};

export default Login;
