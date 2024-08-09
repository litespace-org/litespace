import {
  Input,
  Form,
  Label,
  Field,
  Button,
  messages,
  Google,
  Discord,
  Facebook,
  useValidation,
  InputType,
} from "@litespace/luna";
import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import { useMutation } from "react-query";
import { Link, useNavigate } from "react-router-dom";
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
    <div className="max-w-screen-sm mx-auto my-10">
      <div className="mb-4">
        <h1 className="text-3xl font-simi-bold text-center">
          <FormattedMessage id={messages["page.login.form.title"]} />
        </h1>
      </div>

      <Form onSubmit={onSubmit}>
        <div className="flex flex-col gap-5">
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
                placeholder={intl.formatMessage({
                  id: messages["global.form.password.placeholder"],
                })}
                error={errors["password"]?.message}
              />
            }
          />

          <Button type="submit">
            {intl.formatMessage({
              id: messages["page.login.form.button.submit.label"],
            })}
          </Button>
        </div>

        <div className="w-full h-0.5 bg-gray-100 rounded-full" />
      </Form>
      <div className="flex flex-row items-center justify-center gap-5 my-5">
        <Link to={atlas.auth.authorization.google}>
          <Button>
            <Google width={40} height={40} className="fill-indigo-500" />
          </Button>
        </Link>

        <Link to={atlas.auth.authorization.facebook}>
          <Button>
            <Facebook width={40} height={40} className="fill-indigo-500" />
          </Button>
        </Link>

        <Link to={atlas.auth.authorization.discord}>
          <Button>
            <Discord width={40} height={40} className="fill-indigo-500" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Login;
