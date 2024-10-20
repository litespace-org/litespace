import { useCreateUser } from "@litespace/headless/users";
import {
  Button,
  ButtonSize,
  Controller,
  Dialog,
  Field,
  Form,
  Label,
  toaster,
  useFormatMessage,
  useValidateEmail,
  useValidatePassword,
} from "@litespace/luna";
import { IUser, Void } from "@litespace/types";
import React, { useCallback } from "react";
import { useForm } from "react-hook-form";

type IForm = {
  email: string;
  password: string;
  role: IUser.Role;
};

const UserForm: React.FC<{
  open: boolean;
  close: Void;
  refresh: Void;
  user?: IUser.Self;
}> = ({ open, close, refresh }) => {
  const intl = useFormatMessage();
  const form = useForm<IForm>({
    defaultValues: { email: "", password: "", role: IUser.Role.RegularAdmin },
  });

  const onClose = useCallback(() => {
    form.reset();
    close();
  }, [close, form]);

  const onSuccess = useCallback(() => {
    toaster.success({
      title: intl("dashboard.user.form.create.success"),
    });
    refresh();
    onClose();
  }, [intl, onClose, refresh]);

  const onError = useCallback(
    (error: Error) => {
      toaster.error({
        title: intl("dashboard.user.form.create.error"),
        description: error.message,
      });
    },
    [intl]
  );

  const emailRules = useValidateEmail(true);
  const passwordRules = useValidatePassword(true);
  const createUser = useCreateUser({ onSuccess, onError });

  const onSubmit = useCallback(
    (data: IForm) => {
      createUser.mutate({
        ...data,
        callbackUrl: "http://localhost:5173/verify-email",
      });
    },
    [createUser]
  );

  return (
    <Dialog
      open={open}
      close={onClose}
      title={intl("dashboard.user.form.create")}
    >
      <Form
        onSubmit={form.handleSubmit(onSubmit)}
        className="min-w-96 max-h-[32rem] flex flex-col gap-4"
      >
        <Field
          label={<Label>{intl("dashboard.user.email")}</Label>}
          field={
            <Controller.Input
              control={form.control}
              name="email"
              value={form.watch("email")}
              rules={emailRules}
            />
          }
        />
        <Field
          label={<Label>{intl("dashboard.user.password")}</Label>}
          field={
            <Controller.Input
              control={form.control}
              name="password"
              value={form.watch("password")}
              rules={passwordRules}
            />
          }
        />
        <Field
          label={<Label>{intl("dashboard.user.role")}</Label>}
          field={
            <Controller.Select
              options={[
                {
                  label: intl("global.role.super-admin"),
                  value: IUser.Role.SuperAdmin,
                },
                {
                  label: intl("global.role.regular-admin"),
                  value: IUser.Role.RegularAdmin,
                },
                {
                  label: intl("global.role.media-provider"),
                  value: IUser.Role.MediaProvider,
                },
                {
                  label: intl("global.role.interviewer"),
                  value: IUser.Role.Interviewer,
                },
              ]}
              control={form.control}
              name="role"
              value={form.watch("role")}
            />
          }
        />
        <Button
          disabled={createUser.isPending}
          loading={createUser.isPending}
          size={ButtonSize.Small}
        >
          {intl("labels.create")}
        </Button>
      </Form>
    </Dialog>
  );
};

export default UserForm;
