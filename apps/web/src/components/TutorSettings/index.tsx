import React, { useCallback, useMemo } from "react";
import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { TutorSettingsTabs as Tabs } from "@/components/TutorSettings/Tabs";
import { useUpdateUser } from "@litespace/headless/user";
import { useToast } from "@litespace/ui/Toast";
import { Form } from "@litespace/ui/Form";
import { useForm } from "react-hook-form";
import { ITutorSettingsForm } from "@/components/TutorSettings/types";
import { ITutor, IUser } from "@litespace/types";
import { useInvalidateQuery } from "@litespace/headless/query";
import { QueryKey } from "@litespace/headless/constants";
import {
  getNullableFiledUpdatedValue,
  getOptionalFieldUpdatedValue,
  nullable,
  optional,
} from "@litespace/utils/utils";
import ProfileCard from "@/components/TutorSettings/ProfileCard";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import { Typography } from "@litespace/ui/Typography";
import { useOnError } from "@/hooks/error";

const TutorSettings: React.FC<{
  info: ITutor.FindTutorInfoApiResponse & {
    phone: string | null;
    city: IUser.City | null;
    email: string;
  };
}> = ({ info }) => {
  const { sm } = useMediaQuery();
  const intl = useFormatMessage();
  const invalidateQuery = useInvalidateQuery();
  const toast = useToast();

  const form = useForm<ITutorSettingsForm>({
    defaultValues: {
      name: info.name || "",
      bio: info.bio || "",
      about: info.about || "",
      email: info.email || "",
      phone: info.phone || "",
      city: optional(info.city),
      password: {
        current: "",
        confirm: "",
        new: "",
      },
    },
  });

  const name = form.watch("name");
  const bio = form.watch("bio");
  const about = form.watch("about");
  const email = form.watch("email");
  const phone = form.watch("phone");
  const city = form.watch("city");
  const password = form.watch("password.new");

  const dataChanged = useMemo(
    () =>
      nullable(name.trim()) !== info.name ||
      nullable(bio.trim()) !== info.bio ||
      nullable(about.trim()) !== info.about ||
      nullable(email.trim()) !== info.email ||
      nullable(phone.trim()) !== info.phone ||
      nullable(city) !== info.city ||
      !!password,
    [about, bio, name, city, phone, email, info, password]
  );

  const onSuccess = useCallback(() => {
    invalidateQuery([QueryKey.FindTutorInfo, info.id]);
    invalidateQuery([QueryKey.FindCurrentUser]);
    invalidateQuery([QueryKey.FindUserTopics]);
    form.setValue("password", {
      confirm: "",
      current: "",
      new: "",
    });
  }, [info.id, invalidateQuery, form]);

  const onError = useOnError({
    type: "mutation",
    handler: ({ messageId }) => {
      toast.error({
        title: intl("tutor-settings.profile.update.error"),
        description: intl(messageId),
      });
    },
  });

  const updateTutor = useUpdateUser({
    onError,
    onSuccess,
  });

  const submit = useCallback(
    (data: ITutorSettingsForm) => {
      return updateTutor.mutate({
        id: info.id,
        payload: {
          name: getNullableFiledUpdatedValue(info.name, data.name.trim()),
          bio: getNullableFiledUpdatedValue(info.bio, data.bio.trim()),
          about: getNullableFiledUpdatedValue(info.about, data.about.trim()),
          email: getOptionalFieldUpdatedValue(info.email, data.email.trim()),
          phone: getNullableFiledUpdatedValue(info.phone, data.phone.trim()),
          city: getNullableFiledUpdatedValue(info.city, data.city),
          password:
            data.password.current && data.password.new
              ? {
                  new: data.password.new,
                  current: data.password.current,
                }
              : undefined,
        },
      });
    },
    [info, updateTutor]
  );

  const saveButton = useMemo(
    () => (
      <Button
        htmlType="submit"
        loading={updateTutor.isPending}
        disabled={updateTutor.isPending || !dataChanged}
        size="large"
        className="self-end sm:self-start shrink-0"
      >
        <Typography tag="p" className="font-medium">
          {intl("shared-settings.save")}
        </Typography>
      </Button>
    ),
    [dataChanged, intl, updateTutor.isPending]
  );

  return (
    <Form
      onSubmit={form.handleSubmit(submit)}
      className="flex flex-col gap-6 md:gap-10"
    >
      <div className="sm:p-10 sm:pb-0 sm:flex sm:justify-between">
        <ProfileCard
          image={info.image}
          name={info.name}
          id={info.id}
          bio={info.bio}
          studentCount={info.studentCount}
          lessonCount={info.lessonCount}
          avgRating={info.avgRating}
        />
        {sm ? saveButton : null}
      </div>

      <div className="mb-24 sm:mb-0">
        <Tabs form={form} video={info.video} />
      </div>

      {!sm ? (
        <div className="fixed bottom-0 left-0 w-full p-4 flex justify-end bg-natural-50 shadow-form-submit-container">
          {saveButton}
        </div>
      ) : null}
    </Form>
  );
};

export default TutorSettings;
