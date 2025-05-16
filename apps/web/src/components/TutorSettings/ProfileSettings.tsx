import React, { useCallback } from "react";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useUpdateUser } from "@litespace/headless/user";
import { useToast } from "@litespace/ui/Toast";
import { Form } from "@litespace/ui/Form";
import { ITutorSettingsForm } from "@/components/TutorSettings/types";
import { ITutor, IUser } from "@litespace/types";
import { useInvalidateQuery } from "@litespace/headless/query";
import { QueryKey } from "@litespace/headless/constants";
import { getNullableFiledUpdatedValue } from "@litespace/utils/utils";
import ProfileCard from "@/components/TutorSettings/ProfileCard";
import { Typography } from "@litespace/ui/Typography";
import { useOnError } from "@/hooks/error";
import { useFieldMutation, useForm } from "@litespace/headless/form";
import { VideoPlayer } from "@litespace/ui/VideoPlayer";
import { MAX_TUTOR_ABOUT_TEXT_LENGTH } from "@litespace/utils";
import { AutoSaveTextarea } from "@litespace/ui/Textarea";
import { AutoSaveInput } from "@litespace/ui/Input";
import TopicSelection from "@/components/Settings/TopicSelection";

const ProfileSettings: React.FC<{
  info: ITutor.FindTutorInfoApiResponse;
}> = ({ info }) => {
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

  const [nameState, saveName] = useFieldMutation<string, IUser.Self>((value) =>
    updateTutor.mutateAsync({
      id: info.id,
      payload: { name: getNullableFiledUpdatedValue(info.name, value) },
    })
  );

  const [bioState, saveBio] = useFieldMutation<string, IUser.Self>((value) =>
    updateTutor.mutateAsync({
      id: info.id,
      payload: { bio: getNullableFiledUpdatedValue(info.bio, value) },
    })
  );

  const [aboutState, saveAbout] = useFieldMutation<string, IUser.Self>(
    (value) =>
      updateTutor.mutateAsync({
        id: info.id,
        payload: { about: getNullableFiledUpdatedValue(info.about, value) },
      })
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
      </div>
      <div className="flex flex-col gap-6 lg:gap-6 md:pb-10">
        <Typography
          tag="h1"
          className="text-natural-950 text-subtitle-2 md:text-body lg:text-subtitle-1 font-bold"
        >
          {intl("tutor-settings.personal-info.title")}
        </Typography>
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8 -mt-2 lg:mt-0">
          <AutoSaveInput
            id="name"
            value={form.state.name}
            onChange={(e) => form.set("name", e.target.value)}
            onSave={(value) => saveName(value)}
            isPending={nameState.isPending}
            isSuccess={nameState.isSuccess}
            isError={nameState.isError}
            label={intl("tutor-settings.personal-info.name")}
            helper={nameState.isError ? "Failed to save" : undefined}
          />

          <AutoSaveInput
            id="bio"
            value={form.state.bio}
            onChange={(e) => form.set("bio", e.target.value)}
            onSave={(value) => saveBio(value)}
            isPending={bioState.isPending}
            isSuccess={bioState.isSuccess}
            isError={bioState.isError}
            label={intl("tutor-settings.personal-info.bio")}
            helper={bioState.isError ? "Failed to save" : undefined}
          />
        </div>

        <TopicSelection forTutor />

        <Typography
          tag="h1"
          className="text-natural-950 text-subtitle-2 md:text-body lg:text-subtitle-1 font-bold"
        >
          {intl("tutor-settings.personal-info.about")}
        </Typography>
        <AutoSaveTextarea
          id="about"
          value={form.state.about}
          onChange={(e) => form.set("about", e.target.value)}
          onSave={(value) => saveAbout(value)}
          isPending={aboutState.isPending}
          isSuccess={aboutState.isSuccess}
          isError={aboutState.isError}
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
    </Form>
  );
};

export default ProfileSettings;
