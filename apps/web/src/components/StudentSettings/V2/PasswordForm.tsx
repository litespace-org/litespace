import { useOnError } from "@/hooks/error";
import { QueryKey } from "@litespace/headless/constants";
import { useForm } from "@litespace/headless/form";
import { useInvalidateQuery } from "@litespace/headless/query";
import { useUpdateUser } from "@litespace/headless/user";
import { Button } from "@litespace/ui/Button";
import { Form } from "@litespace/ui/Form";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useMakeValidators } from "@litespace/ui/hooks/validation";
import { Input } from "@litespace/ui/Input";
import { isValidPassword } from "@litespace/ui/lib/validate";
import { useToast } from "@litespace/ui/Toast";
import { orUndefined } from "@litespace/utils";
import { useCallback } from "react";

type FormProps = {
  current: string;
  new: string;
  confirm: string;
};

function canSubmit(formData: FormProps) {
  if (!formData.confirm || !formData.current || !formData.new) return false;
  return true;
}

export function PasswordForm({ id }: { id: number }) {
  const intl = useFormatMessage();
  const toast = useToast();
  const invalidateQuery = useInvalidateQuery();

  const validators = useMakeValidators<FormProps>({
    current: {
      required: true,
      validate: isValidPassword,
    },
    new: {
      required: true,
      validate: isValidPassword,
    },
    confirm: {
      required: true,
      validate: (value: string) => {
        if (value !== form.state.new)
          return "shared-settings.edit.password.confirm.not-same";
        return null;
      },
    },
  });

  const form = useForm<FormProps>({
    defaults: {
      current: "",
      new: "",
      confirm: "",
    },
    validators,
    onSubmit: (data) => {
      mutation.mutate({
        id,
        payload: {
          password: {
            current: data.current,
            new: data.new,
          },
        },
      });
      form.reset();
    },
  });

  const onSuccess = useCallback(() => {
    form.reset();
    invalidateQuery([QueryKey.FindCurrentUser]);
  }, [invalidateQuery, form]);

  const onError = useOnError({
    type: "mutation",
    handler: ({ messageId }) => {
      toast.error({
        title: intl("shared-settings.update.error"),
        description: intl(messageId),
      });
    },
  });
  const mutation = useUpdateUser({ onSuccess, onError });

  return (
    <div className="max-w-[400px]">
      <Form onSubmit={form.onFormSubmit} className="w-full flex flex-col gap-4">
        <Input
          required
          type="password"
          value={orUndefined(form.state.current)}
          onChange={(e) => form.set("current", e.target.value)}
          name="current"
          id="current"
          autoComplete="false"
          label={intl("shared-settings.edit.password.current")}
          placeholder={intl("labels.password.placeholder-stars")}
          state={form.errors?.current ? "error" : undefined}
          helper={form.errors?.current}
        />
        <Input
          type="password"
          required
          value={orUndefined(form.state.new)}
          onChange={(e) => form.set("new", e.target.value)}
          name="new"
          id="new"
          autoComplete="false"
          label={intl("shared-settings.edit.password.new")}
          placeholder={intl("labels.password.placeholder-stars")}
          state={form.errors?.new ? "error" : undefined}
          helper={form.errors?.new}
        />
        <Input
          type="password"
          autoComplete="false"
          required
          value={orUndefined(form.state.confirm)}
          onChange={(e) => form.set("confirm", e.target.value)}
          name="confirm"
          id="confirm"
          label={intl("shared-settings.edit.password.confirm")}
          placeholder={intl("labels.password.placeholder-stars")}
          state={form.errors?.confirm ? "error" : undefined}
          helper={form.errors?.confirm}
        />
      </Form>
      <Button
        size="large"
        disabled={mutation.isPending || !canSubmit(form.state)}
        onClick={form.submit}
        className="mt-10"
      >
        {intl("shared-settings.save")}
      </Button>
    </div>
  );
}
