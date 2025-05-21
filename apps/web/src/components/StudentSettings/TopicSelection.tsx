import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Edit from "@litespace/assets/Edit";
import { TopicSelectionDialog } from "@litespace/ui/TopicSelectionDialog";
import { Button } from "@litespace/ui/Button";
import { Loading, LoadingError } from "@litespace/ui/Loading";
import { useInfiniteTopics, useUserTopics } from "@litespace/headless/topic";
import { useInvalidateQuery } from "@litespace/headless/query";
import { QueryKey } from "@litespace/headless/constants";
import { useToast } from "@litespace/ui/Toast";
import { useUpdateUserTopics } from "@litespace/headless/user";
import { useOnError } from "@/hooks/error";
import Close2 from "@litespace/assets/Close2";
import { ITopic, Void } from "@litespace/types";
import { isEmpty } from "lodash";

const TopicSelection: React.FC = () => {
  const intl = useFormatMessage();
  const { query: userTopicsQuery, keys: userTopicsQueryKeys } = useUserTopics();
  const {
    query: allTopicsQuery,
    keys: allTopicsQueryKeys,
    list: allTopics,
  } = useInfiniteTopics();

  useOnError({
    type: "query",
    error: userTopicsQuery.error,
    keys: userTopicsQueryKeys,
  });

  useOnError({
    type: "query",
    error: allTopicsQuery.error,
    keys: allTopicsQueryKeys,
  });

  const toast = useToast();
  const invalidate = useInvalidateQuery();

  const onSuccess = useCallback(() => {
    invalidate([QueryKey.FindUserTopics]);
  }, [invalidate]);

  const onError = useOnError({
    type: "mutation",
    handler: ({ messageId }) => {
      toast.error({
        title: intl("student-settings.topics.selection-dialog.update-error"),
        description: intl(messageId),
      });
    },
  });

  const updateTopics = useUpdateUserTopics({
    onSuccess,
    onError,
  });

  return (
    <Content
      allTopics={allTopics}
      userTopics={userTopicsQuery.data || null}
      update={(payload: ITopic.ReplaceUserTopicsApiPayload) =>
        updateTopics.mutate(payload)
      }
      updating={updateTopics.isPending}
      loading={allTopicsQuery.isPending || userTopicsQuery.isPending}
      error={allTopicsQuery.isError || userTopicsQuery.isError}
      refetch={() => {
        if (allTopicsQuery.isError) allTopicsQuery.refetch();
        if (userTopicsQuery.isError) userTopicsQuery.refetch();
      }}
    />
  );
};

const Content: React.FC<{
  allTopics: ITopic.Self[] | null;
  userTopics: ITopic.PopulatedUserTopic[] | null;
  loading: boolean;
  error: boolean;
  refetch: Void;
  update: (payload: ITopic.ReplaceUserTopicsApiPayload) => void;
  updating: boolean;
}> = ({ allTopics, userTopics, loading, error, refetch, update, updating }) => {
  const intl = useFormatMessage();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [selectedTopics, setSelectedTopics] = useState<
    ITopic.PopulatedUserTopic[]
  >([]);

  useEffect(() => {
    if (!userTopics) return;
    setSelectedTopics(userTopics);
  }, [userTopics]);

  const topicOptions = useMemo(() => {
    if (!allTopics) return [];
    return allTopics.map((topic) => ({
      id: topic.id,
      label: topic.name.ar,
    }));
  }, [allTopics]);

  const userTopicIds = useMemo(() => {
    if (!userTopics) return [];
    return userTopics.map((topic) => topic.id);
  }, [userTopics]);

  const dataChanged = useMemo(() => {
    return (
      !userTopicIds ||
      selectedTopics.some((topic) => !userTopicIds.includes(topic.id)) ||
      userTopicIds.some((id) => !selectedTopics.map((s) => s.id).includes(id))
    );
  }, [userTopicIds, selectedTopics]);

  const confirm = useCallback(
    (topicIds: number[]) => {
      const addTopics: number[] = topicIds.filter(
        (topic) => !userTopicIds.includes(topic)
      );

      const removeTopics: number[] = userTopicIds.filter(
        (topic) => !topicIds.includes(topic)
      );

      update({
        removeTopics,
        addTopics,
      });
    },
    [update, userTopicIds]
  );

  const onRemoveTopic = useCallback((id: number) => {
    setSelectedTopics((prev) => prev.filter((topic) => topic.id !== id));
  }, []);

  return (
    <div className="flex flex-col gap-4 grow">
      <ContentHeader
        edit={() => {
          setShowDialog(true);
        }}
        canEdit
      />

      <ContentBody
        loading={loading}
        error={error}
        refetch={refetch}
        topics={selectedTopics}
        save={() => confirm(selectedTopics.map((t) => t.id))}
        saving={updating}
        dataChanged={dataChanged}
        onRemoveTopic={onRemoveTopic}
        add={() => setShowDialog(true)}
      />

      {showDialog ? (
        <TopicSelectionDialog
          title={intl("student-settings.topics.selection-dialog.title")}
          description={intl(
            "student-settings.topics.selection-dialog.description"
          )}
          topics={topicOptions}
          initialTopics={userTopicIds}
          opened={showDialog}
          retry={refetch}
          confirming={updating}
          loading={loading}
          error={error}
          close={() => {
            setShowDialog(false);
          }}
          confirm={confirm}
        />
      ) : null}
    </div>
  );
};

