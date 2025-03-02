import React, { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import cn from "classnames";
import { isEqual } from "lodash";
import UploadPhoto from "@/components/StudentSettings/UploadPhoto";
import TopicSelection from "@/components/StudentSettings/TopicSelection";
import { governorates } from "@/constants/user";
import NotificationSettings from "@/components/Common/NotificationSettings";
import { IUser } from "@litespace/types";
import {
  getNullableFiledUpdatedValue,
  getOptionalFieldUpdatedValue,
} from "@litespace/utils/utils";
import { Controller, Form } from "@litespace/ui/Form";
import { Typography } from "@litespace/ui/Typography";
import { getErrorMessageId } from "@litespace/ui/errorMessage";
import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import {
  useRequired,
  useValidateEmail,
  useValidatePassword,
  useValidatePhoneNumber,
  useValidateUserName,
} from "@litespace/ui/hooks/validation";
import { useToast } from "@litespace/ui/Toast";
import { useInvalidateQuery } from "@litespace/headless/query";
import { QueryKey } from "@litespace/headless/constants";
import { useUpdateUser } from "@litespace/headless/user";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import { capture } from "@/lib/sentry";
import { useSendVerifyEmail } from "@litespace/headless/auth";
import { VERIFY_EMAIL_CALLBACK_URL } from "@/lib/routes";

type IForm = {
  name: string;
  email: string;
  phoneNumber: string;
  password: {
    new: string;
    current: string;
    confirm: string;
  };
  city: IUser.City | null;
};

function canSubmit(formData: IForm, user: IUser.Self) {
  const initial = {
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber || "",
    password: { new: "", current: "", confirm: "" },
    city: user.city || null,
  };
  return !isEqual(formData, initial);
}

export const ProfileForm: React.FC<{
  user: IUser.Self;
}> = ({ user }) => {
  const mq = useMediaQuery();

  const intl = useFormatMessage();
  const toast = useToast();

  const form = useForm<IForm>({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
      password: {
        new: "",
        current: "",
        confirm: "",
      },
      city: user?.city || null,
    },
  });
  const errors = form.formState.errors;

  const invalidateQuery = useInvalidateQuery();
  const validateUserName = useValidateUserName();
  const validateEmail = useValidateEmail();
  const validatePhoneNumber = useValidatePhoneNumber();
  const validatePassword = useValidatePassword();

  const required = useRequired();
  const requirePassword =
    !!form.watch("password.new") ||
    !!form.watch("password.current") ||
    !!form.watch("password.confirm");

  const city = form.watch("city");
  const name = form.watch("name");
  const email = form.watch("email");
  const password = form.watch("password");
  const phoneNumber = form.watch("phoneNumber");

  const onSuccess = useCallback(() => {
    form.resetField("password");
    invalidateQuery([QueryKey.FindCurrentUser]);
  }, [form, invalidateQuery]);

  const onError = useCallback(
    (error: unknown) => {
      capture(error);
      const errorMessage = getErrorMessageId(error);
      toast.error({
        title: intl("shared-settings.update.error"),
        description: intl(errorMessage),
      });
    },
    [intl, toast]
  );

  const cityOptions = useMemo(
    () =>
      Object.entries(governorates).map(([key, value]) => ({
        label: intl(value),
        value: Number(key),
      })),
    [intl]
  );

  const updateUser = useUpdateUser({ onSuccess, onError });

  const onSubmit = useCallback(
    (data: IForm) => {
      if (!user || !canSubmit(data, user)) return;
      updateUser.mutate({
        id: user.id,
        payload: {
          name: getNullableFiledUpdatedValue(user.name, data.name),
          email: getOptionalFieldUpdatedValue(user.email, data.email),
          phoneNumber: getNullableFiledUpdatedValue(
            user.phoneNumber,
            data.phoneNumber
          ),
          password:
            data.password.new && data.password.current
              ? {
                  new: data.password.new,
                  current: data.password.current,
                }
              : undefined,
          city: getNullableFiledUpdatedValue(user.city, data.city),
        },
      });
    },
    [updateUser, user]
  );

  useEffect(() => {
    if (!requirePassword) {
      form.trigger("password.current");
      form.trigger("password.new");
      form.trigger("password.confirm");
    }
  }, [form, requirePassword]);

  return (
    <Form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col w-full"
    >
      <div className="flex items-start justify-between mb-6 sm:mb-8">
        <UploadPhoto id={user.id} />

        <div
          className={cn(
            "fixed sm:relative bottom-0 left-0 p-4 sm:p-0 flex gap-2 w-full sm:w-fit",
            "bg-natural-50 sm:bg-transparent shadow-student-profile z-10"
          )}
        >
          <SaveButton
            disabled={updateUser.isPending || !canSubmit(form.watch(), user)}
            loading={updateUser.isPending}
          />
        </div>
      </div>

      <div
        id="cols-wrapper"
        className="flex flex-col sm:flex-row sm:gap-10 lg:gap-28 pb-[72px] sm:pb-0 w-full"
      >
        <div
          id="first-col"
          className="flex flex-col flex-shrink-0 sm:max-w-[320px] lg:max-w-[400px]"
        >
          <Typography
            tag="h2"
            className="text-natural-950 text-subtitle-2 font-bold"
          >
            {intl("student-settings.edit.personal.title")}
          </Typography>

          <div className="grid gap-2 sm:gap-4 my-4 sm:my-6">
            <Controller.Input
              id="name"
              name="name"
              value={name}
              idleDir="rtl"
              autoComplete="off"
              control={form.control}
              rules={{ validate: validateUserName }}
              helper={errors.name?.message}
              state={errors.name ? "error" : undefined}
              label={intl("student-settings.edit.personal.name")}
              placeholder={intl(
                "student-settings.edit.personal.name.placeholder"
              )}
            />

            <Controller.Input
              id="email"
              idleDir="rtl"
              name="email"
              value={email}
              autoComplete="off"
              control={form.control}
              helper={errors.email?.message}
              rules={{ validate: validateEmail }}
              state={errors.email ? "error" : undefined}
              label={intl("student-settings.edit.personal.email")}
              placeholder={intl(
                "student-settings.edit.personal.email.placeholder"
              )}
            />

            <Controller.PatternInput
              mask=" "
              idleDir="rtl"
              id="phone-number"
              name="phoneNumber"
              autoComplete="off"
              value={phoneNumber}
              format="### #### ####"
              control={form.control}
              helper={errors.phoneNumber?.message}
              rules={{ validate: validatePhoneNumber }}
              state={errors.phoneNumber ? "error" : undefined}
              label={intl("student-settings.edit.personal.phone-number")}
              placeholder={intl(
                "student-settings.edit.personal.phone-number.placeholder"
              )}
            />

            <Controller.Select
              id="city"
              name="city"
              control={form.control}
              value={city || undefined}
              options={cityOptions}
              label={intl("student-settings.edit.personal.city")}
              placeholder={intl(
                "shared-settings.edit.personal.city.placeholder"
              )}
            />
          </div>

          {mq.sm ? <TopicSelection /> : null}
        </div>

        <div id="second-col" className="flex flex-col flex-1">
          <Typography
            tag="h2"
            className="text-natural-950 text-subtitle-2 font-bold"
          >
            {intl("shared-settings.edit.password.title")}
          </Typography>

          <div className="grid gap-2 sm:gap-4 my-4 sm:my-6 w-full md:max-w-[400px]">
            <Controller.Password
              id="current-password"
              value={password.current}
              control={form.control}
              rules={{
                required: requirePassword ? required : undefined,
                validate: validatePassword,
              }}
              name="password.current"
              label={intl("shared-settings.edit.password.current")}
              state={errors.password?.current ? "error" : undefined}
              helper={errors.password?.current?.message}
              idleDir="rtl"
              placeholder="********************"
            />

            <Controller.Password
              id="new-password"
              idleDir="rtl"
              value={password.new}
              control={form.control}
              rules={{
                required: requirePassword ? required : undefined,
                validate: validatePassword,
              }}
              name="password.new"
              label={intl("shared-settings.edit.password.new")}
              state={errors.password?.new ? "error" : undefined}
              helper={errors.password?.new?.message}
              placeholder="********************"
            />

            <Controller.Password
              id="confirm-password"
              idleDir="rtl"
              value={password.confirm}
              control={form.control}
              rules={{
                required: requirePassword ? required : undefined,
                validate: (value) => {
                  if (value !== form.watch("password.new"))
                    return intl(
                      "shared-settings.edit.password.confirm.not-same"
                    );
                  return validatePassword(value);
                },
              }}
              name="password.confirm"
              label={intl("shared-settings.edit.password.confirm")}
              state={errors.password?.confirm ? "error" : undefined}
              helper={errors.password?.confirm?.message}
              placeholder="********************"
            />
          </div>

          <div className="w-full flex flex-col sm:flex-col gap-6 mt-2 sm:my-0">
            <div className="lg:max-w-[640px] flex flex-col gap-6">
              <NotificationSettings />
              {!user.verified ? <ConfirmEmail /> : null}
            </div>
            {!mq.sm ? <TopicSelection /> : null}
          </div>
        </div>
      </div>
    </Form>
  );
};

