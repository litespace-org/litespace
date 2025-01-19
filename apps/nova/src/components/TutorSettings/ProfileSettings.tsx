import { TutorProfileCard } from "@litespace/luna/TutorProfile";
import React, { useCallback, useMemo } from "react";
import { Button, ButtonSize } from "@litespace/luna/Button";
import { useFormatMessage } from "@litespace/luna/hooks/intl";

import { TutorSettingsTabs } from "@/components/TutorSettings/SettingsTabs";
import { useUpdateUser } from "@litespace/headless/user";
import { useToast } from "@litespace/luna/Toast";
import { Form } from "@litespace/luna/Form";
import { useForm } from "react-hook-form";
import { ITutorSettingsForm } from "@/components/TutorSettings/types";
import { ITutor } from "@litespace/types";
import { useUserTopics } from "@litespace/headless/topic";
import { useInvalidateQuery } from "@litespace/headless/query";
import { QueryKey } from "@litespace/headless/constants";

export const ProfileSettings: React.FC<{
  tutorInfo: ITutor.FindTutorInfoApiResponse;
}> = ({ tutorInfo }) => {
  const userTopics = useUserTopics();
  const intl = useFormatMessage();
  const invalidateQuery = useInvalidateQuery();
  const toast = useToast();

  const form = useForm<ITutorSettingsForm>({
    defaultValues: {
      name: tutorInfo.name || "",
      bio: tutorInfo.bio || "",
      about: tutorInfo.about || "",
    },
  });

  const name = form.watch("name");
  const bio = form.watch("bio");
  const about = form.watch("about");

  const refetchTutorInfo = useCallback(() => {
    invalidateQuery([QueryKey.FindTutorInfo, tutorInfo.id]);
    invalidateQuery([QueryKey.FindCurrentUser]);
    invalidateQuery([QueryKey.FindUserTopics]);
  }, [invalidateQuery, tutorInfo.id]);

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
    onSuccess: refetchTutorInfo,
  });

  const selectedTopics = useMemo(() => {
    if (!userTopics.data) return [];
    return userTopics.data.map((topic) => ({
      id: topic.id,
      label: topic.name.ar,
    }));
  }, [userTopics.data]);

  const saveTutorInfoChanges = useCallback(
    (data: ITutorSettingsForm) => {
      return updateTutor.mutate({
        id: tutorInfo.id,
        payload: {
          name: data.name,
          bio: data.bio,
          about: data.about,
        },
      });
    },
    [tutorInfo.id, updateTutor]
  );

  if (!tutorInfo) return null;

  return (
    <Form
      onSubmit={form.handleSubmit(saveTutorInfoChanges)}
      className="flex flex-col gap-10"
    >
      <div className="p-10 pb-0 flex justify-between">
        <TutorProfileCard variant="small" {...tutorInfo} />
        <Button
          htmlType="submit"
          loading={updateTutor.isPending}
          disabled={updateTutor.isPending}
          size={ButtonSize.Small}
        >
          {intl("settings.save")}
        </Button>
      </div>
      <TutorSettingsTabs
        form={form}
        tutor={{
          name,
          bio,
          about,
          video: tutorInfo.video,
          topics: selectedTopics,
        }}
      />
    </Form>
  );
};
