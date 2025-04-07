import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import { Controller } from "@litespace/ui/Form";
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
import { Void } from "@litespace/types";
import { capture } from "@/lib/sentry";
import { getErrorMessageId } from "@litespace/ui/errorMessage";
import { isEmpty } from "lodash";
import { Button } from "@litespace/ui/Button";
import AddCircle from "@litespace/assets/AddCircle";
import { Loader, LoadingError } from "@litespace/ui/Loading";

const Topics: React.FC<{
  edit: Void;
  topics: Array<{ id: number; label: string }>;
  loading: boolean;
  error: boolean;
  retry: Void;
}> = ({ edit, topics, loading, error, retry }) => {
  const intl = useFormatMessage();
  return (
    <div>
      <div className="flex justify-between items-center">
        <Typography
          tag="h2"
          className="text-natural-950 text-subtitle-2 md:text-body lg:text-subtitle-1 font-bold"
        >
          {intl("tutor-settings.personal-info.topics")}
        </Typography>
        <button
          type="button"
          onClick={edit}
          className="flex gap-2 items-center"
        >
          <Typography
            tag="span"
            className="text-brand-700 text-caption font-semibold"
          >
            {intl("global.labels.edit")}
          </Typography>
          <Edit className="w-6 h-6 [&>*]:stroke-brand-700" />
        </button>
      </div>
      <div className="flex gap-2 lg:gap-4 flex-wrap mt-4 lg:mt-6">
        {loading ? (
          <div className="w-full flex justify-center md:mt-8 lg:mt-2 lg:mb-8">
            <Loader size="small" text={intl("tutor-settings.topics.loading")} />
          </div>
        ) : null}
        {error ? (
          <div className="w-full flex justify-center">
            <LoadingError
              error={intl("tutor-settings.topics.error")}
              retry={retry}
              size="small"
            />
          </div>
        ) : null}

        {!loading && !error && isEmpty(topics) ? (
          <Button
            size="large"
            onClick={edit}
            endIcon={
              <AddCircle className="h-4 w-4 lg:h-6 lg:w-6 lg:-translate-y-[3px]" />
            }
            className="mx-auto mt-[34px] md:mt-[37px] md:mb-[29px] lg:mt-[17px] lg:mb-[41px] lg:h-14 lg:px-8"
          >
            <Typography tag="p" className="text-body font-medium lg:font-bold">
              {intl("tutor-settings.topics.selection-dialog.trigger")}
            </Typography>
          </Button>
        ) : null}

        {!loading && !error && !isEmpty(topics)
          ? topics.map((topic) => (
              <div
                className="bg-brand-700 rounded-3xl p-3 md:py-3 md:px-4"
                key={topic.id}
              >
                <Typography tag="span" className="text-natural-50 text-caption">
                  {topic.label}
                </Typography>
              </div>
            ))
          : null}
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
  const { query: userTopics } = useUserTopics();
  const validateUserName = useValidateUserName(form.watch("name") !== null);
  const validateBio = useValidateBio(form.watch("bio") !== null);
  const errors = form.formState.errors;

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
    <div className="flex flex-col gap-6 lg:gap-6 pt-4 md:pt-6 md:px-10 md:pb-10 lg:p-10">
      <Typography
        tag="h1"
        className="text-natural-950 text-subtitle-2 md:text-body lg:text-subtitle-1 font-bold"
      >
        {intl("tutor-settings.personal-info.title")}
      </Typography>
      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8 -mt-2 lg:mt-0">
        <Controller.Input
          id="name"
          value={form.watch("name")}
          control={form.control}
          rules={{ validate: validateUserName }}
          autoComplete="off"
          label={intl("tutor-settings.personal-info.name")}
          name="name"
          state={errors.name ? "error" : undefined}
          helper={errors.name?.message}
        />
        <Controller.Input
          id="bio"
          value={form.watch("bio")}
          control={form.control}
          rules={{ validate: validateBio }}
          autoComplete="off"
          label={intl("tutor-settings.personal-info.bio")}
          state={errors.bio ? "error" : undefined}
          helper={errors.bio?.message}
          name="bio"
        />
      </div>

      <Topics
        edit={() => setShowTopoicsDialog(true)}
        topics={selectedUserTopics}
        error={userTopics.isError}
        loading={userTopics.isLoading}
        retry={userTopics.refetch}
      />

      <Controller.Textarea
        id="about"
        value={form.watch("about")}
        control={form.control}
        autoComplete="off"
        className="min-h-[172px]"
        name="about"
        label={intl("tutor-settings.personal-info.about")}
        state={errors.about ? "error" : undefined}
        helper={errors.about?.message}
      />

      {video ? (
        <div>
          <Typography
            tag="h2"
            className="-mb-2 lg:mb-0 text-natural-950 text-subtitle-2 md:text-body lg:text-subtitle-1 font-bold"
          >
            {intl("tutor-settings.personal-info.video")}
          </Typography>

          <VideoPlayer src={video} />
        </div>
      ) : null}

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
