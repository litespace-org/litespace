import { router } from "@/lib/route";
import AddCircle from "@litespace/assets/AddCircle";
import { useForm } from "@litespace/headless/form";
import { useInvalidateQuery } from "@litespace/headless/query";
import { useCreateUser } from "@litespace/headless/users";
import { IUser } from "@litespace/types";
import { Button } from "@litespace/ui/Button";
import { Dialog } from "@litespace/ui/Dialog";
import { Input, Password } from "@litespace/ui/Input";
import { useToast } from "@litespace/ui/Toast";
import { Typography } from "@litespace/ui/Typography";
import { useRender } from "@litespace/ui/hooks/common";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useMakeValidators } from "@litespace/ui/hooks/validation";
import { isValidEmail, isValidPassword } from "@litespace/ui/lib/validate";
import { Dashboard } from "@litespace/utils/routes";
import React, { useCallback, useMemo } from "react";

type IForm = {
  email: string;
  password: string;
};

export const AddTutorDialog: React.FC<{ queryKey: string[] }> = ({
  queryKey,
}) => {
  const intl = useFormatMessage();
  const toast = useToast();
  const render = useRender();
  const invalidate = useInvalidateQuery();

  const validators = useMakeValidators({
    email: {
      required: true,
      validate: isValidEmail,
    },
    password: {
      required: true,
      validate: isValidPassword,
    },
  });

  const form = useForm<IForm>({
    defaults: { email: "", password: "" },
    validators,
    onSubmit(data) {
      if (!isValidEmail(data.email) || !isValidPassword(data.password)) return;
      mutation.mutate({
        ...data,
        role: IUser.Role.Tutor,
        callbackUrl: router.dashboard({ route: Dashboard.Tutors, full: true }),
      });
    },
  });

  const onClose = useCallback(() => {
    form.reset();
    render.hide();
  }, [form, render]);

  const onSuccess = useCallback(() => {
    toast.success({
      title: intl("dashboard.tutor.form.create.success"),
    });
    onClose();
    invalidate(queryKey);
  }, [intl, invalidate, queryKey, onClose, toast]);

  const onError = useCallback(
    (error: Error) => {
      toast.error({
        title: intl("dashboard.tutor.form.create.error"),
        description: error.message,
      });
    },
    [intl, toast]
  );

  const mutation = useCreateUser({ onSuccess, onError });

  const isEmpty = useMemo(() => {
    if (!form.state.email || !form.state.password) return true;
    return false;
  }, [form.state.email, form.state.password]);

  return (
    <Dialog
      open={render.open}
      trigger={
        <Button
          onClick={() => render.show()}
          size="large"
          endIcon={
            <AddCircle className="w-4 h-4 [&>*]:stroke-natural-50 icon" />
          }
        >
          <Typography
            tag="span"
            className="text-body font-medium text-natural-50"
          >
            {intl("dashboard.tutors.add-tutor")}
          </Typography>
        </Button>
      }
      title={
        <div className="flex gap-2 items-center">
          <AddCircle className="w-6 h-6 [&>*]:stroke-natural-950" />
          <Typography
            tag="span"
            className="text-subtitle-2 font-bold text-natural-950"
          >
            {intl("dashboard.tutors.add-tutor")}
          </Typography>
        </div>
      }
      close={onClose}
      className="w-[512px]"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.submit();
        }}
      >
        <div className="py-6 flex flex-col gap-6">
          <Input
            autoFocus
            id="email"
            placeholder={intl("labels.email.placeholder")}
            label={intl("dashboard.tutor.form.email.label")}
            onChange={(e) => form.set("email", e.target.value)}
            state={form.errors?.email ? "error" : undefined}
            helper={form.errors?.email}
            idleDir="rtl"
            autoComplete="off"
            disabled={mutation.isPending}
            inputSize="large"
            value={form.state.email}
          />
          <Password
            id="password"
            idleDir="rtl"
            autoComplete="off"
            label={intl("labels.password")}
            placeholder={intl("labels.enter-password.placeholder")}
            onChange={(e) => form.set("password", e.target.value)}
            value={form.state.password}
            state={form.errors?.password ? "error" : undefined}
            helper={form.errors?.password}
            disabled={mutation.isPending}
          />
        </div>
        <div className="flex gap-6">
          <Button
            size="large"
            className="flex-1"
            htmlType="submit"
            loading={mutation.isPending}
            disabled={mutation.isPending || isEmpty}
          >
            <Typography
              tag="span"
              className="text-body font-medium text-natural-50"
            >
              {intl("dashboard.tutors.add-tutor")}
            </Typography>
          </Button>
          <Button
            htmlType="button"
            size="large"
            variant="secondary"
            className="flex-1"
            onClick={() => onClose()}
          >
            <Typography
              tag="span"
              className="text-body font-medium text-brand-700"
            >
              {intl("global.labels.cancel")}
            </Typography>
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default AddTutorDialog;
