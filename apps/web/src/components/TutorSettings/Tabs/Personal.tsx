import { Controller } from "@litespace/ui/Form";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import React, { useMemo } from "react";
import { UseFormReturn } from "react-hook-form";
import { ITutorSettingsForm } from "@/components/TutorSettings/types";
import {
  useRequired,
  useValidatePassword,
  useValidatePhone,
} from "@litespace/ui/hooks/validation";
import { governorates } from "@/constants/user";
import NotificationSettings from "@/components/Common/NotificationSettings";

const PersonalSettings: React.FC<{
  form: UseFormReturn<ITutorSettingsForm, unknown, undefined>;
}> = ({ form }) => {
  const intl = useFormatMessage();
  const validatePassword = useValidatePassword();
  const validatePhone = useValidatePhone();
  const errors = form.formState.errors;

  const cityOptions = useMemo(
    () =>
      Object.entries(governorates).map(([key, value]) => ({
        label: intl(value),
        value: Number(key),
      })),
    [intl]
  );

  const required = useRequired();

  const requirePassword =
    !!form.watch("password.new") ||
    !!form.watch("password.current") ||
    !!form.watch("password.confirm");

  return (
    <div className="pt-4 md:pt-6 md:px-10 md:pb-10 lg:pt-10">
      <div className="flex flex-col md:flex-row gap-6 md:gap-[30px] lg:gap-[192px] md:justify-start mb-6">
        <div className="flex flex-col gap-2 md:gap-4 w-full max-w-[400px]">
          <Typography
            tag="h1"
            className="text-natural-950 text-subtitle-2 md:text-body lg:text-subtitle-1 font-bold mb-2 md:mb-0 lg:mb-2"
          >
            {intl("tutor-settings.account-settings.title")}
          </Typography>
          <Controller.Input
            label={intl("labels.email")}
            value={form.watch("email")}
            control={form.control}
            autoComplete="off"
            name="email"
            disabled
            dir="rtl"
          />
          <Controller.Input
            label={intl("labels.phone")}
            value={form.watch("phone")}
            control={form.control}
            rules={{ validate: validatePhone }}
            autoComplete="off"
            name="phone"
            dir="rtl"
          />
          <Controller.Select
            id="city"
            label={intl("labels.city")}
            value={form.watch("city")}
            options={cityOptions}
            placeholder={intl("shared-settings.edit.personal.city.placeholder")}
            control={form.control}
            name="city"
          />
        </div>

        <div className="flex flex-col gap-2 md:gap-4 max-w-[400px] w-full">
          <Typography
            tag="h2"
            className="text-natural-950 text-subtitle-2 md:text-body lg:text-subtitle-1 font-bold mb-2 md:mb-0 lg:mb-2"
          >
            {intl("tutor-settings.account-settings.password.title")}
          </Typography>

          <Controller.Password
            id="current-password"
            value={form.watch("password.current")}
            control={form.control}
            label={intl("shared-settings.edit.password.current")}
            helper={errors.password?.current?.message}
            state={errors.password ? "error" : undefined}
            rules={{
              required: requirePassword ? required : undefined,
              validate: validatePassword,
            }}
            name="password.current"
            idleDir="rtl"
          />

          <Controller.Password
            id="new-password"
            label={intl("shared-settings.edit.password.new")}
            value={form.watch("password.new")}
            control={form.control}
            rules={{
              required: requirePassword ? required : undefined,
              validate: validatePassword,
            }}
            name="password.new"
            idleDir="rtl"
          />

          <Controller.Password
            label={intl("shared-settings.edit.password.confirm")}
            value={form.watch("password.confirm")}
            control={form.control}
            rules={{
              required: requirePassword ? required : undefined,
              validate: (value) => {
                if (value !== form.watch("password.new"))
                  return intl("shared-settings.edit.password.confirm.not-same");
                return validatePassword(value);
              },
            }}
            name="password.confirm"
            dir="rtl"
          />
        </div>
      </div>
      <div className="max-w-[467px]">
        <NotificationSettings />
      </div>
    </div>
  );
};

export default PersonalSettings;
