import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import React, { useCallback, useMemo, useState } from "react";
import Edit from "@litespace/assets/Edit";
import { TopicSelectionDialog } from "@litespace/ui/TopicSelectionDialog";
import { Animate } from "@/components/Common/Animate";
import { isEmpty } from "lodash";
import { Button } from "@litespace/ui/Button";
import AddCircle from "@litespace/assets/AddCircle";
import { Loader, LoadingError } from "@litespace/ui/Loading";
import { useTopics, useUserTopics } from "@litespace/headless/topic";
import { useInvalidateQuery } from "@litespace/headless/query";
import { QueryKey } from "@litespace/headless/constants";
import { useToast } from "@litespace/ui/Toast";
import { useUpdateUserTopics } from "@litespace/headless/user";
import { getErrorMessageId } from "@litespace/ui/errorMessage";

const TopicSelection: React.FC = () => {
  const intl = useFormatMessage();
  const allTopicsQuery = useTopics({});
  const userTopicsQuery = useUserTopics();
  const [showDialog, setShowDialog] = useState(false);
  const toast = useToast();
  const invalidate = useInvalidateQuery();

  const topicOptions = useMemo(() => {
    if (!allTopicsQuery.query.data?.list) return [];
    return allTopicsQuery.query.data.list.map((topic) => ({
      id: topic.id,
      label: topic.name.ar,
    }));
  }, [allTopicsQuery]);

  const userTopicIds = useMemo(() => {
    if (!userTopicsQuery.data) return [];
    return userTopicsQuery.data.map((topic) => topic.id);
  }, [userTopicsQuery.data]);

  const onSuccess = useCallback(() => {
    invalidate([QueryKey.FindUserTopics]);
    setShowDialog(false);
  }, [invalidate]);

  const onError = useCallback(
    (error: unknown) => {
      toast.error({
        title: intl("student-settings.topics.selection-dialog.update-error"),
        description: intl(getErrorMessageId(error)),
      });
    },
    [intl, toast]
  );

  const updateTopics = useUpdateUserTopics({
    onSuccess: onSuccess,
    onError: onError,
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

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex items-center justify-between">
        <Typography
          element={{ default: "caption", lg: "subtitle-2" }}
          className="text-natural-950"
          weight="bold"
        >
          {intl("student-settings.edit.personal.topics.title")}
        </Typography>

        {!isEmpty(userTopicIds) ? (
          <button
            type="button"
            onClick={() => {
              setShowDialog(true);
            }}
          >
            <Typography
              element="caption"
              weight="semibold"
              className="flex text-brand-700"
            >
              {intl("labels.update")}
              <Edit className="w-6 h-6 mr-2" />
            </Typography>
          </button>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Typography
          element="subtitle-2"
          weight="regular"
          className="text-natural-950 hidden"
        >
          {intl("student-settings.edit.personal.topics")}
        </Typography>

        {userTopicsQuery.isPending ? (
          <div className="mt-6 sm:mt-8">
            <Loader
              size="small"
              text={intl("student-settings.topics.selection-dialog.loading")}
            />
          </div>
        ) : null}

        {userTopicsQuery.isError && !userTopicsQuery.isPending ? (
          <div className="mt-6 sm:mt-8">
            <LoadingError
              size="small"
              retry={userTopicsQuery.refetch}
              error={intl(
                "student-settings.topics.selection-dialog.loading-error"
              )}
            />
          </div>
        ) : null}

        {!userTopicsQuery.isPending && !userTopicsQuery.isError ? (
          <div className="flex flex-row flex-wrap w-full gap-2">
            {userTopicsQuery.data && !isEmpty(userTopicsQuery.data) ? (
              userTopicsQuery.data.map((topic) => (
                <div className="my-3" key={topic.id}>
                  <Animate>
                    <Typography
                      element="caption"
                      weight="regular"
                      className="bg-brand-700 text-natural-50 px-4 py-3 rounded-[24px]"
                    >
                      {topic.name.ar}
                    </Typography>
                  </Animate>
                </div>
              ))
            ) : (
              <div className="flex justify-center w-full my-3">
                <Animate>
                  <Button
                    size="large"
                    endIcon={
                      <AddCircle className="[&>*]:tw-stroke-natural-50 tw-w-4 tw-h-4" />
                    }
                    onClick={() => setShowDialog(true)}
                  >
                    <Typography
                      element={{
                        default: "tiny-text",
                        sm: "caption",
                        md: "body",
                      }}
                      weight="medium"
                    >
                      {intl("student-settings.add-topics-button.label")}
                    </Typography>
                  </Button>
                </Animate>
              </div>
            )}
          </div>
        ) : null}
      </div>

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
        confirming={updateTopics.isPending}
        loading={userTopicsQuery.isPending || allTopicsQuery.query.isPending}
        error={userTopicsQuery.isError || allTopicsQuery.query.isError}
        close={() => {
          setShowDialog(false);
        }}
        confirm={confirm}
      />
    </div>
  );
};
export default TopicSelection;
