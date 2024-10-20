import {
  Form,
  Label,
  Field,
  Button,
  messages,
  InputType,
  toaster,
  ButtonSize,
  Controller,
  useFormatMessage,
  ButtonType,
} from "@litespace/luna";
import React, { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { FormattedMessage } from "react-intl";
import { useNavigate } from "react-router-dom";
import { Route } from "@/types/routes";
import { IUser } from "@litespace/types";
import { useAppDispatch } from "@/redux/store";
import { setUserProfile } from "@/redux/user/profile";
import { resetTutorMeta } from "@/redux/user/tutor";
import { resetUserRules } from "@/redux/user/schedule";
import LoginLight from "@litespace/assets/login-light.svg";
import LoginDark from "@litespace/assets/login-dark.svg";
import GoogleAuth from "@/components/Common/GoogleAuth";
import { useLoginUser } from "@litespace/headless/user";
import { useRender } from "@/hooks/render";
import ForgetPassword from "@/components/Common/ForgetPassword";

interface IForm {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const intl = useFormatMessage();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<IForm>({
    defaultValues: {
      email: "student@litespace.org",
      password: "LiteSpace432%^&",
    },
  });

  const email = watch("email");
  const password = watch("password");

  const forgetPassword = useRender();

  const onSuccess = useCallback(() => {
    return navigate(Route.Root);
  }, []);
  const onError = useCallback((error: Error) => {
    toaster.error({
      title: intl("page.login.failed"),
      description: error instanceof Error ? error.message : undefined,
    });
  }, []);

  const dispatchFn = (profile: IUser.LoginApiResponse) => {
    dispatch(setUserProfile(profile));
    dispatch(resetTutorMeta());
    dispatch(resetUserRules());
  };

  const mutation = useLoginUser({ dispatchFn, onSuccess, onError });

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
                  <Controller.Input
                    control={control}
                    name="password"
                    type={InputType.Password}
                    autoComplete="off"
                    value={password}
                    error={errors["password"]?.message}
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
              type={ButtonType.Secondary}
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
