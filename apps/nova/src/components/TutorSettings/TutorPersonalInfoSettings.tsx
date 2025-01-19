import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { Typography } from "@litespace/luna/Typography";
import { Controller, Label } from "@litespace/luna/Form";
import { VideoPlayer } from "@litespace/luna/VideoPlayer";
import Edit from "@litespace/assets/Edit";
import { TopicSelectionDialog } from "@litespace/luna/TopicSelectionDialog";
import { useCallback, useMemo, useState } from "react";
import { useTopics } from "@litespace/headless/topic";
import { useUpdateUserTopics } from "@litespace/headless/user";
import { useToast } from "@litespace/luna/Toast";
import { useValidation } from "@litespace/luna/hooks/validation";
import { UseFormReturn } from "react-hook-form";
import { ITutorSettingsForm } from "@/components/TutorSettings/types";
import { useInvalidateQuery } from "@litespace/headless/query";
import { QueryKey } from "@litespace/headless/constants";

export const TutorPersonalInfoSettings: React.FC<{
  tutor: {
    video: string | null;
    name: string | null;
    bio: string | null;
    about: string | null;
    topics: { id: number; label: string }[];
  };
  form: UseFormReturn<ITutorSettingsForm, unknown, undefined>;
}> = ({ tutor, form }) => {
  const intl = useFormatMessage();
  const toast = useToast();
  const [topicsDialogOpen, setTopicsDialogOpen] = useState<boolean>(false);

  const closeDialog = useCallback(() => setTopicsDialogOpen(false), []);
  const openDialog = useCallback(() => setTopicsDialogOpen(true), []);

  const validate = useValidation();
  const invalidateQuery = useInvalidateQuery();

  const topics = useTopics({});

  const allTopics = useMemo(() => {
    if (!topics.query.data) return [];
    return topics.query.data.list.map((topic) => ({
      id: topic.id,
      label: topic.name.ar,
    }));
  }, [topics.query.data]);

  const userTopicsIds = useMemo(() => {
    return tutor.topics.map((topic) => topic.id);
  }, [tutor.topics]);

  const onTopicChangeSuccess = useCallback(() => {
    invalidateQuery([QueryKey.FindUserTopics]);
    closeDialog();
  }, [invalidateQuery, closeDialog]);

  const onTopicChangeError = useCallback(() => {
    toast.error({
      title: intl("tutor-settings.personal-info.update-topics-error"),
    });
  }, [intl, toast]);

  const updateTopics = useUpdateUserTopics({
    onSuccess: onTopicChangeSuccess,
    onError: onTopicChangeError,
  });

  const changeTopics = useCallback(
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
            rules={{ ...validate.name.ar }}
            autoComplete="off"
            name="name"
          />
        </div>
        <div className="grow flex flex-col">
          <Label>{intl("tutor-settings.personal-info.bio")}</Label>
          <Controller.Input
            value={form.watch("bio")}
            control={form.control}
            rules={{ ...validate.bio }}
            autoComplete="off"
            name="bio"
          />
        </div>
      </div>
      <div>
        <div className="flex justify-between items-center">
          <Typography
            element="subtitle-1"
            weight="bold"
            className="text-natural-950"
          >
            {intl("tutor-settings.personal-info.topics")}
          </Typography>
          <div
            role="button"
            onClick={openDialog}
            className="flex gap-2 items-center"
          >
            <Typography
              element="caption"
              weight="semibold"
              className="text-brand-700"
            >
              {intl("global.labels.edit")}
            </Typography>
            <Edit className="[&>*]:stroke-brand-700" />
          </div>
        </div>
        <div className="flex gap-4 flex-wrap mt-[21px]">
          {tutor.topics.map((topic, index) => (
            <div className="bg-brand-700  rounded-3xl py-3 px-4" key={index}>
              <Typography className="text-natural-50" element="caption">
                {topic.label}
              </Typography>
            </div>
          ))}
        </div>
      </div>
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
        rules={{ ...validate.about }}
        name="about"
        className="min-h-[172px]"
      />
      <Typography
        element="subtitle-1"
        weight="bold"
        className="text-natural-950"
      >
        {intl("tutor-settings.personal-info.video")}
      </Typography>
      <VideoPlayer src={tutor.video || ""} />
      <TopicSelectionDialog
        confirm={changeTopics}
        topics={allTopics}
        selectedTopicIds={userTopicsIds}
        close={closeDialog}
        opened={topicsDialogOpen}
        retry={() => topics.query.refetch()}
      />
    </div>
  );
};
