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
} from "@litespace/luna";
import { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useResetPassword } from "@litespace/headless/auth";
import { Form, useNavigate, useSearchParams } from "react-router-dom";
import { Route } from "@/types/routes";

interface IForm {
  password: string;
  newPassword: string;
}

const ResetPassword = () => {
  const intl = useFormatMessage();
  const navigate = useNavigate();
  const params = useSearchParams();
  const token = params[0].get("token");

  useEffect(() => {
    if (!token) return navigate(Route.Login);
  }, []);

  const { control, watch, formState, handleSubmit } = useForm<IForm>({
    mode: "onSubmit",
    defaultValues: {
      password: "",
      newPassword: "",
    },
  });

  const password = watch("password");
  const newPassword = watch("newPassword");

  const onSuccess = useCallback(() => {
    toaster.success({ title: intl("page.login.forget.password.compelete") });
    navigate("/login");
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
      if (password !== newPassword) {
        return toaster.error({ title: intl("error.passowrd.unequal") });
      }
      if (token && password.trim() !== "") {
        mutation.mutate({ token, password });
      }
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
