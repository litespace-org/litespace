import { Form, Controller, Field, Label } from "@litespace/luna/Form";
import {
  Button,
  ButtonType,
  ButtonSize,
  ButtonVariant,
} from "@litespace/luna/Button";
import { useToast } from "@litespace/luna/Toast";
import { messages } from "@litespace/luna/locales";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import { FormattedMessage } from "react-intl";
import { useNavigate } from "react-router-dom";
import { Route } from "@/types/routes";
import { IUser } from "@litespace/types";
import LoginLight from "@litespace/assets/LoginLight";
import LoginDark from "@litespace/assets/LoginDark";
import GoogleAuth from "@/components/Common/GoogleAuth";
import { useLoginUser } from "@litespace/headless/user";
import { useRender } from "@/hooks/render";
import ForgetPassword from "@/components/Common/ForgetPassword";
import { useUser } from "@litespace/headless/context/user";

interface IForm {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const intl = useFormatMessage();
  const navigate = useNavigate();
  const toast = useToast();
  const user = useUser();
  const { control, handleSubmit, watch } = useForm<IForm>({
    defaultValues: {
      email: "student@litespace.org",
      password: "Password@8",
    },
  });

  const email = watch("email");
  const password = watch("password");
  const forgetPassword = useRender();

  const mutation = useLoginUser({
    onSuccess(result) {
      user.set(result);
      return navigate(Route.Root);
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
      handleSubmit(
        async (credentials: IUser.Credentials) =>
          await mutation.mutateAsync(credentials)
      ),
    [handleSubmit, mutation]
  );

  return (
    <div className="flex flex-row flex-1 text-foreground">
      <main className="flex flex-col items-center flex-1 flex-shrink-0 px-5 pt-16 pb-8 text-right border-l shadow-lg bg-studio border-border">
        <div className="flex-1 flex flex-col justify-center w-[330px] sm:w-[384px]">
          <div className="mb-4">
            <h1 className="text-3xl text-right font-simi-bold">
              <FormattedMessage id={messages["page.login.form.title"]} />
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
                    value={password}
                    disabled={mutation.isPending}
                  />
                }
              />

              <Button
                size={ButtonSize.Small}
                disabled={mutation.isPending}
                loading={mutation.isPending}
                className="w-full"
              >
                {intl("page.login.form.button.submit.label")}
              </Button>
            </div>
          </Form>

          <div className="mt-4">
            <GoogleAuth purpose="login" />
          </div>
          <div className="mt-6">
            <Button
              size={ButtonSize.Small}
              type={ButtonType.Main}
              variant={ButtonVariant.Secondary}
              onClick={forgetPassword.show}
              className="w-full"
            >
              {intl("page.login.forget.password")}
            </Button>
          </div>
        </div>
        <ForgetPassword
          open={forgetPassword.open}
          close={forgetPassword.hide}
        />
      </main>
      <aside className="flex-col items-center justify-center flex-1 flex-shrink hidden basis-1/4 xl:flex bg-alternative">
        <div className="flex flex-col items-center justify-center gap-4 mb-14">
          <p className="text-7xl">LiteSpace</p>
          <p className="text-3xl text-foreground-light">
            {intl("page.login.slogan")}
          </p>
        </div>

        <div className="p-6 mt-12 lg:w-3/4">
          <LoginLight className="block dark:hidden" />
          <LoginDark className="hidden dark:block" />
        </div>
      </aside>
    </div>
  );
};

export default Login;
