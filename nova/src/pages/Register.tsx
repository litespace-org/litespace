import {
  Input,
  Form,
  Button,
  messages,
  Google,
  Discord,
  Facebook,
} from "@litespace/luna";
import React, { useCallback } from "react";
import { SubmitHandler } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import { useMutation } from "react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAppDispatch } from "@/redux/store";
import { findMe } from "@/redux/user/me";
import { Route } from "@/types/routes";
import {
  RegisterStudentPayload,
  RegisterTutorPayload,
  IUser,
} from "@litespace/types";
import { atlas } from "@/lib/atlas";

interface IFormInput {
  name: string;
  email: string;
  password: string;
}

const Register: React.FC = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { role } = useParams<{
    role: typeof IUser.Role.Student | typeof IUser.Role.Tutor;
  }>();

  const mutation = useMutation(
    async ({
      payload,
      role,
    }: {
      payload: RegisterTutorPayload | RegisterStudentPayload;
      role: IUser.TutorOrStudent;
    }) => {
      if (role === IUser.Role.Tutor) return await atlas.tutor.create(payload);
      return atlas.student.register(payload);
    },
    {
      async onSuccess({ token }) {
        await atlas.auth.token(token);
        await dispatch(findMe());
        navigate(Route.Root);
      },
    }
  );

  const onSubmit: SubmitHandler<IFormInput> = useCallback(
    async (payload) => {
      if (!role) return;
      if (![IUser.Role.Student, IUser.Role.Tutor].includes(role)) return;
      return await mutation.mutate({ payload, role });
    },
    [mutation, role]
  );

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
            label={intl.formatMessage({
              id: messages.pages.register.form.name.label,
            })}
            id="name"
            placeholder={intl.formatMessage({
              id: messages.pages.register.form.name.placeholder,
            })}
            autoComplete="name"
          />
          <Input
            label={intl.formatMessage({
              id: messages.global.form.email.label,
            })}
            id="email"
            placeholder={intl.formatMessage({
              id: messages.global.form.email.placeholder,
            })}
            autoComplete="username"
          />
          <Input
            label={intl.formatMessage({
              id: messages.global.form.password.label,
            })}
            id="password"
            autoComplete="current-password"
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

export default Register;
