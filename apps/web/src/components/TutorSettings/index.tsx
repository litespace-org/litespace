import { TutorProfileCard } from "@litespace/ui/TutorProfile";
import React, { useCallback, useMemo } from "react";
import { Button, ButtonSize } from "@litespace/ui/Button";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { TutorSettingsTabs } from "@/components/TutorSettings/Tabs";
import { useUpdateUser } from "@litespace/headless/user";
import { useToast } from "@litespace/ui/Toast";
import { Form } from "@litespace/ui/Form";
import { useForm } from "react-hook-form";
import { ITutorSettingsForm } from "@/components/TutorSettings/types";
import { ITutor, IUser } from "@litespace/types";
import { useInvalidateQuery } from "@litespace/headless/query";
import { QueryKey } from "@litespace/headless/constants";
import { orNull, orUndefined } from "@litespace/utils/utils";

const TutorSettings: React.FC<{
  info: ITutor.FindTutorInfoApiResponse;
  personalData: {
    phoneNumber: string | null;
    city: IUser.City | null;
    email: string;
  };
}> = ({ info, personalData }) => {
  const intl = useFormatMessage();
  const invalidateQuery = useInvalidateQuery();
  const toast = useToast();

  const form = useForm<ITutorSettingsForm>({
    defaultValues: {
      name: info.name || "",
      bio: info.bio || "",
      about: info.about || "",
      email: personalData.email || "",
      phoneNumber: personalData.phoneNumber || "",
      city: orUndefined(personalData.city),
    },
  });

  const name = form.watch("name");
  const bio = form.watch("bio");
  const about = form.watch("about");
  const email = form.watch("email");
  const phoneNumber = form.watch("phoneNumber");
  const city = form.watch("city");
  const password = form.watch("password.new");

  const dataChanged = useMemo(
    () =>
      orNull(name.trim()) !== info.name ||
      orNull(bio.trim()) !== info.bio ||
      orNull(about.trim()) !== info.about ||
      orNull(email.trim()) !== personalData.email ||
      orNull(phoneNumber.trim()) !== personalData.phoneNumber ||
      orNull(city) !== personalData.city ||
      !!password,
    [about, bio, name, city, phoneNumber, email, info, password, personalData]
  );

  const onSuccess = useCallback(() => {
    invalidateQuery([QueryKey.FindTutorInfo, info.id]);
    invalidateQuery([QueryKey.FindCurrentUser]);
    invalidateQuery([QueryKey.FindUserTopics]);
    form.setValue("password", {
      confirm: "",
      new: "",
      current: "",
    });
  }, [info.id, invalidateQuery, form]);

  const onError = useCallback(
    (error: Error) => {
      toast.error({
        title: intl("tutor-settings.profile.update.error"),
        description: error.message,
      });
    },
    [intl, toast]
  );

  const updateTutor = useUpdateUser({
    onError,
    onSuccess,
  });

  const submit = useCallback(
    (data: ITutorSettingsForm) => {
      return updateTutor.mutate({
        id: info.id,
        payload: {
          name: data.name.trim() !== info.name ? data.name.trim() : undefined,
          bio: data.bio.trim() !== info.bio ? data.bio.trim() : undefined,
          about:
            data.about.trim() !== info.about ? data.about.trim() : undefined,
          email:
            data.email.trim() !== personalData.email
              ? data.email.trim()
              : undefined,
          phoneNumber:
            data.phoneNumber.trim() !== personalData.phoneNumber
              ? data.phoneNumber.trim()
              : undefined,
          city: data.city !== personalData.city ? data.city : undefined,
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
    [info, updateTutor, personalData]
  );

  return (
    <Form onSubmit={form.handleSubmit(submit)} className="flex flex-col gap-10">
      <div className="p-10 pb-0 flex justify-between">
        <TutorProfileCard
          variant="small"
          image={info.image}
          name={info.name}
          id={info.id}
          bio={info.bio}
          studentCount={info.studentCount}
          lessonCount={info.studentCount}
          avgRating={info.avgRating}
        />

        <Button
          htmlType="submit"
          loading={updateTutor.isPending}
          disabled={updateTutor.isPending || !dataChanged}
          size={ButtonSize.Small}
        >
          {intl("settings.save")}
        </Button>
      </div>
      <TutorSettingsTabs form={form} video={info.video} />
    </Form>
  );
};

export default TutorSettings;
