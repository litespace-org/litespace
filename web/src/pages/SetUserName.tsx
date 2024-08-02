import { useAppDispatch, useAppSelector } from "@/redux/store";
import { findMe, profileSelector } from "@/redux/user/me";
import { Route } from "@/types/routes";
import { Button, Form, Input, messages, useValidation } from "@litespace/uilib";
import React, { useCallback, useEffect } from "react";
import { useIntl } from "react-intl";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";
import { SubmitHandler } from "react-hook-form";
import { atlas } from "@/lib/atlas";

type IFormFields = {
  name: string;
};

const SetUserName: React.FC = () => {
  const intl = useIntl();
  const valiedation = useValidation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const profile = useAppSelector(profileSelector);
  const mutation = useMutation(
    async (name: string) => atlas.user.update(1, { name }),
    {
      async onSuccess() {
        await dispatch(findMe());
        await navigate(Route.SelectUserType);
      },
    }
  );

  const onSubmit: SubmitHandler<IFormFields> = useCallback(
    ({ name }) => mutation.mutate(name),
    [mutation]
  );

  useEffect(() => {
    if (profile && profile.name) return navigate(Route.SelectUserType);
  }, [navigate, profile]);

  return (
    <div className="max-w-screen-md mx-auto flex flex-col items-center justify-center min-h-screen gap-10">
      <Form<IFormFields> onSubmit={onSubmit} className="w-full">
        <div className="flex flex-col gap-5 min-w-screen-sm">
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
          <Button type="submit">next</Button>
        </div>
      </Form>
    </div>
  );
};

export default SetUserName;