const SaveButton: React.FC<{
  disabled: boolean;
  loading: boolean;
}> = ({ disabled, loading }) => {
  const intl = useFormatMessage();
  return (
    <Button
      disabled={disabled}
      loading={loading}
      size="large"
      className="w-fit sm:static sm:bottom-4 sm:left-4 mr-auto sm:mt-auto z-10"
      htmlType="submit"
    >
      <Typography
        tag="span"
        className="text-natural-50 text-caption lg:text-body font-medium"
      >
        {intl("shared-settings.save")}
      </Typography>
    </Button>
  );
};

const ConfirmEmail: React.FC = () => {
  const intl = useFormatMessage();
  const toast = useToast();
  const onSuccess = useCallback(() => {
    toast.success({
      title: intl("student-settings.confirm-email.success.title"),
      description: intl("student-settings.confirm-email.success.desc"),
    });
  }, [toast, intl]);

  const onError = useCallback(
    (error: unknown) => {
      capture(error);

      toast.error({
        title: intl("student-settings.confirm-email.error"),
        description: intl(getErrorMessageId(error)),
      });
    },
    [toast, intl]
  );

  const mutation = useSendVerifyEmail({ onSuccess, onError });

  return (
    <div className="flex flex-col gap-4">
      <Typography tag="h3" className="text-subtitle-2 font-bold">
        {intl("student-settings.confirm-email.title")}
      </Typography>
      <div className="flex flex-col lg:flex-row gap-4 items-start justify-between">
        <Typography tag="p" className="text-body max-w-[410px]">
          {intl("student-settings.confirm-email.desc")}
        </Typography>
        <Button
          onClick={() => mutation.mutate(VERIFY_EMAIL_CALLBACK_URL)}
          loading={mutation.isPending}
          disabled={mutation.isPending}
          htmlType="button"
          size="large"
          className="shrink-0"
        >
          {intl("student-settings.confirm-email.confirm")}
        </Button>
      </div>
    </div>
  );
};
