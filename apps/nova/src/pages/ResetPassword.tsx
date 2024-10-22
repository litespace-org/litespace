import {
  Button,
  ButtonSize,
  ButtonType,
  Controller,
  Field,
  InputType,
  Label,
  toaster,
  useFormatMessage,
  useRequired,
  useValidatePassword,
} from "@litespace/luna";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useResetPassword } from "@litespace/headless/auth";
import { Form, useNavigate, useSearchParams } from "react-router-dom";
import { Route } from "@/types/routes";
import { IUser } from "@litespace/types";
import { useAppDispatch } from "@/redux/store";
import { setUserProfile } from "@/redux/user/profile";
import { resetTutorMeta } from "@/redux/user/tutor";
import { resetUserRules } from "@/redux/user/schedule";

interface IForm {
  password: string;
  newPassword: string;
}

const ResetPassword = () => {
  const intl = useFormatMessage();
  const navigate = useNavigate();
  const passwordRules = useValidatePassword();
  const required = useRequired();

  const [searchParams, setSearchParams] = useSearchParams();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (token) return;
    const searchParamToken = searchParams.get("token");
    if (!searchParamToken) return navigate(Route.Root);
    setToken(searchParamToken);
    setSearchParams({});
  }, []);

  const { control, watch, formState, handleSubmit } = useForm<IForm>({
    mode: "onSubmit",
    defaultValues: {
      password: "",
      newPassword: "",
    },
  });
  const dispatch = useAppDispatch();

  const password = watch("password");
  const newPassword = watch("newPassword");

  const onSuccess = useCallback((profile: IUser.ResetPasswordApiResponse) => {
    toaster.success({ title: intl("page.login.forget.password.compelete") });
    dispatch(setUserProfile(profile));
    dispatch(resetTutorMeta());
    dispatch(resetUserRules());
    return navigate(Route.Root);
  }, []);

  const onError = useCallback((error: Error) => {
    toaster.error({
      title: intl("error.unexpected"),
      description: error.message,
    });
  }, []);

  const mutation = useResetPassword({ onSuccess, onError });

  const onSubmit = useMemo(() => {
    return handleSubmit(() => {
      if (password !== newPassword || !token) return;
      mutation.mutate({ token, password });
    });
  }, [password, newPassword]);

  return (
    <div className="flex items-center justify-center p-10">
      <Form
        onSubmit={onSubmit}
        className="flex flex-col items-center justify-center w-1/2 gap-4 mx-auto"
      >
        <Field
          label={<Label id="new-password">{intl("labels.new.password")}</Label>}
          field={
            <Controller.Input
              required={true}
              disabled={mutation.isPending}
              type={InputType.Password}
              value={password}
              id="new-password"
              control={control}
              rules={passwordRules}
              placeholder={intl("labels.password")}
              autoComplete="off"
              error={formState.errors["password"]?.message}
              name="password"
            />
          }
        />
        <Field
          label={
            <Label id="repeat-new-password">
              {intl("labels.repeat.new.password")}
            </Label>
          }
          field={
            <Controller.Input
              disabled={mutation.isPending}
              required={true}
              type={InputType.Password}
              value={newPassword}
              rules={{
                required,
                validate(value, formData) {
                  if (!value || value !== formData.password)
                    return intl("page.login.forget.password.mismatch");
                  return true;
                },
              }}
              id="repeat-new-password"
              control={control}
              placeholder={intl("labels.new.password")}
              autoComplete="off"
              error={formState.errors["newPassword"]?.message}
              name="newPassword"
            />
          }
        />
        <Button
          disabled={mutation.isPending}
          loading={mutation.isPending}
          type={ButtonType.Primary}
          size={ButtonSize.Small}
        >
          {intl("page.login.forget.password.button.submit")}
        </Button>
      </Form>
    </div>
  );
};

export default ResetPassword;
