import {
  Button,
  ButtonSize,
  ButtonType,
} from "@litespace/luna/components/Button";
import {
  Form,
  Label,
  Field,
  Controller,
} from "@litespace/luna/components/Form";
import { Dialog } from "@litespace/luna/components/Dialog";
import { toaster } from "@litespace/luna/components/Toast";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { Void } from "@litespace/types";
import { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useForgetPassword } from "@litespace/headless/auth";
import { Route } from "@/types/routes";

type ForgetPasswordProps = {
  open: boolean;
  close: Void;
};

interface IForm {
  email: string;
}
const origin = location.origin;
const callbackUrl = origin.concat(Route.ResetPassword);

const ForgetPassword = ({ open, close }: ForgetPasswordProps) => {
  const intl = useFormatMessage();

  const { control, watch, formState, handleSubmit, reset } = useForm<IForm>({
    mode: "onSubmit",
    defaultValues: {
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
      handleSubmit(async (data: IForm) => {
        await mutation.mutateAsync({
          email: data.email,
          callbackUrl,
        });
      }),
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
