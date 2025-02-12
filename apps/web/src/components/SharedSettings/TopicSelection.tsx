import { useFormatMessage } from "@litespace/ui/hooks/intl";
import React, { useCallback, useMemo, useState } from "react";
import { useTopics, useUserTopics } from "@litespace/headless/topic";
import { useUpdateUserTopics } from "@litespace/headless/user";
import { TopicSelectionDialog } from "@litespace/ui/TopicSelectionDialog";
import { useToast } from "@litespace/ui/Toast";
import { useInvalidateQuery } from "@litespace/headless/query";
import { QueryKey } from "@litespace/headless/constants";
import { useUserContext } from "@litespace/headless/context/user";
import { IUser } from "@litespace/types";
import { capture } from "@/lib/sentry";
import { getErrorMessageId } from "@litespace/ui/errorMessage";
import UserTopics from "@/components/SharedSettings/UserTopics";

export const TopicSelection: React.FC = () => {
  const [showDialog, setShowDialog] = useState<boolean>(false);
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

  const onSuccess = useCallback(() => {
    invalidateQuery([QueryKey.FindUserTopics]);
    setShowDialog(false);
  }, [invalidateQuery]);

  const onError = useCallback(
    (error: unknown) => {
      capture(error);
      const errorMessage = getErrorMessageId(error);
      toast.error({
        title: intl("tutor-settings.personal-info.update-topics-error"),
        description: intl(errorMessage),
      });
    },
    [intl, toast]
  );

  const update = useUpdateUserTopics({
    onSuccess,
    onError,
  });

  const refetch = useCallback(() => {
    userTopics.refetch();
    topics.query.refetch();
  }, [userTopics, topics.query]);

  const save = useCallback(
    (topicsIds: number[]) => {
      const addTopics: number[] = topicsIds.filter(
        (topic) => !userTopicsIds.includes(topic)
      );

      const removeTopics: number[] = userTopicsIds.filter(
        (topic) => !topicsIds.includes(topic)
      );

      update.mutate({
        removeTopics,
        addTopics,
      });
    },
    [update, userTopicsIds]
  );

  return (
    <div>
      <UserTopics
        title={intl(
          isStudent
            ? "student-settings.edit.personal.topics.title"
            : "tutor-settings.personal-info.topics"
        )}
        edit={() => setShowDialog(true)}
        topics={selectedUserTopics}
        loading={userTopics.isPending || topics.query.isPending}
        error={userTopics.isError || topics.query.isError}
        retry={refetch}
      />

      {showDialog ? (
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
          confirm={save}
          topics={allTopics}
          initialTopics={userTopicsIds}
          close={() => setShowDialog(false)}
          opened={showDialog}
          retry={refetch}
          loading={userTopics.isPending || topics.query.isPending}
          error={topics.query.isError || userTopics.isError}
          confirming={update.isPending}
        />
      ) : null}
    </div>
  );
};
export default TopicSelection;
