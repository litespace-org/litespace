import { Button } from "@litespace/ui/Button";
import { Form, Controller } from "@litespace/ui/Form";
import { Dialog } from "@litespace/ui/Dialog";
import { useToast } from "@litespace/ui/Toast";
import { useWebFormatMessage } from "@/hooks/intl";
import { Void } from "@litespace/types";
import { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useForgetPassword } from "@litespace/headless/auth";
import { getErrorMessageId } from "@litespace/ui/errorMessage";
import { capture } from "@/lib/sentry";
import { Web } from "@litespace/utils/routes";

type ForgetPasswordProps = {
  open: boolean;
  close: Void;
};

interface IForm {
  email: string;
}
const origin = location.origin;
const callbackUrl = origin.concat(Web.ResetPassword);

const ForgetPassword = ({ open, close }: ForgetPasswordProps) => {
  const intl = useWebFormatMessage();
  const toast = useToast();

  const { control, watch, formState, handleSubmit, reset } = useForm<IForm>({
    mode: "onSubmit",
    defaultValues: {
      email: "",
    },
  });
  const errors = formState.errors;

  const email = watch("email");

  const onSuccess = useCallback(() => {
    toast.success({ title: intl("page.login.forget.password.success") });
    reset();
    close();
  }, [close, intl, reset, toast]);

  const onError = useCallback(
    (error: unknown) => {
      capture(error);
      const errorMessage = getErrorMessageId(error);
      toast.error({
        title: intl("forget-password.error"),
        description: intl(errorMessage),
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
      handleSubmit((data: IForm) => {
        mutation.mutate({ email: data.email, callbackUrl });
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
        <Controller.Input
          required={true}
          value={email}
          id="email-forgotten"
          control={control}
          placeholder={intl("labels.email.placeholder")}
          autoComplete="off"
          state={errors.email ? "error" : "success"}
          helper={errors.email?.message}
          label={intl("labels.email")}
          disabled={mutation.isPending}
          name="email"
        />

        <Button
          type={"main"}
          variant={"primary"}
          size={"medium"}
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
