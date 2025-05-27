import { useOnError } from "@/hooks/error";
import { QueryKey } from "@litespace/headless/constants";
import { useForm } from "@litespace/headless/form";
import { useInvalidateQuery } from "@litespace/headless/query";
import { useUpdateUser } from "@litespace/headless/user";
import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useMakeValidators } from "@litespace/ui/hooks/validation";
import { Password } from "@litespace/ui/Input";
import { validatePassword } from "@litespace/ui/lib/validate";
import { useToast } from "@litespace/ui/Toast";
import { Typography } from "@litespace/ui/Typography";
import React, { useCallback } from "react";

type Form = {
  current: string;
  new: string;
  confirm: string;
};

const UpdatePassword: React.FC<{ id: number }> = ({ id }) => {
  const intl = useFormatMessage();
  const toast = useToast();
  const invalidateQuery = useInvalidateQuery();

  const validators = useMakeValidators<Form>({
    current: {
      required: true,
      validate: validatePassword,
    },
    new: {
      required: true,
      validate: validatePassword,
    },
    confirm: {
      required: true,
      validate: (value: string, state: Form) => {
        if (value !== state.new)
          return "shared-settings.edit.password.confirm.not-same";
        return null;
      },
    },
  });

  const form = useForm<Form>({
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
    toast.success({
      id: "password-updated",
      title: intl("shared-settings.edit.password-updated-successfully"),
    });
    form.reset();
    invalidateQuery([QueryKey.FindCurrentUser]);
  }, [toast, intl, form, invalidateQuery]);

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
    <div className="max-w-[400px] grow md:grow-0 flex flex-col">
      <Typography
        tag="h2"
        className="text-subtitle-1 font-bold text-natural-950 mb-4 md:mb-6"
      >
        {intl("student-settings.password.title")}
      </Typography>
      <form onSubmit={form.onSubmit} className="w-full flex flex-col gap-4">
        <Password
          required
          name="current"
          id="current"
          value={form.state.current}
          onChange={(e) => form.set("current", e.target.value)}
          autoComplete="false"
          label={intl("shared-settings.edit.password.current")}
          placeholder={intl("labels.password.placeholder-stars")}
          state={form.errors?.current ? "error" : undefined}
          helper={form.errors?.current}
        />

        <Password
          id="new"
          name="new"
          required
          value={form.state.new}
          onChange={(e) => form.set("new", e.target.value)}
          autoComplete="false"
          label={intl("shared-settings.edit.password.new")}
          placeholder={intl("labels.password.placeholder-stars")}
          state={form.errors?.new ? "error" : undefined}
          helper={form.errors?.new}
        />

        <Password
          id="confirm"
          name="confirm"
          autoComplete="off"
          value={form.state.confirm}
          onChange={(e) => form.set("confirm", e.target.value)}
          label={intl("shared-settings.edit.password.confirm")}
          placeholder={intl("labels.password.placeholder-stars")}
          state={form.errors?.confirm ? "error" : undefined}
          helper={form.errors?.confirm}
        />
      </form>
      <Button
        size="large"
        disabled={mutation.isPending}
        onClick={form.submit}
        className="mt-6"
      >
        {intl("shared-settings.save")}
      </Button>
    </div>
  );
};

export default UpdatePassword;
