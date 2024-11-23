import { Label } from "@litespace/luna/Form";
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
  const form = useForm<IForm>({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
    },
  });
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
          {intl("settings.edit.personal.title")}
        </Typography>
        <div>
          <Label>{intl("settings.edit.personal.name")}</Label>
          <Controller.Input
            placeholder={intl("settings.edit.personal.name.placeholder")}
            value={form.watch("name")}
            control={form.control}
            rules={nameRules}
            autoComplete="off"
            name="name"
          />
        </div>
        <div>
          <Label>{intl("settings.edit.personal.email")}</Label>
          <Controller.Input
            control={form.control}
            name="email"
            value={form.watch("email")}
            placeholder={intl("settings.edit.personal.email.placeholder")}
            autoComplete="off"
            defaultDir="ltr"
            rules={emailRules}
          />
        </div>
        <div>
          <Label>{intl("settings.edit.personal.phone-number")}</Label>
          <Controller.PatternInput
            format="01# #### ####"
            placeholder={intl(
              "settings.edit.personal.phone-number.placeholder"
            )}
            value={form.watch("phoneNumber")}
            control={form.control}
            name="phoneNumber"
            autoComplete="off"
            allowEmptyFormatting
            mask="#"
          />
        </div>
      </div>
      {children}
    </Form>
  );
};

export default Personal;
