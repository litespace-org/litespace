import { useCreateUser } from "@litespace/headless/users";
import { Button } from "@litespace/ui/Button";
import { Controller, Form } from "@litespace/ui/Form";
import { Dialog } from "@litespace/ui/Dialog";
import { useToast } from "@litespace/ui/Toast";
import { useRender } from "@litespace/headless/common";
import {
  useValidateEmail,
  useValidatePassword,
} from "@litespace/ui/hooks/validation";
import { useFormatMessage } from "@litespace/ui/hooks/intl";

import { IUser, Void } from "@litespace/types";
import React, { useCallback } from "react";
import { useForm } from "react-hook-form";
import { Typography } from "@litespace/ui/Typography";

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
  const errors = form.formState.errors;

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

  const validateEmail = useValidateEmail(true);
  const validatePassword = useValidatePassword();
  const createUser = useCreateUser({ onSuccess, onError });

  const onSubmit = useCallback(
    (data: IForm) => {
      createUser.mutate(data);
    },
    [createUser]
  );

  return (
    <React.Fragment>
      <Button onClick={render.show} size={"medium"}>
        {intl("dashboard.users.create")}
      </Button>

      <Dialog
        setOpen={render.setOpen}
        open={render.open}
        close={onClose}
        title={
          <Typography tag="p" className="font-bold text-subtitle-2">
            {intl("dashboard.user.form.create")}
          </Typography>
        }
      >
        <Form
          onSubmit={form.handleSubmit(onSubmit)}
          className="min-w-96 max-h-[32rem] flex flex-col gap-4 mt-4"
        >
          <Controller.Input
            id="email"
            control={form.control}
            name="email"
            value={form.watch("email")}
            rules={{ validate: validateEmail }}
            state={errors.email ? "error" : undefined}
            helper={errors.email?.message}
            label={intl("dashboard.user.email")}
          />

          <Controller.Password
            id="password"
            control={form.control}
            name="password"
            value={form.watch("password")}
            rules={{ validate: validatePassword }}
            label={intl("dashboard.user.password")}
            state={errors.password ? "error" : undefined}
            helper={errors.password?.message}
          />

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
                label: intl("global.role.studio"),
                value: IUser.Role.Studio,
              },
              {
                label: intl("global.role.tutor-manager"),
                value: IUser.Role.TutorManager,
              },
              {
                label: intl("global.role.tutor"),
                value: IUser.Role.Tutor,
              },
            ]}
            control={form.control}
            value={form.watch("role")}
            name="role"
            label={intl("dashboard.user.role")}
          />

          <Button
            disabled={createUser.isPending}
            loading={createUser.isPending}
            size="medium"
          >
            {intl("labels.create")}
          </Button>
        </Form>
      </Dialog>
    </React.Fragment>
  );
};

export default UserForm;
