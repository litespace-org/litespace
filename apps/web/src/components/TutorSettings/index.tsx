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
import { orNull, orUndefined } from "@litespace/utils/utils";
import { getErrorMessageId } from "@litespace/ui/errorMessage";
import { capture } from "@/lib/sentry";
import ProfileCard from "@/components/TutorSettings/ProfileCard";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import { Typography } from "@litespace/ui/Typography";

const TutorSettings: React.FC<{
  info: ITutor.FindTutorInfoApiResponse & {
    phoneNumber: string | null;
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
      phoneNumber: info.phoneNumber || "",
      city: orUndefined(info.city),
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
      orNull(email.trim()) !== info.email ||
      orNull(phoneNumber.trim()) !== info.phoneNumber ||
      orNull(city) !== info.city ||
      !!password,
    [about, bio, name, city, phoneNumber, email, info, password]
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

  const onError = useCallback(
    (error: unknown) => {
      capture(error);
      toast.error({
        title: intl("tutor-settings.profile.update.error"),
        description: intl(getErrorMessageId(error)),
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
            data.email.trim() !== info.email ? data.email.trim() : undefined,
          phoneNumber:
            data.phoneNumber.trim() !== info.phoneNumber
              ? data.phoneNumber.trim()
              : undefined,
          city: data.city !== info.city ? data.city : undefined,
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
        <Typography tag="label" className="font-medium">
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
