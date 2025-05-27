import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Edit from "@litespace/assets/Edit";
import { TopicSelectionDialog } from "@/components/Common/TopicSelectionDialog";
import { Button } from "@litespace/ui/Button";
import { Loading, LoadingError } from "@litespace/ui/Loading";
import { useInfiniteTopics, useUserTopics } from "@litespace/headless/topic";
import { useToast } from "@litespace/ui/Toast";
import { useUpdateUserTopics } from "@litespace/headless/user";
import { useOnError } from "@/hooks/error";
import Close2 from "@litespace/assets/Close2";
import { ITopic, Void } from "@litespace/types";
import { isEmpty } from "lodash";
import { useUser } from "@litespace/headless/context/user";
import { isTutor as isUserTutor } from "@litespace/utils";
import cn from "classnames";
import AddCircle from "@litespace/assets/AddCircle";

const TopicSelection: React.FC = () => {
  const intl = useFormatMessage();
  const [showDialog, setShowDialog] = useState<boolean>(false);

  const { query: userTopicsQuery, keys: userTopicsQueryKeys } = useUserTopics();
  const {
    query: allTopicsQuery,
    keys: allTopicsQueryKeys,
    list: allTopics,
    more,
    hasMore,
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

  const onSuccess = useCallback(() => {
    userTopicsQuery.refetch();
    setShowDialog(false);
  }, [userTopicsQuery]);

  const onError = useOnError({
    type: "mutation",
    handler: ({ messageId }) => {
      toast.error({
        title: intl("shared-settings.topics.selection-dialog.update-error"),
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
      more={more}
      hasMore={hasMore}
      allTopics={allTopics}
      userTopics={userTopicsQuery.data || null}
      update={(payload: ITopic.ReplaceUserTopicsApiPayload) =>
        updateTopics.mutate(payload)
      }
      showDialog={showDialog}
      setShowDialog={setShowDialog}
      updating={updateTopics.isPending}
      loading={
        userTopicsQuery.isLoading ||
        allTopicsQuery.isLoading ||
        allTopicsQuery.isLoading
      }
      fetching={allTopicsQuery.isFetching}
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
  updating: boolean;
  hasMore: boolean;
  showDialog: boolean;
  fetching: boolean;
  setShowDialog: (val: boolean) => void;
  more: Void;
  update: (payload: ITopic.ReplaceUserTopicsApiPayload) => void;
  refetch: Void;
}> = ({
  allTopics,
  userTopics,
  loading,
  error,
  hasMore,
  updating,
  showDialog,
  fetching,
  setShowDialog,
  more,
  update,
  refetch,
}) => {
  const intl = useFormatMessage();
  const [selectedTopics, setSelectedTopics] = useState<
    ITopic.PopulatedUserTopic[]
  >([]);

  const { user } = useUser();
  const isTutor = useMemo(() => isUserTutor(user), [user]);

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

  const onRemoveTopic = useCallback(
    (id: number) => {
      if (isTutor)
        confirm(
          selectedTopics
            .filter((topic) => topic.id !== id)
            .map((topic) => topic.id)
        );

      setSelectedTopics((prev) => {
        const clone = structuredClone(prev);
        const filtered = clone.filter((topic) => topic.id !== id);
        if (isEmpty(filtered) && !isTutor) confirm([]);
        return filtered;
      });
    },
    [isTutor, confirm, selectedTopics]
  );

  return (
    <div
      className={cn("flex flex-col gap-4 grow", isTutor ? "gap-6" : "gap-4")}
    >
      <ContentHeader
        edit={() => {
          setShowDialog(true);
        }}
        canEdit
        isTutor={isTutor}
      />

      <ContentBody
        loading={loading}
        isTutor={isTutor}
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
          more={more}
          hasMore={hasMore}
          fetching={fetching}
          title={intl(
            isTutor
              ? "tutor-settings.topics.selection-dialog.title"
              : "student-settings.topics.selection-dialog.title"
          )}
          description={intl(
            isTutor
              ? "tutor-settings.topics.selection-dialog.description"
              : "student-settings.topics.selection-dialog.description"
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

const ContentHeader: React.FC<{
  canEdit: boolean;
  isTutor: boolean;
  edit: Void;
}> = ({ canEdit, isTutor, edit }) => {
  const intl = useFormatMessage();
  return (
    <div className="flex items-center justify-between">
      <Typography
        tag="h2"
        data-tutor={isTutor}
        className={cn(
          "text-natural-950 text-subtitle-2 data-[tutor=true]:text-subtitle-1 font-bold"
        )}
      >
        {intl(
          isTutor
            ? "tutor-settings.personal-info.topics"
            : "student-settings.selected-topics.title"
        )}
      </Typography>

      {canEdit ? (
        <Button
          startIcon={
            <Edit
              className={cn(
                "icon",
                isTutor ? "[&>*]:stroke-brand-700" : "[&>*]:stroke-natural-700"
              )}
            />
          }
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
  isTutor: boolean;
  save: Void;
  saving: boolean;
  onRemoveTopic: (id: number) => void;
  add: Void;
}> = ({
  loading,
  error,
  isTutor,
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
          error={intl("shared-settings.topics.selection-dialog.loading-error")}
        />
      </div>
    );

  if (isEmpty(topics))
    return (
      <div className="flex items-center justify-center mt-4">
        <Button
          onClick={add}
          endIcon={<AddCircle className="[&>*]:stroke-natural-50 w-4 h-4" />}
          type="main"
          variant="primary"
          size="large"
        >
          <Typography tag="p" className="text-body font-medium">
            {intl(
              isTutor
                ? "tutor-settings.add-topics-button.label"
                : "student-settings.add-topics-button.label"
            )}
          </Typography>
        </Button>
      </div>
    );

  return (
    <div className="grow md:grow-0 flex flex-col gap-6">
      <TopicList topics={topics} onRemove={onRemoveTopic} />

      {!isTutor ? (
        <Button
          size="large"
          loading={saving}
          disabled={saving || loading || !dataChanged}
          onClick={save}
        >
          {intl("shared-settings.save")}
        </Button>
      ) : null}
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
