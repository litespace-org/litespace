import { Controller, Label } from "@litespace/ui/Form";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import React, { useMemo } from "react";
import { UseFormReturn } from "react-hook-form";
import { ITutorSettingsForm } from "@/components/TutorSettings/types";
import {
  useRequired,
  useValidatePassword,
  useValidatePhoneNumber,
} from "@litespace/ui/hooks/validation";
import { governorates } from "@/constants/user";
import NotificationSettings from "@/components/Common/NotificationSettings";

const PersonalSettings: React.FC<{
  form: UseFormReturn<ITutorSettingsForm, unknown, undefined>;
}> = ({ form }) => {
  const intl = useFormatMessage();
  const validatePassword = useValidatePassword();
  const validatePhoneNumber = useValidatePhoneNumber();

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
    <div className="p-10">
      <div className="grid grid-cols-2 justify-between">
        <div className="flex flex-col gap-6 max-w-[400px]">
          <Typography
            element="subtitle-1"
            weight="bold"
            className="text-natural-950"
          >
            {intl("tutor-settings.account-settings.title")}
          </Typography>
          <div className="flex flex-col gap-2">
            <Label>{intl("labels.email")}</Label>

            <Controller.Input
              value={form.watch("email")}
              control={form.control}
              autoComplete="off"
              name="email"
              disabled
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>{intl("labels.phoneNumber")}</Label>
            <Controller.Input
              value={form.watch("phoneNumber")}
              control={form.control}
              rules={{ validate: validatePhoneNumber }}
              autoComplete="off"
              name="phoneNumber"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>{intl("labels.city")}</Label>
            <Controller.Select
              value={form.watch("city")}
              options={cityOptions}
              placeholder={intl(
                "shared-settings.edit.personal.city.placeholder"
              )}
              control={form.control}
              name="city"
            />
          </div>
        </div>
        <div className="max-w-[400px] flex flex-col gap-6">
          <Typography
            element="subtitle-1"
            weight="bold"
            className="text-natural-950"
          >
            {intl("tutor-settings.account-settings.password.title")}
          </Typography>
          <div>
            <Label>{intl("settings.edit.password.current")}</Label>
            <Controller.Password
              value={form.watch("password.current")}
              control={form.control}
              helper={form.formState.errors.password?.current?.message}
              error={!!form.formState.errors.password?.current?.message}
              rules={{
                required: requirePassword ? required : undefined,
                validate: validatePassword,
              }}
              name="password.current"
            />
          </div>
          <div>
            <Label>{intl("settings.edit.password.new")}</Label>
            <Controller.Password
              value={form.watch("password.new")}
              control={form.control}
              rules={{
                required: requirePassword ? required : undefined,
                validate: validatePassword,
              }}
              name="password.new"
            />
          </div>
          <div>
            <Label>{intl("settings.edit.password.confirm")}</Label>
            <Controller.Password
              value={form.watch("password.confirm")}
              control={form.control}
              rules={{
                required: requirePassword ? required : undefined,
                validate: (value) => {
                  if (value !== form.watch("password.new"))
                    return intl("settings.edit.password.confirm.not-same");
                  return validatePassword(value);
                },
              }}
              name="password.confirm"
            />
          </div>
        </div>
      </div>
      <NotificationSettings />
    </div>
  );
};

export default PersonalSettings;
