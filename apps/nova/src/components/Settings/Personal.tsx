import { Field } from "@/components/Settings/Field";
import { useUpdateUser } from "@litespace/headless/user";
import { Controller, Form } from "@litespace/luna/Form";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import {
  useValidateEmail,
  useValidateUsername,
} from "@litespace/luna/hooks/validation";
import { useToast } from "@litespace/luna/Toast";
import { Typography } from "@litespace/luna/Typography";
import { IUser } from "@litespace/types";
import React, { useCallback } from "react";
import { useForm } from "react-hook-form";

type IForm = {
  name: string;
  email: string;
  phoneNumber: string;
};

export const Personal: React.FC<{
  user?: IUser.Self;
  children: React.ReactNode;
}> = ({ user, children }) => {
  const intl = useFormatMessage();
  const form = useForm<IForm>();
  const toast = useToast();
  const nameRules = useValidateUsername();
  const emailRules = useValidateEmail();

  const onSuccess = useCallback(() => {
    toast.success({ title: intl("profile.update.success") });
  }, [intl, toast]);

  const onError = useCallback(
    (error: Error) => {
      toast.error({
        title: intl("profile.update.error"),
        description: error.message,
      });
    },
    [intl, toast]
  );

  const mutation = useUpdateUser({ onSuccess, onError });

  const onSubmit = useCallback(
    (data: IForm) => {
      if (!user) return;
      mutation.mutate({ id: user.id, payload: data });
    },
    [mutation, user]
  );

  return (
    <Form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-6 max-w-[400px]">
        <Typography
          element="subtitle-1"
          weight="bold"
          className="text-natural-950"
        >
          {intl("settings.personal.title")}
        </Typography>
        <Field
          label={intl("labels.name")}
          field={
            <Controller.Input
              control={form.control}
              name="name"
              value={form.watch("name")}
              placeholder={
                user?.name ? user.name : intl("settings.placeholder.name")
              }
              rules={nameRules}
            />
          }
        />
        <Field
          label={intl("labels.email")}
          field={
            <Controller.Input
              control={form.control}
              name="email"
              value={form.watch("email")}
              placeholder={user?.email}
              rules={emailRules}
            />
          }
        />
        <Field
          label={intl("labels.phone")}
          field={
            <Controller.Input
              control={form.control}
              name="phoneNumber"
              value={form.watch("phoneNumber")}
              placeholder={
                user?.phoneNumber
                  ? user.phoneNumber
                  : intl("settings.placeholder.phone")
              }
            />
          }
        />
      </div>
      {children}
    </Form>
  );
};

export default Personal;
