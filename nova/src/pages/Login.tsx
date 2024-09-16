import {
  Input,
  Form,
  Label,
  Field,
  Button,
  messages,
  useValidation,
  InputType,
  toaster,
} from "@litespace/luna";
import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Route } from "@/types/routes";
import { atlas } from "@/lib/atlas";
import { IUser } from "@litespace/types";
import { useAppDispatch } from "@/redux/store";
import { setUserProfile } from "@/redux/user/me";

interface IForm {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const validation = useValidation();
  const {
    register,
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

  const mutation = useMutation(
    async (credentials: IUser.Credentials) => {
      const profile = await atlas.auth.password(credentials);
      dispatch(setUserProfile(profile));
    },
    {
      onSuccess() {
        return navigate(Route.Root);
      },
      onError(error) {
        toaster.error({
          title: intl.formatMessage({ id: messages["page.login.failed"] }),
          description: error instanceof Error ? error.message : undefined,
        });
      },
    }
  );

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
      <main className="flex flex-col items-center text-right flex-1 flex-shrink-0 px-5 pt-16 pb-8 border-l shadow-lg bg-studio border-border">
        <div className="flex-1 flex flex-col justify-center w-[330px] sm:w-[384px]">
          <div className="mb-4">
            <h1 className="text-3xl font-simi-bold text-right">
              <FormattedMessage id={messages["page.login.form.title"]} />
            </h1>
          </div>

          <Form onSubmit={onSubmit}>
            <div className="flex flex-col gap-4">
              <Field
                label={
                  <Label id="email">
                    {intl.formatMessage({
                      id: messages["global.form.email.label"],
                    })}
                  </Label>
                }
                field={
                  <Input
                    value={email}
                    register={register("email", validation.email)}
                    placeholder={intl.formatMessage({
                      id: messages["global.form.email.placeholder"],
                    })}
                    autoComplete="off"
                    error={errors["email"]?.message}
                    disabled={mutation.isLoading}
                  />
                }
              />

              <Field
                label={
                  <Label id="password">
                    {intl.formatMessage({
                      id: messages["global.form.password.label"],
                    })}
                  </Label>
                }
                field={
                  <Input
                    type={InputType.Password}
                    autoComplete="off"
                    value={password}
                    register={register("password", validation.password)}
                    error={errors["password"]?.message}
                    disabled={mutation.isLoading}
                  />
                }
              />

              <Button loading={mutation.isLoading}>
                {intl.formatMessage({
                  id: messages["page.login.form.button.submit.label"],
                })}
              </Button>
            </div>
          </Form>
        </div>
      </main>
      <aside className="flex-col items-center justify-center flex-1 flex-shrink hidden basis-1/4 xl:flex bg-alternative">
        <div className="flex flex-col gap-4 items-center justify-center">
          <p className="text-4xl">LiteSpace</p>
          <p className="text-lg">
            {intl.formatMessage({ id: messages["page.login.slogan"] })}
          </p>
        </div>
      </aside>
    </div>
  );
};

export default Login;
