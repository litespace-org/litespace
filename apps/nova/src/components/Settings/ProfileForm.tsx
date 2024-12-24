import { Controller, Form, Label } from "@litespace/luna/Form";
import UploadPhoto from "@/components/Settings/UploadPhoto";
import { Typography } from "@litespace/luna/Typography";
import { FullSwitch } from "@litespace/luna/Switch";
import { Button, ButtonSize } from "@litespace/luna/Button";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { IUser } from "@litespace/types";
import { useToast } from "@litespace/luna/Toast";
import { orNull, orUndefined } from "@litespace/sol/utils";
import { useInvalidateQuery } from "@litespace/headless/query";
import {
  useRequired,
  useValidateEmail,
  useValidatePassword,
  useValidatePhoneNumber,
  useValidateUsername,
} from "@litespace/luna/hooks/validation";
import { QueryKey } from "@litespace/headless/constants";
import { useUpdateUser } from "@litespace/headless/user";
import TopicSelector from "@/components/Settings/TopicSelector";
import { useTopics, useUserTopics } from "@litespace/headless/topic";

type IForm = {
  name: string;
  email: string;
  phoneNumber: string;
  password: {
    new: string;
    current: string;
    confirm: string;
  };
  city: IUser.City;
};

export const ProfileForm: React.FC<{ user: IUser.Self }> = ({ user }) => {
  const [photo, setPhoto] = useState<File | null>(null);
  const [topics, setTopics] = useState<number[]>([]);

  const allTopicsQuery = useTopics({});
  const userTopicsQuery = useUserTopics();

  const allTopics = useMemo(() => {
    if (!allTopicsQuery.query.data?.list) return [];
    return allTopicsQuery.query.data.list.map((topic) => ({
      value: topic.id,
      label: topic.name.en,
    }));
  }, [allTopicsQuery]);

  const userTopics = useMemo(() => {
    if (!userTopicsQuery.data) return [];
    return userTopicsQuery.data.map((topic) => topic.id);
  }, [userTopicsQuery.data]);

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
      city: orUndefined(user?.city),
    },
  });

  const invalidateQuery = useInvalidateQuery();
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
    invalidateQuery([QueryKey.FindCurrentUser]);
    toast.success({ title: intl("profile.update.success") });
  }, [invalidateQuery, intl, toast]);

  const onError = useCallback(
    (error: Error) => {
      toast.error({
        title: intl("profile.update.error"),
        description: error.message,
      });
    },
    [intl, toast]
  );

  const cityArr = useMemo(
    () =>
      Object.entries(IUser.City)
        .filter((city) => !isNaN(Number(city[0])))
        .map((city) => ({
          label: city[1] as string,
          value: Number(city[0]),
        })),
    []
  );

  const mutation = useUpdateUser({ onSuccess, onError });

  const notifyComingSoon = useCallback(() => {
    toast.success({
      title: intl("settings.notifications.coming-soon.title"),
      description: intl("settings.notifications.coming-soon.description"),
    });
  }, [intl, toast]);

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
          city: data.city && data.city !== user.city ? data.city : undefined,
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

  useEffect(() => {
    setTopics(userTopics);
  }, [userTopics]);

  return (
    <Form
      onSubmit={form.handleSubmit(onSubmit)}
      className="grid justify-items-stretch grid-cols-2 gap-x-28 gap-y-8 p-14"
    >
      <div className=" flex flex-col gap-6">
        <UploadPhoto setPhoto={setPhoto} photo={photo || orNull(user?.image)} />
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
        <div>
          <Label>{intl("settings.edit.personal.city")}</Label>
          <Controller.Select
            options={cityArr}
            placeholder={intl("settings.edit.personal.city.placeholder")}
            value={form.watch("city")}
            control={form.control}
            name="city"
          />
        </div>
      </div>
      <div className=" flex flex-col gap-6">
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
                    return intl("settings.edit.password.confirm.not-same");
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
              onChange={notifyComingSoon}
            />
            <FullSwitch
              title={intl("settings.notifications.messages.title")}
              description={intl("settings.notifications.messages.description")}
              checked={false}
              disabled={false}
              onChange={notifyComingSoon}
            />
          </div>
        </div>
      </div>
      <TopicSelector
        onChange={setTopics}
        allTopics={allTopics}
        userTopics={topics}
        loading={allTopicsQuery.query.isPending || userTopicsQuery.isPending}
      />
      <Button
        disabled={false}
        size={ButtonSize.Large}
        className="mr-auto mt-auto"
        htmlType="submit"
      >
        {intl("settings.save")}
      </Button>
    </Form>
  );
};
