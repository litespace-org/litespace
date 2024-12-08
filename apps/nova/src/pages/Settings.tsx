import PageContent from "@/components/Common/PageContent";
import PageTitle from "@/components/Common/PageTitle";
import UploadPhoto from "@/components/Settings/UploadPhoto";
import { useUpdateUser } from "@litespace/headless/user";
import { Button, ButtonSize } from "@litespace/luna/Button";
import { Controller, Form, Label } from "@litespace/luna/Form";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { FullSwitch } from "@litespace/luna/Switch";
import {
  useRequired,
  useValidateEmail,
  useValidatePassword,
  useValidatePhoneNumber,
  useValidateUsername,
} from "@litespace/luna/hooks/validation";
import { useToast } from "@litespace/luna/Toast";
import { Typography } from "@litespace/luna/Typography";
import { orNull } from "@litespace/sol/utils";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useUser } from "@litespace/headless/context/user";

type IForm = {
  name: string;
  email: string;
  phoneNumber: string;
  password: {
    new: string;
    current: string;
    confirm: string;
  };
};

const Settings: React.FC = () => {
  const intl = useFormatMessage();
  const { user, loading, fetching } = useUser();
  const toast = useToast();
  const [photo, setPhoto] = useState<File | null>(null);

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
    },
  });
  const validateUsername = useValidateUsername();
  const validateEmail = useValidateEmail();
  const validatePhoneNumber = useValidatePhoneNumber();
  const validatePassword = useValidatePassword();
  const required = useRequired();
  const requirePassword =
    !!form.watch("password.new") ||
    !!form.watch("password.current") ||
    !!form.watch("password.confirm");

  const onSuccess = useCallback(() => {
    alert("refresh");
  }, []);

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
      if (photo) console.log("upload photo");
      if (!user) return;

      mutation.mutate({
        id: user.id,
        payload: {
          name: data.name && data.name !== user.name ? data.name : undefined,
          email:
            data.email && data.email !== user.email ? data.email : undefined,
          phoneNumber: data.phoneNumber ? data.phoneNumber : undefined,
          password:
            data.password.new && data.password.current
              ? {
                  new: data.password.new,
                  current: data.password.current,
                }
              : undefined,
        },
      });
    },
    [mutation, photo, user]
  );

  useEffect(() => {
    if (!requirePassword) {
      form.trigger("password.current");
      form.trigger("password.new");
      form.trigger("password.confirm");
    }
  }, [form, requirePassword]);

  return (
    <div className="max-w-screen-3xl mx-auto w-full p-6">
      <div className="w-full">
        <div className="mb-8">
          <PageTitle
            title={intl("settings.profile.title")}
            fetching={fetching && !loading}
          />
        </div>

        <PageContent>
          <Form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex gap-28 p-14"
          >
            <div className="w-[38%] flex flex-col gap-6">
              <UploadPhoto
                setPhoto={setPhoto}
                photo={photo || orNull(user?.image)}
              />
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
                  rules={{ validate: validateUsername }}
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
                  rules={{ validate: validateEmail }}
                />
              </div>
              <div>
                <Label>{intl("settings.edit.personal.phone-number")}</Label>
                <Controller.PatternInput
                  format="### #### ####"
                  placeholder={intl(
                    "settings.edit.personal.phone-number.placeholder"
                  )}
                  value={form.watch("phoneNumber")}
                  control={form.control}
                  name="phoneNumber"
                  rules={{ validate: validatePhoneNumber }}
                  autoComplete="off"
                  mask=" "
                />
              </div>
            </div>
            <div className="w-[52%] flex flex-col gap-6">
              <div className="w-[72%] flex flex-col gap-6">
                <Typography
                  element="subtitle-1"
                  weight="bold"
                  className="text-natural-950"
                >
                  {intl("settings.edit.password.title")}
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
                    helper={form.formState.errors.password?.new?.message}
                    error={!!form.formState.errors.password?.new?.message}
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
                    helper={form.formState.errors.password?.confirm?.message}
                    error={!!form.formState.errors.password?.confirm?.message}
                    rules={{
                      required: requirePassword ? required : undefined,
                      validate: (value) => {
                        if (value !== form.watch("password.new"))
                          return intl(
                            "settings.edit.password.confirm.not-same"
                          );
                        return validatePassword(value);
                      },
                    }}
                    name="password.confirm"
                  />
                </div>
              </div>
              <div className="w-full flex flex-col gap-6">
                <Typography
                  element="subtitle-1"
                  weight="bold"
                  className="text-natural-950"
                >
                  {intl("settings.notifications")}
                </Typography>

                <div className="flex flex-col gap-4">
                  <FullSwitch
                    title={intl("settings.notifications.lesson-date.title")}
                    description={intl(
                      "settings.notifications.lesson-date.description"
                    )}
                    checked={false}
                    disabled={false}
                    onChange={() => alert("switch change")}
                  />
                  <FullSwitch
                    title={intl("settings.notifications.messages.title")}
                    description={intl(
                      "settings.notifications.messages.description"
                    )}
                    checked={true}
                    disabled={false}
                    onChange={() => alert("switch change")}
                  />
                </div>
              </div>
              <Button
                disabled={false}
                size={ButtonSize.Large}
                className="mr-auto mt-auto"
                htmlType="submit"
              >
                {intl("settings.save")}
              </Button>
            </div>
          </Form>
        </PageContent>
      </div>
    </div>
  );
};

export default Settings;
