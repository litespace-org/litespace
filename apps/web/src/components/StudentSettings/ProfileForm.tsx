import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import cn from "classnames";
import { isEqual } from "lodash";

import UploadPhoto from "@/components/StudentSettings/UploadPhoto";
import { TopicSelector } from "@/components/StudentSettings/TopicSelector";
import { governorates } from "@/constants/user";
import NotificationSettings from "@/components/Common/NotificationSettings";

import { IUser } from "@litespace/types";
import { orNull, orUndefined } from "@litespace/utils/utils";
import { MAX_TOPICS_COUNT } from "@litespace/utils/constants";

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
import { useUpdateFullUser } from "@litespace/headless/user";
import { useTopics, useUserTopics } from "@litespace/headless/topic";
import { useMediaQuery } from "@litespace/headless/mediaQuery";

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
  topics: number[];
};

export type TopicWatcher = {
  addTopics: number[];
  removeTopics: number[];
};

export const ProfileForm: React.FC<{
  user: IUser.Self;
  className?: string;
}> = ({ user, className }) => {
  const mq = useMediaQuery();
  const [photo, setPhoto] = useState<File | null>(null);

  const allTopicsQuery = useTopics({});
  const userTopicsQuery = useUserTopics();

  const allTopics = useMemo(() => {
    if (!allTopicsQuery.query.data?.list) return [];
    return allTopicsQuery.query.data.list.map((topic) => ({
      id: topic.id,
      label: topic.name.ar,
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
      city: user?.city || null,
      topics: userTopics,
    },
  });
  const errors = form.formState.errors;

  useEffect(() => {
    form.setValue("topics", userTopics);
  }, [userTopics, form]);

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
  const topics = form.watch("topics");

  const canSubmit = useMemo(() => {
    const currentValues = { city, name, email, password, phoneNumber, topics };
    const initialValues = {
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      password: {
        new: "",
        current: "",
        confirm: "",
      },
      city: user.city || null,
      topics: userTopics,
    };

    if (photo) return true;
    if (!isEqual(currentValues, initialValues)) return true;
    return false;
  }, [
    user,
    userTopics,
    photo,
    city,
    name,
    email,
    password,
    phoneNumber,
    topics,
  ]);

  const onSuccess = useCallback(() => {
    invalidateQuery([QueryKey.FindCurrentUser]);
  }, [invalidateQuery]);

  const onError = useCallback(
    (error: unknown) => {
      const errorMessage = getErrorMessageId(error);
      toast.error({
        title: intl("profile.update.error"),
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

  const profileMutation = useUpdateFullUser({ onSuccess, onError });

  const onSubmit = useCallback(
    (data: IForm) => {
      if (!canSubmit) return;
      if (!user) return;

      const addTopics: number[] = topics.filter(
        (topic) => !userTopics.includes(topic)
      );
      const removeTopics: number[] = userTopics.filter(
        (topic) => !topics.includes(topic)
      );

      profileMutation.mutate({
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
          addTopics,
          removeTopics,
          image: photo,
        },
      });
    },
    [profileMutation, photo, user, canSubmit, topics, userTopics]
  );

  const topicsSelector = useMemo(() => {
    if (userTopicsQuery.isPending || allTopicsQuery.query.isPending)
      // adding this div to not cause layout shift while loading the queries
      return <div />;

    return (
      <TopicSelector
        allTopics={allTopics}
        selectedTopics={topics}
        setTopics={(newTopics: number[]) => {
          if (topics.length === MAX_TOPICS_COUNT) return;
          form.setValue("topics", newTopics);
        }}
        retry={userTopicsQuery.refetch}
      />
    );
  }, [
    allTopics,
    allTopicsQuery.query.isPending,
    form,
    topics,
    userTopicsQuery.isPending,
    userTopicsQuery.refetch,
  ]);

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
      className={cn("flex flex-col", className)}
    >
      <div className="flex items-start justify-between mb-6 sm:mb-8">
        <UploadPhoto
          id={user.id}
          setPhoto={setPhoto}
          photo={photo || orNull(user?.image)}
        >
          {!mq.sm ? (
            <ConfirmButton
              disabled={profileMutation.isPending || !canSubmit}
              loading={profileMutation.isPending}
            />
          ) : null}
        </UploadPhoto>

        <div
          className={cn(
            "fixed sm:relative bottom-0 left-0 p-4 sm:p-0 flex gap-2 w-full sm:w-fit",
            "bg-natural-50 sm:bg-transparent shadow-student-profile z-10"
          )}
        >
          <SaveButton
            disabled={profileMutation.isPending || !canSubmit}
            loading={profileMutation.isPending}
          />
          {mq.sm ? (
            <ConfirmButton
              disabled={profileMutation.isPending || !canSubmit}
              loading={profileMutation.isPending}
            />
          ) : null}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:gap-10 lg:gap-28 pb-[72px] sm:pb-0">
        <div className="flex-1 flex flex-col lg:max-w-[400px]">
          <Typography
            element="subtitle-2"
            weight="bold"
            className="text-natural-950"
          >
            {intl("settings.edit.personal.title")}
          </Typography>

          <div className="grid gap-2 sm:gap-4 my-4 sm:my-6">
            <Controller.Input
              placeholder={intl("settings.edit.personal.name.placeholder")}
              value={form.watch("name")}
              control={form.control}
              rules={{ validate: validateUserName }}
              autoComplete="off"
              name="name"
              label={intl("settings.edit.personal.name")}
              state={errors.name ? "error" : undefined}
              helper={errors.name?.message}
            />

            <Controller.Input
              control={form.control}
              name="email"
              value={form.watch("email")}
              placeholder={intl("settings.edit.personal.email.placeholder")}
              autoComplete="off"
              rules={{ validate: validateEmail }}
              label={intl("settings.edit.personal.email")}
              state={errors.email ? "error" : undefined}
              helper={errors.email?.message}
            />

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
              label={intl("settings.edit.personal.phone-number")}
              state={errors.phoneNumber ? "error" : undefined}
              helper={errors.phoneNumber?.message}
            />

            <div>
              <Typography element="caption" weight="semibold">
                {intl("settings.edit.personal.city")}
              </Typography>
              <Controller.Select
                options={cityOptions}
                placeholder={intl(
                  "shared-settings.edit.personal.city.placeholder"
                )}
                value={orUndefined(form.watch("city"))}
                control={form.control}
                name="city"
              />
            </div>
          </div>

          {mq.sm ? topicsSelector : null}
        </div>

        <div className="flex-1 flex flex-col">
          <Typography
            element="subtitle-2"
            weight="bold"
            className="text-natural-950"
          >
            {intl("settings.edit.password.title")}
          </Typography>

          <div className="grid gap-2 sm:gap-4 my-4 sm:my-6 lg:max-w-[400px]">
            <Controller.Password
              value={form.watch("password.current")}
              control={form.control}
              rules={{
                required: requirePassword ? required : undefined,
                validate: validatePassword,
              }}
              name="password.current"
              label={intl("settings.edit.password.current")}
              state={errors.password?.current ? "error" : undefined}
              helper={errors.password?.current?.message}
            />

            <Controller.Password
              value={form.watch("password.new")}
              control={form.control}
              rules={{
                required: requirePassword ? required : undefined,
                validate: validatePassword,
              }}
              name="password.new"
              label={intl("settings.edit.password.new")}
              state={errors.password?.new ? "error" : undefined}
              helper={errors.password?.new?.message}
            />

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
              label={intl("settings.edit.password.confirm")}
              state={errors.password?.confirm ? "error" : undefined}
              helper={errors.password?.confirm?.message}
            />
          </div>

          <div className="w-full flex flex-col sm:flex-col gap-6 mt-2 sm:my-0">
            <NotificationSettings />
            {!mq.sm ? topicsSelector : null}
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
        element={{ default: "caption", lg: "body" }}
        weight={{ default: "medium" }}
        className="text-natural-50"
      >
        {intl("shared-settings.save")}
      </Typography>
    </Button>
  );
};

const ConfirmButton: React.FC<{
  disabled: boolean;
  loading: boolean;
}> = ({ disabled, loading }) => {
  const intl = useFormatMessage();
  return (
    <Button
      disabled={disabled}
      loading={loading}
      size="large"
      variant="secondary"
      className="w-full sm:w-fit sm:static sm:bottom-4 sm:left-4 mr-auto sm:mt-auto z-10"
      htmlType="submit"
    >
      <Typography
        element={{ default: "caption", lg: "body" }}
        weight={{ default: "medium" }}
      >
        {intl("settings.confirm")}
      </Typography>
    </Button>
  );
};
