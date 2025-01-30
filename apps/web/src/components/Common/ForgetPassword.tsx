import {
  Button,
  ButtonSize,
  ButtonType,
  ButtonVariant,
} from "@litespace/ui/Button";
import { Form, Label, Field, Controller } from "@litespace/ui/Form";
import { Dialog } from "@litespace/ui/Dialog";
import { useToast } from "@litespace/ui/Toast";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
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
  const toast = useToast();

  const { control, watch, formState, handleSubmit, reset } = useForm<IForm>({
    mode: "onSubmit",
    defaultValues: {
      email: "",
    },
  });

  const email = watch("email");

  const onSuccess = useCallback(() => {
    toast.success({ title: intl("page.login.forget.password.success") });
    reset();
    close();
  }, [close, intl, reset, toast]);

  const onError = useCallback(
    (error: Error) => {
      toast.error({
        title: intl("error.unexpected"),
        description: error.message,
      });
    },
    [intl, toast]
  );

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
    [handleSubmit, mutation]
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
              state={formState.errors.email?.message ? "error" : "success"}
              helper={formState.errors.email?.message}
              disabled={mutation.isPending}
              name="email"
            />
          }
        />
        <Button
          type={ButtonType.Main}
          variant={ButtonVariant.Primary}
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
