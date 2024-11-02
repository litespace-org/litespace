import {
  Form,
  Label,
  Field,
  Controller,
} from "@litespace/luna/components/Form";
import { Button, ButtonSize } from "@litespace/luna/components/Button";
import { toaster } from "@litespace/luna/components/Toast";
import { InputType } from "@litespace/luna/components/Input";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { atlas } from "@litespace/luna/lib";

import React, { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Route } from "@/lib/route";
import { IUser } from "@litespace/types";
import { useAppDispatch } from "@/redux/store";
import { setUserProfile } from "@/redux/user/profile";

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
      email: "admin@litespace.org",
      password: "LiteSpace432%^&",
    },
  });

  const email = watch("email");
  const password = watch("password");

  const login = useCallback(
    async (credentials: IUser.Credentials) => {
      const profile = await atlas.auth.password(credentials);
      dispatch(setUserProfile(profile));
    },
    [dispatch]
  );

  const mutation = useMutation({
    mutationFn: login,
    onSuccess() {
      return navigate(Route.Root);
    },
    onError(error) {
      toaster.error({
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
                    error={errors["password"]?.message}
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
