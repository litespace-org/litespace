import {
  Input,
  Form,
  Button,
  messages,
  Google,
  Discord,
  Facebook,
  useValidation,
} from "@litespace/uilib";
import React, { useCallback } from "react";
import { SubmitHandler } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import { useMutation } from "react-query";
import { auth, user } from "@/api";
import { Link, useParams } from "react-router-dom";
import { endpoints } from "@/api/url";
import { User } from "@/types";
import { useAppDispatch } from "@/redux/store";
import { findMe } from "@/redux/user/me";

interface IFormInput {
  name: string;
  email: string;
  password: string;
}

// todos:
// 1. add storybook for the components lib - 1 (done)
// 2. move icons/locals to the components lib - 2 (done)
// 3. add login page - 5
// 4. login & logout - 6
// 5. arabic errors (form) - 3 (done)
// 6. arabic backend errors (error parsing) - 4

const Register: React.FC = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { type } = useParams<{ type: User.Type.Student | User.Type.Tutor }>();

  const mutation = useMutation(user.register, {
    async onSuccess({ token }) {
      await auth.token(token);
      await dispatch(findMe());
    },
  });

  const onSubmit: SubmitHandler<IFormInput> = useCallback(
    async (data) => {
      if (!type) return;
      if (![User.Type.Student, User.Type.Tutor].includes(type)) return;

      await mutation.mutate({
        ...data,
        type,
      });
    },
    [mutation, type]
  );
  const valiedation = useValidation();

  return (
    <div className="max-w-screen-sm mx-auto my-10">
      <div className="mb-4">
        <h1 className="text-3xl font-simi-bold text-center">
          <FormattedMessage id={messages.pages.register.form.title} />
        </h1>
      </div>

      <Form<IFormInput> onSubmit={onSubmit}>
        <div className="flex flex-col gap-5">
          <Input
            type="text"
            label={intl.formatMessage({
              id: messages.pages.register.form.name.label,
            })}
            id="name"
            placeholder={intl.formatMessage({
              id: messages.pages.register.form.name.placeholder,
            })}
            autoComplete="name"
            validation={valiedation.name}
          />
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
                id: messages.pages.register.form.button.label,
              })}
            </Button>
          </div>
        </div>
      </Form>
      <div className="w-full h-0.5 bg-gray-100 rounded-full" />
      <div className="flex flex-row items-center justify-center gap-5 my-5">
        <Link to={endpoints.authorization.google}>
          <Button>
            <Google width={40} height={40} className="fill-indigo-500" />
          </Button>
        </Link>

        <Link to={endpoints.authorization.facebook}>
          <Button>
            <Facebook width={40} height={40} className="fill-indigo-500" />
          </Button>
        </Link>

        <Link to={endpoints.authorization.discord}>
          <Button>
            <Discord width={40} height={40} className="fill-indigo-500" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Register;