const ContentHeader: React.FC<{ canEdit: boolean; edit: Void }> = ({
  canEdit,
  edit,
}) => {
  const intl = useFormatMessage();
  return (
    <div className="flex items-center justify-between">
      <Typography
        tag="h2"
        className="text-natural-950 text-subtitle-2 font-bold"
      >
        {intl("student-settings.edit.personal.topics.title")}
      </Typography>

      {canEdit ? (
        <Button
          startIcon={<Edit className="icon" />}
          variant="tertiary"
          size="medium"
          onClick={edit}
        >
          <Typography tag="span" className="text-natural-700">
            {intl("labels.update")}
          </Typography>
        </Button>
      ) : null}
    </div>
  );
};

const ContentBody: React.FC<{
  loading: boolean;
  error: boolean;
  refetch: Void;
  topics: ITopic.Self[];
  dataChanged: boolean;
  save: Void;
  saving: boolean;
  onRemoveTopic: (id: number) => void;
  add: Void;
}> = ({
  loading,
  error,
  refetch,
  topics,
  dataChanged,
  save,
  saving,
  onRemoveTopic,
  add,
}) => {
  const intl = useFormatMessage();

  if (loading) return <Loading size="medium" />;

  if (error)
    return (
      <div className="flex justify-center">
        <LoadingError
          size="small"
          retry={refetch}
          error={intl("student-settings.topics.selection-dialog.loading-error")}
        />
      </div>
    );

  if (isEmpty(topics))
    return (
      <div className="flex items-center justify-center mt-4">
        <Button onClick={add} type="main" variant="primary" size="large">
          <Typography tag="p" className="text-body font-medium">
            {intl("student-settings.add-topics-button.label")}
          </Typography>
        </Button>
      </div>
    );

  return (
    <div className="grow md:grow-0 flex flex-col gap-6">
      <TopicList topics={topics} onRemove={onRemoveTopic} />

      <Button
        size="large"
        loading={saving}
        disabled={saving || loading || !dataChanged}
        onClick={save}
      >
        {intl("shared-settings.save")}
      </Button>
    </div>
  );
};

const TopicList: React.FC<{
  topics: ITopic.Self[];
  onRemove(id: number): void;
}> = ({ topics, onRemove }) => {
  return (
    <div className="flex flex-row flex-wrap w-full gap-2 md:gap-y-4">
      {topics.map((topic) => (
        <TopicBadge
          key={topic.id}
          label={topic.name.ar}
          onRemove={() => onRemove(topic.id)}
        />
      ))}
    </div>
  );
};

const TopicBadge: React.FC<{ onRemove: Void; label: string }> = ({
  onRemove,
  label,
}) => {
  return (
    <Typography
      tag="span"
      className="bg-brand-200 border border-brand-700 items-center flex text-brand-700 p-3 md:px-3 md:py-2 rounded-[24px] text-caption font-normal"
    >
      <button onClick={onRemove} className="cursor-pointer block">
        <Close2 className="w-6 h-6 ml-[2px] [&>*]:fill-brand-700" />
      </button>

      {label}
    </Typography>
  );
};

export default TopicSelection;
