import {
  Controller,
  Dialog,
  Field,
  Label,
  toaster,
  Form,
  useFormatMessage,
  Button,
  ButtonType,
  ButtonSize,
} from "@litespace/luna";
import { IUser, Void } from "@litespace/types";
import { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useForgetPassword } from "@litespace/headless/auth";

type ForgetPasswordProps = {
  open: boolean;
  close: Void;
};

interface IForm {
  email: string;
  callbackUrl: string;
}

const ForgetPassword = ({ open, close }: ForgetPasswordProps) => {
  const intl = useFormatMessage();

  const { control, watch, formState, handleSubmit, reset } = useForm<IForm>({
    mode: "onSubmit",
    defaultValues: {
      callbackUrl: "http:/localhost:5173/reset-password",
      email: "",
    },
  });

  const email = watch("email");

  const onSuccess = useCallback(() => {
    toaster.success({ title: intl("page.login.forget.password.success") });
    reset();
    close();
  }, []);

  const onError = useCallback((error: Error) => {
    toaster.error({
      title: intl("error.unexpected"),
      description: error.message,
    });
  }, []);

  const mutation = useForgetPassword({
    onSuccess,
    onError,
  });

  const onSubmit = useMemo(
    () =>
      handleSubmit(
        async (forgetPasswordCredentials: IUser.ForegetPasswordApiPayload) => {
          await mutation.mutateAsync(forgetPasswordCredentials);
        }
      ),
    []
  );

  return (
    <Dialog
      className="sm:w-1/3"
      title={intl("page.login.forget.password.title")}
      open={open}
      close={close}
    >
      <Form
        onSubmit={onSubmit}
        className="flex flex-col items-center justify-center gap-4"
      >
        <Field
          label={<Label id="email-forgotten">{intl("labels.email")}</Label>}
          field={
            <Controller.Input
              required={true}
              value={email}
              id="email-forgotten"
              control={control}
              placeholder={intl("labels.email.placeholder")}
              autoComplete="off"
              error={formState.errors["email"]?.message}
              disabled={mutation.isPending}
              name="email"
            />
          }
        />
        <Button
          type={ButtonType.Primary}
          size={ButtonSize.Small}
          disabled={mutation.isPending}
          loading={mutation.isPending}
        >
          {intl("page.login.forget.password.button.submit")}
        </Button>
      </Form>
    </Dialog>
  );
};

export default ForgetPassword;
