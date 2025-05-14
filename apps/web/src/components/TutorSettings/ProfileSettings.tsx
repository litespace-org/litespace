import React, { useCallback, useMemo } from "react";
import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useUpdateUser } from "@litespace/headless/user";
import { useToast } from "@litespace/ui/Toast";
import { Form } from "@litespace/ui/Form";
import { ITutorSettingsForm } from "@/components/TutorSettings/types";
import { ITutor } from "@litespace/types";
import { useInvalidateQuery } from "@litespace/headless/query";
import { QueryKey } from "@litespace/headless/constants";
import { getNullableFiledUpdatedValue } from "@litespace/utils/utils";
import ProfileCard from "@/components/TutorSettings/ProfileCard";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import { Typography } from "@litespace/ui/Typography";
import { useOnError } from "@/hooks/error";
import { useForm } from "@litespace/headless/form";
import { VideoPlayer } from "@litespace/ui/VideoPlayer";
import { MAX_TUTOR_ABOUT_TEXT_LENGTH } from "@litespace/utils";
import { Textarea } from "@litespace/ui/Textarea";
import { Input } from "@litespace/ui/Input";
import TopicSelection from "@/components/Settings/TopicSelection";

const ProfileSettings: React.FC<{
  info: ITutor.FindTutorInfoApiResponse;
}> = ({ info }) => {
  const { sm } = useMediaQuery();
  const intl = useFormatMessage();
  const invalidateQuery = useInvalidateQuery();
  const toast = useToast();

  const onError = useOnError({
    type: "mutation",
    handler: ({ messageId }) => {
      toast.error({
        title: intl("tutor-settings.profile.update.error"),
        description: intl(messageId),
      });
    },
  });

  const onSuccess = useCallback(() => {
    invalidateQuery([QueryKey.FindTutorInfo, info.id]);
    invalidateQuery([QueryKey.FindCurrentUser]);
    invalidateQuery([QueryKey.FindUserTopics]);
  }, [info.id, invalidateQuery]);

  const updateTutor = useUpdateUser({
    onError,
    onSuccess,
  });

  const form = useForm<ITutorSettingsForm>({
    defaults: {
      name: info.name || "",
      bio: info.bio || "",
      about: info.about || "",
    },
    onSubmit: (data) => {
      updateTutor.mutate({
        id: info.id,
        payload: {
          name: getNullableFiledUpdatedValue(info.name, data.name.trim()),
          bio: getNullableFiledUpdatedValue(info.bio, data.bio.trim()),
          about: getNullableFiledUpdatedValue(info.about, data.about.trim()),
        },
      });
    },
  });

  const dataChanged = useMemo(
    () =>
      info.name !== form.state.name ||
      info.about !== form.state.about ||
      info.bio !== form.state.bio,
    [info, form]
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
    [intl, updateTutor.isPending, dataChanged]
  );

  return (
    <Form onSubmit={form.onSubmit} className="flex flex-col gap-6">
      <div className="sm:flex sm:justify-between">
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
      <div className="flex flex-col gap-6 lg:gap-6 md:pb-10">
        <Typography
          tag="h1"
          className="text-natural-950 text-subtitle-2 md:text-body lg:text-subtitle-1 font-bold"
        >
          {intl("tutor-settings.personal-info.title")}
        </Typography>
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8 -mt-2 lg:mt-0">
          <Input
            id="name"
            value={form.state.name}
            onChange={(e) => form.set("name", e.target.value)}
            autoComplete="off"
            label={intl("tutor-settings.personal-info.name")}
            name="name"
            state={form.errors.name ? "error" : undefined}
            helper={form.errors.name}
          />
          <Input
            id="bio"
            value={form.state.bio}
            onChange={(e) => form.set("bio", e.target.value)}
            autoComplete="off"
            label={intl("tutor-settings.personal-info.bio")}
            state={form.errors.bio ? "error" : undefined}
            helper={form.errors.bio}
            name="bio"
          />
        </div>

        <TopicSelection />

        <Typography
          tag="h1"
          className="text-natural-950 text-subtitle-2 md:text-body lg:text-subtitle-1 font-bold"
        >
          {intl("tutor-settings.personal-info.about")}
        </Typography>
        <Textarea
          id="about"
          value={form.state.about}
          onChange={(e) => form.set("about", e.target.value)}
          autoComplete="off"
          className="min-h-[172px]"
          state={form.errors.about ? "error" : undefined}
          maxAllowedCharacters={MAX_TUTOR_ABOUT_TEXT_LENGTH}
          name="about"
          helper={form.errors.about}
        />

        {info.video ? (
          <>
            <Typography
              tag="h2"
              className="-mb-2 lg:mb-0 text-natural-950 text-subtitle-2 md:text-body lg:text-subtitle-1 font-bold"
            >
              {intl("tutor-settings.personal-info.video")}
            </Typography>

            <VideoPlayer src={info.video} />
          </>
        ) : null}
      </div>
      {!sm ? (
        <div className="fixed bottom-0 left-0 w-full p-4 flex justify-end bg-natural-50 shadow-form-submit-container">
          {saveButton}
        </div>
      ) : null}
    </Form>
  );
};

export default ProfileSettings;
