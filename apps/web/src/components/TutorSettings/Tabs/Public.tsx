import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import { Controller, Label } from "@litespace/ui/Form";
import { VideoPlayer } from "@litespace/ui/VideoPlayer";
import Edit from "@litespace/assets/Edit";
import { TopicSelectionDialog } from "@litespace/ui/TopicSelectionDialog";
import { useCallback, useMemo, useState } from "react";
import { useTopics, useUserTopics } from "@litespace/headless/topic";
import { useUpdateUserTopics } from "@litespace/headless/user";
import { useToast } from "@litespace/ui/Toast";
import {
  useValidateBio,
  useValidateUserName,
} from "@litespace/ui/hooks/validation";
import { UseFormReturn } from "react-hook-form";
import { ITutorSettingsForm } from "@/components/TutorSettings/types";
import { useInvalidateQuery } from "@litespace/headless/query";
import { QueryKey } from "@litespace/headless/constants";
import { orUndefined } from "@litespace/utils/utils";
import { Void } from "@litespace/types";
import { capture } from "@/lib/sentry";
import { getErrorMessageId } from "@litespace/ui/errorMessage";

const Topics: React.FC<{
  edit: Void;
  topics: Array<{ id: number; label: string }>;
}> = ({ edit, topics }) => {
  const intl = useFormatMessage();
  return (
    <div>
      <div className="flex justify-between items-center">
        <Typography
          element="subtitle-1"
          weight="bold"
          className="text-natural-950"
        >
          {intl("tutor-settings.personal-info.topics")}
        </Typography>
        <button
          type="button"
          onClick={edit}
          className="flex gap-2 items-center"
        >
          <Typography
            element="caption"
            weight="semibold"
            className="text-brand-700"
          >
            {intl("global.labels.edit")}
          </Typography>
          <Edit width={24} height={24} className="[&>*]:stroke-brand-700" />
        </button>
      </div>
      <div className="flex gap-4 flex-wrap mt-[21px]">
        {topics.map((topic) => (
          <div className="bg-brand-700 rounded-3xl py-3 px-4" key={topic.id}>
            <Typography className="text-natural-50" element="caption">
              {topic.label}
            </Typography>
          </div>
        ))}
      </div>
    </div>
  );
};

const PublicSettings: React.FC<{
  video: string | null;
  form: UseFormReturn<ITutorSettingsForm, unknown, undefined>;
}> = ({ video, form }) => {
  const intl = useFormatMessage();
  const toast = useToast();
  const [showTopicsDialog, setShowTopoicsDialog] = useState<boolean>(false);
  const invalidateQuery = useInvalidateQuery();
  const topics = useTopics({});
  const userTopics = useUserTopics();
  const validateUserName = useValidateUserName(form.watch("name") !== null);
  const validateBio = useValidateBio(form.watch("bio") !== null);

  const allTopics = useMemo(() => {
    if (!topics.query.data) return [];
    return topics.query.data.list.map((topic) => ({
      id: topic.id,
      label: topic.name.ar,
    }));
  }, [topics.query.data]);

  const selectedUserTopics = useMemo(() => {
    if (!userTopics.data) return [];
    return userTopics.data.map((topic) => ({
      id: topic.id,
      label: topic.name.ar,
    }));
  }, [userTopics]);

  const userTopicsIds = useMemo(() => {
    if (!userTopics.data) return [];
    return userTopics.data.map((topic) => topic.id);
  }, [userTopics]);

  const onTopicChangeSuccess = useCallback(() => {
    invalidateQuery([QueryKey.FindUserTopics]);
    setShowTopoicsDialog(false);
  }, [invalidateQuery]);

  const onTopicChangeError = useCallback(
    (error: unknown) => {
      capture(error);
      toast.error({
        title: intl("tutor-settings.personal-info.update-topics-error"),
        description: intl(getErrorMessageId(error)),
      });
    },
    [intl, toast]
  );

  const updateTopics = useUpdateUserTopics({
    onSuccess: onTopicChangeSuccess,
    onError: onTopicChangeError,
  });

  const saveTopics = useCallback(
    (topicsIds: number[]) => {
      const addTopics: number[] = topicsIds.filter(
        (topic) => !userTopicsIds.includes(topic)
      );

      const removeTopics: number[] = userTopicsIds.filter(
        (topic) => !topicsIds.includes(topic)
      );

      updateTopics.mutate({
        removeTopics,
        addTopics,
      });
    },
    [updateTopics, userTopicsIds]
  );

  return (
    <div className="flex flex-col gap-6 p-10">
      <Typography
        element="subtitle-1"
        weight="bold"
        className="text-natural-950"
      >
        {intl("tutor-settings.personal-info.title")}
      </Typography>
      <div className="flex items-center gap-8">
        <div className="grow flex flex-col">
          <Label>{intl("tutor-settings.personal-info.name")}</Label>
          <Controller.Input
            value={form.watch("name")}
            control={form.control}
            rules={{ validate: validateUserName }}
            autoComplete="off"
            name="name"
          />
        </div>
        <div className="grow flex flex-col">
          <Label>{intl("tutor-settings.personal-info.bio")}</Label>
          <Controller.Input
            value={form.watch("bio")}
            control={form.control}
            rules={{ validate: validateBio }}
            autoComplete="off"
            name="bio"
          />
        </div>
      </div>

      <Topics
        edit={() => setShowTopoicsDialog(true)}
        topics={selectedUserTopics}
      />

      <Typography
        element="subtitle-1"
        weight="bold"
        className="text-natural-950"
      >
        {intl("tutor-settings.personal-info.about")}
      </Typography>

      <Controller.Textarea
        value={form.watch("about")}
        control={form.control}
        autoComplete="off"
        className="min-h-[172px]"
        name="about"
      />
      <Typography
        element="subtitle-1"
        weight="bold"
        className="text-natural-950"
      >
        {intl("tutor-settings.personal-info.video")}
      </Typography>
      <VideoPlayer src={orUndefined(video)} />

      <TopicSelectionDialog
        title={intl("tutor-settings.topics.selection-dialog.title")}
        description={intl("tutor-settings.topics.selection-dialog.description")}
        confirm={saveTopics}
        topics={allTopics}
        initialTopics={userTopicsIds}
        close={() => setShowTopoicsDialog(false)}
        opened={showTopicsDialog}
        retry={() => {
          userTopics.refetch();
          topics.query.refetch();
        }}
        loading={userTopics.isPending || topics.query.isPending}
        error={topics.query.isError || userTopics.isError}
        confirming={updateTopics.isPending}
      />
    </div>
  );
};

export default PublicSettings;
