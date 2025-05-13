import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Edit from "@litespace/assets/Edit";
import { TopicSelectionDialog } from "@litespace/ui/TopicSelectionDialog";
import { Animate } from "@/components/Common/Animate";
import { isEmpty } from "lodash";
import { Button } from "@litespace/ui/Button";
import AddCircle from "@litespace/assets/AddCircle";
import { Loading, LoadingError } from "@litespace/ui/Loading";
import { useTopics, useUserTopics } from "@litespace/headless/topic";
import { useInvalidateQuery } from "@litespace/headless/query";
import { QueryKey } from "@litespace/headless/constants";
import { useToast } from "@litespace/ui/Toast";
import { useUpdateUserTopics } from "@litespace/headless/user";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import { useOnError } from "@/hooks/error";
import Close2 from "@litespace/assets/Close2";
import { ITopic } from "@litespace/types";
import { UseQueryResult } from "@tanstack/react-query";

const TopicSelection: React.FC = () => {
  const intl = useFormatMessage();
  const mq = useMediaQuery();
  const { query: userTopicsQuery } = useUserTopics();
  const [showDialog, setShowDialog] = useState(false);
  const toast = useToast();
  const invalidate = useInvalidateQuery();
  const [selectedTopics, setSelectedTopics] = useState<
    ITopic.PopulatedUserTopic[]
  >([]);

  const userTopicIds = useMemo(() => {
    if (!userTopicsQuery.data) return [];
    return userTopicsQuery.data.map((topic) => topic.id);
  }, [userTopicsQuery.data]);

  useEffect(() => {
    if (!userTopicsQuery.data) return;
    setSelectedTopics(userTopicsQuery.data);
  }, [userTopicsQuery.data]);

  const dataChanged = useMemo(() => {
    return (
      !userTopicIds ||
      selectedTopics.some((topic) => !userTopicIds.includes(topic.id)) ||
      userTopicIds.some((id) => !selectedTopics.map((s) => s.id).includes(id))
    );
  }, [userTopicIds, selectedTopics]);

  const onRemoveTopic = useCallback((id: number) => {
    setSelectedTopics((prev) => prev.filter((topic) => topic.id !== id));
  }, []);

  const onSuccess = useCallback(() => {
    invalidate([QueryKey.FindUserTopics]);
    setShowDialog(false);
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

  const confirm = useCallback(
    (topicIds: number[]) => {
      const addTopics: number[] = topicIds.filter(
        (topic) => !userTopicIds.includes(topic)
      );

      const removeTopics: number[] = userTopicIds.filter(
        (topic) => !topicIds.includes(topic)
      );

      updateTopics.mutate({
        removeTopics,
        addTopics,
      });
    },
    [updateTopics, userTopicIds]
  );

  if (userTopicsQuery.isPending)
    return (
      <TopicSelectionTemplate
        confirm={confirm}
        isUpdating={updateTopics.isPending}
        setShowDialog={setShowDialog}
        showDialog={showDialog}
        userTopicsQuery={userTopicsQuery}
        userTopicIds={userTopicIds}
      >
        <Loading
          size="small"
          text={intl("student-settings.topics.selection-dialog.loading")}
        />
      </TopicSelectionTemplate>
    );

  if (userTopicsQuery.isError && !userTopicsQuery.isPending)
    return (
      <TopicSelectionTemplate
        confirm={confirm}
        isUpdating={updateTopics.isPending}
        setShowDialog={setShowDialog}
        showDialog={showDialog}
        userTopicsQuery={userTopicsQuery}
        userTopicIds={userTopicIds}
      >
        <div className="flex justify-center">
          <LoadingError
            size="small"
            retry={userTopicsQuery.refetch}
            error={intl(
              "student-settings.topics.selection-dialog.loading-error"
            )}
          />
        </div>
      </TopicSelectionTemplate>
    );

  if (isEmpty(selectedTopics))
    return (
      <TopicSelectionTemplate
        confirm={confirm}
        isUpdating={updateTopics.isPending}
        setShowDialog={setShowDialog}
        showDialog={showDialog}
        userTopicsQuery={userTopicsQuery}
        userTopicIds={userTopicIds}
      >
        <div className="flex justify-center w-full my-2">
          <Animate>
            <Button
              size={mq.lg ? "large" : "medium"}
              endIcon={
                <AddCircle className="[&>*]:stroke-natural-50 w-4 h-4" />
              }
              onClick={() => setShowDialog(true)}
            >
              <Typography
                tag="span"
                className="text-tiny md:text-caption lg:text-body font-medium"
              >
                {intl("student-settings.add-topics-button.label")}
              </Typography>
            </Button>
          </Animate>
        </div>
      </TopicSelectionTemplate>
    );

  return (
    <TopicSelectionTemplate
      confirm={confirm}
      isUpdating={updateTopics.isPending}
      setShowDialog={setShowDialog}
      showDialog={showDialog}
      userTopicsQuery={userTopicsQuery}
      userTopicIds={userTopicIds}
    >
      <div className="grow md:grow-0 flex flex-col justify-between md:justify-start">
        <div className="flex flex-row flex-wrap w-full gap-2 md:gap-y-4">
          {selectedTopics.map((topic) => (
            <Animate key={topic.id}>
              <Typography
                tag="span"
                className="bg-brand-200 border border-brand-700 items-center flex text-brand-700 p-3 md:px-3 md:py-2 rounded-[24px] text-caption font-normal"
              >
                <button
                  onClick={() => onRemoveTopic(topic.id)}
                  className="cursor-pointer hidden md:block"
                >
                  <Close2 className="w-6 h-6 ml-[2px] [&>*]:fill-brand-700" />
                </button>
                {topic.name.ar}
              </Typography>
            </Animate>
          ))}
        </div>
        <Button
          size="large"
          disabled={updateTopics.isPending || !dataChanged}
          onClick={() => confirm(selectedTopics.map((s) => s.id))}
          className="md:mt-10 mr-auto md:mr-0"
        >
          {intl("shared-settings.save")}
        </Button>
      </div>
    </TopicSelectionTemplate>
  );
};

const TopicSelectionTemplate = ({
  userTopicIds,
  setShowDialog,
  showDialog,
  confirm,
  userTopicsQuery,
  isUpdating,

  children,
}: {
  userTopicIds: number[];
  setShowDialog: (val: boolean) => void;
  showDialog: boolean;
  confirm: (topicIds: number[]) => void;
  userTopicsQuery: UseQueryResult<ITopic.FindUserTopicsApiResponse, Error>;
  isUpdating: boolean;
  children: React.ReactNode;
}) => {
  const intl = useFormatMessage();
  const allTopicsQuery = useTopics({});
  const topicOptions = useMemo(() => {
    if (!allTopicsQuery.query.data?.list) return [];
    return allTopicsQuery.query.data.list.map((topic) => ({
      id: topic.id,
      label: topic.name.ar,
    }));
  }, [allTopicsQuery]);

  return (
    <div className="flex flex-col gap-4 grow">
      <div className="flex items-center justify-between">
        <Typography
          tag="h2"
          className="text-natural-950 text-subtitle-2 font-bold"
        >
          {intl("student-settings.edit.personal.topics.title")}
        </Typography>

        {!isEmpty(userTopicIds) ? (
          <button type="button" onClick={() => setShowDialog(true)}>
            <Typography
              tag="span"
              className="flex text-brand-700 text-caption font-semibold"
            >
              <Edit className="w-6 h-6 ml-2 [&>*]:stroke-brand-700" />
              {intl("labels.update")}
            </Typography>
          </button>
        ) : null}
      </div>

      {children}

      {showDialog ? (
        <TopicSelectionDialog
          title={intl("student-settings.topics.selection-dialog.title")}
          description={intl(
            "student-settings.topics.selection-dialog.description"
          )}
          topics={topicOptions}
          initialTopics={userTopicIds}
          opened={showDialog}
          retry={() => {
            if (allTopicsQuery.query.isError) allTopicsQuery.query.refetch();
            if (userTopicsQuery.isError) userTopicsQuery.refetch();
          }}
          confirming={isUpdating}
          loading={userTopicsQuery.isPending || allTopicsQuery.query.isPending}
          error={userTopicsQuery.isError || allTopicsQuery.query.isError}
          close={() => {
            setShowDialog(false);
          }}
          confirm={confirm}
        />
      ) : null}
    </div>
  );
};

export default TopicSelection;
