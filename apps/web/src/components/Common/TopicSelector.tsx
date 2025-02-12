import { useFormatMessage } from "@litespace/ui/hooks/intl";
import React, { useCallback, useMemo, useState } from "react";
import TopicChanger from "@/components/Common/TopicChanger";
import { useTopics, useUserTopics } from "@litespace/headless/topic";
import { useUpdateUserTopics } from "@litespace/headless/user";
import { TopicSelectionDialog } from "@litespace/ui/TopicSelectionDialog";
import { useToast } from "@litespace/ui/Toast";
import { useInvalidateQuery } from "@litespace/headless/query";
import { QueryKey } from "@litespace/headless/constants";
import { useUserContext } from "@litespace/headless/context/user";
import { IUser } from "@litespace/types";

export const TopicSelector: React.FC = () => {
  const [showTopicsDialog, setShowTopoicsDialog] = useState<boolean>(false);
  const { user } = useUserContext();

  const intl = useFormatMessage();
  const toast = useToast();
  const invalidateQuery = useInvalidateQuery();

  const isStudent = useMemo(() => user?.role === IUser.Role.Student, [user]);

  const topics = useTopics({});
  const userTopics = useUserTopics();

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

  const onTopicChangeError = useCallback(() => {
    toast.error({
      title: intl("tutor-settings.personal-info.update-topics-error"),
    });
  }, [intl, toast]);

  const updateTopics = useUpdateUserTopics({
    onSuccess: onTopicChangeSuccess,
    onError: onTopicChangeError,
  });

  const refetchTopics = useCallback(() => {
    userTopics.refetch();
    topics.query.refetch();
  }, [userTopics, topics.query]);

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
    <div>
      <TopicChanger
        title={intl(
          isStudent
            ? "settings.edit.personal.topics.title"
            : "tutor-settings.personal-info.topics"
        )}
        edit={() => setShowTopoicsDialog(true)}
        topics={selectedUserTopics}
        loading={userTopics.isPending || topics.query.isPending}
        error={userTopics.isError || topics.query.isError}
        retry={refetchTopics}
      />

      {showTopicsDialog ? (
        <TopicSelectionDialog
          title={intl(
            isStudent
              ? "student-settings.topics.selection-dialog.title"
              : "tutor-settings.topics.selection-dialog.title"
          )}
          description={intl(
            isStudent
              ? "student-settings.topics.selection-dialog.description"
              : "tutor-settings.topics.selection-dialog.description"
          )}
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
      ) : null}
    </div>
  );
};
export default TopicSelector;
