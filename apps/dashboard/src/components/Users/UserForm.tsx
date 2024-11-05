import { useCreateUser } from "@litespace/headless/users";
import { Button, ButtonSize } from "@litespace/luna/Button";
import { Controller, Field, Form, Label } from "@litespace/luna/Form";
import { Dialog } from "@litespace/luna/Dialog";
import { useToast } from "@litespace/luna/Toast";
import { useRender } from "@litespace/luna/hooks/common";
import {
  useValidateEmail,
  useValidatePassword,
} from "@litespace/luna/hooks/validation";
import { useFormatMessage } from "@litespace/luna/hooks/intl";

import { IUser, Void } from "@litespace/types";
import React, { useCallback } from "react";
import { useForm } from "react-hook-form";
import { InputType } from "@litespace/luna/Input";

type IForm = {
  email: string;
  password: string;
  role: IUser.Role;
};

const UserForm: React.FC<{
  user?: IUser.Self;
  refresh: Void;
}> = ({ refresh }) => {
  const render = useRender();
  const intl = useFormatMessage();
  const toast = useToast();
  const form = useForm<IForm>({
    defaultValues: { email: "", password: "", role: IUser.Role.RegularAdmin },
  });

  const onClose = useCallback(() => {
    form.reset();
    render.hide();
  }, [form, render]);

  const onSuccess = useCallback(() => {
    toast.success({
      title: intl("dashboard.user.form.create.success"),
    });
    refresh();
    onClose();
  }, [intl, onClose, refresh, toast]);

  const onError = useCallback(
    (error: Error) => {
      toast.error({
        title: intl("dashboard.user.form.create.error"),
        description: error.message,
      });
    },
    [intl, toast]
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
    <React.Fragment>
      <Button onClick={render.show} size={ButtonSize.Small}>
        {intl("dashboard.users.create")}
      </Button>

      <Dialog
        setOpen={render.setOpen}
        open={render.open}
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
                type={InputType.Password}
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
                value={form.watch("role")}
                name="role"
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
    </React.Fragment>
  );
};

export default UserForm;
