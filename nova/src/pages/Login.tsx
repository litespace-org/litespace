import {
  Input,
  Form,
  Button,
  messages,
  Google,
  Discord,
  Facebook,
  useValidation,
} from "@litespace/luna";
import React, { useCallback } from "react";
import { SubmitHandler } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import { useMutation } from "react-query";
import { Link, useNavigate } from "react-router-dom";
import { Route } from "@/types/routes";
import { atlas } from "@/lib/atlas";
import { IUser } from "@litespace/types";

interface IFormInput {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const mutation = useMutation(
    (credentials: IUser.Credentials) => atlas.auth.password(credentials),
    {
      onSuccess() {
        return navigate(Route.Root);
      },
    }
  );

  const onSubmit: SubmitHandler<IFormInput> = useCallback(
    async (data) => mutation.mutate(data),
    [mutation]
  );
  const valiedation = useValidation();

  return (
    <div className="max-w-screen-sm mx-auto my-10">
      <div className="mb-4">
        <h1 className="text-3xl font-simi-bold text-center">
          <FormattedMessage id={messages.pages.login.form.title} />
        </h1>
      </div>

      <Form<IFormInput> onSubmit={onSubmit}>
        <div className="flex flex-col gap-5">
          <Input
            type="text"
            label={intl.formatMessage({
              id: messages.global.form.email.label,
            })}
            id="email"
            placeholder={intl.formatMessage({
              id: messages.global.form.email.placeholder,
            })}
            autoComplete="username"
            validation={valiedation.email}
          />
          <Input
            type="password"
            label={intl.formatMessage({
              id: messages.global.form.password.label,
            })}
            id="password"
            autoComplete="current-password"
            validation={valiedation.password}
          />

          <div className="flex items-center justify-center my-5">
            <Button type="submit">
              {intl.formatMessage({
                id: messages.pages.login.form.button.label,
              })}
            </Button>
          </div>
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
