import { TutorProfileCard } from "@litespace/luna/TutorProfile";
import React, { useCallback, useEffect, useMemo } from "react";
import { Button, ButtonSize } from "@litespace/luna/Button";
import { useFormatMessage } from "@litespace/luna/hooks/intl";

import { TutorSettingsTabs } from "@/components/TutorSettings/SettingsTabs";
import { useUpdateUser } from "@litespace/headless/user";
import { useToast } from "@litespace/luna/Toast";
import { Form } from "@litespace/luna/Form";
import { useForm } from "react-hook-form";
import { ITutorSettingsForm } from "@/components/TutorSettings/types";
import { ITutor } from "@litespace/types";
import { useInvalidateQuery } from "@litespace/headless/query";
import { QueryKey } from "@litespace/headless/constants";
import { asFullAssetUrl } from "@litespace/luna/backend";
import { orNull } from "@litespace/sol/utils";

export const ProfileSettings: React.FC<ITutor.FindTutorInfoApiResponse> = ({
  ...info
}) => {
  const intl = useFormatMessage();
  const invalidateQuery = useInvalidateQuery();
  const toast = useToast();

  const form = useForm<ITutorSettingsForm>({
    defaultValues: {
      name: info.name || "",
      bio: info.bio || "",
      about: info.about || "",
    },
  });

  useEffect(() => {
    if (info.name) form.setValue("name", info.name);
    if (info.bio) form.setValue("bio", info.bio);
    if (info.about) form.setValue("about", info.about);
  }, [form, info.about, info.bio, info.name]);

  const name = form.watch("name");
  const bio = form.watch("bio");
  const about = form.watch("about");

  const dataChanged = useMemo(
    () =>
      orNull(name.trim()) !== info.name ||
      orNull(bio.trim()) !== info.bio ||
      orNull(about.trim()) !== info.about,
    [about, bio, info.about, info.bio, info.name, name]
  );

  const onSuccess = useCallback(() => {
    invalidateQuery([QueryKey.FindTutorInfo, info.id]);
    invalidateQuery([QueryKey.FindCurrentUser]);
    invalidateQuery([QueryKey.FindUserTopics]);
  }, [info.id, invalidateQuery]);

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
          about: data.about.trim() !== info.bio ? data.about.trim() : undefined,
        },
      });
    },
    [info.bio, info.id, info.name, updateTutor]
  );

  return (
    <Form onSubmit={form.handleSubmit(submit)} className="flex flex-col gap-10">
      <div className="p-10 pb-0 flex justify-between">
        <TutorProfileCard
          variant="small"
          image={asFullAssetUrl(info.image)}
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
      <TutorSettingsTabs
        form={form}
        tutor={{
          name,
          bio,
          about,
          video: info.video,
        }}
      />
    </Form>
  );
};
