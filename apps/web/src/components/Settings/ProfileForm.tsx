import { Controller, Form, Label } from "@litespace/ui/Form";
import UploadPhoto from "@/components/Settings/UploadPhoto";
import { Typography } from "@litespace/ui/Typography";
import { FullSwitch } from "@litespace/ui/Switch";
import { Button, ButtonSize } from "@litespace/ui/Button";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { IUser } from "@litespace/types";
import { useToast } from "@litespace/ui/Toast";
import { orNull, orUndefined } from "@litespace/utils/utils";
import { useInvalidateQuery } from "@litespace/headless/query";
import {
  useRequired,
  useValidateEmail,
  useValidatePassword,
  useValidatePhoneNumber,
  useValidateUserName,
} from "@litespace/ui/hooks/validation";
import { QueryKey } from "@litespace/headless/constants";
import { useUpdateFullUser } from "@litespace/headless/user";
import TopicSelector from "@/components/Settings/TopicSelector";
import { isEqual } from "lodash";
import { useTopics, useUserTopics } from "@litespace/headless/topic";
import { MAX_TOPICS_COUNT } from "@litespace/utils/constants";
import { governorates } from "@/constants/user";
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

export const ProfileForm: React.FC<{ user: IUser.Self }> = ({ user }) => {
  const { lg } = useMediaQuery();
  const [photo, setPhoto] = useState<File | null>(null);

  const allTopicsQuery = useTopics({});
  const userTopicsQuery = useUserTopics();

  const allTopics = useMemo(() => {
    if (!allTopicsQuery.query.data?.list) return [];
    return allTopicsQuery.query.data.list.map((topic) => ({
      value: topic.id,
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
    (error: Error) => {
      toast.error({
        title: intl("profile.update.error"),
        description: error.message,
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

  const notifyComingSoon = useCallback(() => {
    toast.success({
      title: intl("settings.notifications.coming-soon.title"),
      description: intl("settings.notifications.coming-soon.description"),
    });
  }, [intl, toast]);

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
        setTopics={(newTopics: number[]) => {
          if (topics.length === MAX_TOPICS_COUNT) return;
          form.setValue("topics", newTopics);
        }}
        topics={topics}
        allTopics={allTopics}
      />
    );
  }, [
    allTopics,
    allTopicsQuery.query.isPending,
    form,
    topics,
    userTopicsQuery.isPending,
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
      className="md:grid md:justify-items-stretch md:grid-cols-2 md:gap-x-28 md:gap-y-8 md:p-10 pb-16"
    >
      <div className=" flex flex-col md:gap-6">
        <UploadPhoto
          id={user.id}
          setPhoto={setPhoto}
          photo={photo || orNull(user?.image)}
        />
        <Typography
          element={lg ? "subtitle-1" : "caption"}
          weight="bold"
          className="text-natural-950 mt-6 mb-4 md:m-0"
        >
          {intl("settings.edit.personal.title")}
        </Typography>
        <div className="mb-2 md:m-0">
          <Label>{intl("settings.edit.personal.name")}</Label>
          <Controller.Input
            placeholder={intl("settings.edit.personal.name.placeholder")}
            value={form.watch("name")}
            control={form.control}
            rules={{ validate: validateUserName }}
            autoComplete="off"
            name="name"
          />
        </div>
        <div className="mb-2 md:m-0">
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
        <div className="mb-2 md:m-0">
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
        <div className="mb-6 md:m-0">
          <Label>{intl("settings.edit.personal.city")}</Label>
          <Controller.Select
            options={cityOptions}
            placeholder={intl("settings.edit.personal.city.placeholder")}
            value={orUndefined(form.watch("city"))}
            control={form.control}
            name="city"
          />
        </div>
      </div>
      <div className=" flex flex-col md:gap-6">
        <div className="w-full md:w-[72%] flex flex-col md:gap-6">
          <Typography
            element={lg ? "subtitle-1" : "caption"}
            weight="bold"
            className="text-natural-950 mb-4 md:m-0"
          >
            {intl("settings.edit.password.title")}
          </Typography>
          <div className="mb-2 md:m-0">
            <Label>{intl("settings.edit.password.current")}</Label>
            <Controller.Password
              value={form.watch("password.current")}
              control={form.control}
              helper={form.formState.errors.password?.current?.message}
              state={
                form.formState.errors.password?.current?.message
                  ? "error"
                  : "success"
              }
              rules={{
                required: requirePassword ? required : undefined,
                validate: validatePassword,
              }}
              name="password.current"
            />
          </div>
          <div className="mb-2 md:m-0">
            <Label>{intl("settings.edit.password.new")}</Label>
            <Controller.Password
              value={form.watch("password.new")}
              control={form.control}
              helper={form.formState.errors.password?.new?.message}
              state={
                form.formState.errors.password?.new?.message
                  ? "error"
                  : "success"
              }
              rules={{
                required: requirePassword ? required : undefined,
                validate: validatePassword,
              }}
              name="password.new"
            />
          </div>
          <div className="mb-6 md:m-0">
            <Label>{intl("settings.edit.password.confirm")}</Label>
            <Controller.Password
              value={form.watch("password.confirm")}
              control={form.control}
              helper={form.formState.errors.password?.confirm?.message}
              state={
                form.formState.errors.password?.confirm?.message
                  ? "error"
                  : "success"
              }
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
        <div className="w-full flex flex-col md:gap-6">
          {!lg ? topicsSelector : null}
          <Typography
            element={lg ? "subtitle-1" : "caption"}
            weight="bold"
            className="text-natural-950 mt-6 mb-4 md:m-0"
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
              isLargeScreen={lg}
            />
            <FullSwitch
              title={intl("settings.notifications.messages.title")}
              description={intl("settings.notifications.messages.description")}
              checked={false}
              disabled={false}
              onChange={notifyComingSoon}
              isLargeScreen={lg}
            />
          </div>
        </div>
      </div>
      {lg ? topicsSelector : null}
      <Button
        disabled={profileMutation.isPending || !canSubmit}
        loading={profileMutation.isPending}
        size={lg ? ButtonSize.Large : ButtonSize.Tiny}
        className="fixed bottom-4 left-4 md:static mr-auto mt-6 md:mt-auto"
        htmlType="submit"
      >
        <Typography
          element={lg ? "body" : "caption"}
          weight={lg ? "bold" : "semibold"}
          className="text-natural-50"
        >
          {intl("settings.save")}
        </Typography>
      </Button>
    </Form>
  );
};
