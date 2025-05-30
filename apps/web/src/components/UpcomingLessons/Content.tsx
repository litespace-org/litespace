import { Loading, LoadingError } from "@litespace/ui/Loading";
import { LessonCard, EmptyLessons, CancelLesson } from "@litespace/ui/Lessons";
import { ILesson, IUser, Void } from "@litespace/types";
import React, { useCallback, useState } from "react";
import { InView } from "react-intersection-observer";
import { motion } from "framer-motion";
import { useCancelLesson } from "@litespace/headless/lessons";
import { useToast } from "@litespace/ui/Toast";
import { useQueryClient } from "@tanstack/react-query";
import { QueryKey } from "@litespace/headless/constants";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import ManageLesson, {
  ManageLessonPayload,
} from "@/components/Lessons/ManageLesson";
import { useUser } from "@litespace/headless/context/user";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import { getErrorMessageId } from "@litespace/ui/errorMessage";
import { useNavigateToRoom } from "@/hooks/chat";
import { useNavigate } from "react-router-dom";
import { capture } from "@/lib/sentry";
import { Web } from "@litespace/utils/routes";
import { router } from "@/lib/routes";
import { isStudent } from "@litespace/utils/user";
import { useEnableNotificationsToastAction } from "@/hooks/notification";

type Lessons = ILesson.FindUserLessonsApiResponse["list"];

export const Content: React.FC<{
  list: Lessons | null;
  loading: boolean;
  fetching: boolean;
  error: boolean;
  hasMore: boolean;
  more: Void;
  refetch: Void;
}> = ({ list, loading, fetching, error, hasMore, more, refetch }) => {
  const { lg } = useMediaQuery();
  const queryClient = useQueryClient();
  const intl = useFormatMessage();
  const toast = useToast();
  const { user } = useUser();
  const navigate = useNavigate();
  const enableNotifications = useEnableNotificationsToastAction();

  const [cancelLessonId, setCancelLessonId] = useState<number | null>(null);
  const [manageLessonData, setManageLessonData] =
    useState<ManageLessonPayload | null>(null);

  const onCancelSuccess = useCallback(() => {
    toast.success({
      title: intl("cancel-lesson.success"),
      actions: enableNotifications.show ? [enableNotifications.action] : [],
    });
    setCancelLessonId(null);
    queryClient.invalidateQueries({
      queryKey: [QueryKey.FindInfiniteLessons],
    });
  }, [
    toast,
    intl,
    enableNotifications.show,
    enableNotifications.action,
    queryClient,
  ]);

  const onCancelError = useCallback(
    (error: unknown) => {
      capture(error);
      const errorMessage = getErrorMessageId(error);
      toast.error({
        title: intl("cancel-lesson.error"),
        description: intl(errorMessage),
      });
    },
    [toast, intl]
  );

  const cancelLesson = useCancelLesson({
    onSuccess: onCancelSuccess,
    onError: onCancelError,
  });

  const getCancellerRole = useCallback(
    (canceledBy: number | null, tutorId: number) => {
      if (!canceledBy) return null;
      if (canceledBy === tutorId) return "tutor";
      return "student";
    },
    []
  );

  const { lessonId: sendingMessageLessonId, onSendMessage } =
    useNavigateToRoom();

  if (loading)
    return (
      <div className="mt-[15vh]">
        <Loading
          size={lg ? "large" : "small"}
          text={intl("upcoming-lessons.loading")}
        />
      </div>
    );

  if (error)
    return (
      <div className="mt-[15vh] mx-auto max-w-fit">
        <LoadingError
          size={lg ? "large" : "small"}
          error={intl("upcoming-lessons.loading-error")}
          retry={refetch}
        />
      </div>
    );

  if (!list || !list.length || !user)
    return (
      <div className="mt-[15vh]">
        <EmptyLessons tutorsPage={Web.Tutors} isStudent={isStudent(user)} />;
      </div>
    );

  return (
    <div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(265px,1fr))] gap-x-2 md:gap-x-3 gap-y-4 md:gap-y-6">
        {list.map((item) => {
          const tutor = item.members.find(
            (member) =>
              member.role === IUser.Role.Tutor ||
              member.role === IUser.Role.TutorManager
          );

          const otherMember = item.members.find(
            (member) => member.role !== user.role
          );

          if (!tutor || !otherMember) return null;
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={item.lesson.id}
            >
              <LessonCard
                start={item.lesson.start}
                duration={item.lesson.duration}
                onJoin={() =>
                  navigate(
                    router.web({
                      route: Web.Lesson,
                      id: item.lesson.id,
                    })
                  )
                }
                onCancel={() => setCancelLessonId(item.lesson.id)}
                onEdit={() => {
                  setManageLessonData({
                    type: "update",
                    lessonId: item.lesson.id,
                    slotId: item.lesson.slotId,
                    start: item.lesson.start,
                    duration: item.lesson.duration,
                    tutorId: tutor.userId,
                  });
                }}
                onRebook={() =>
                  setManageLessonData({ type: "book", tutorId: tutor.userId })
                }
                onSendMsg={() =>
                  onSendMessage(item.lesson.id, [user.id, otherMember?.userId])
                }
                canceled={getCancellerRole(
                  item.lesson.canceledBy,
                  tutor.userId
                )}
                member={{
                  id: otherMember.userId,
                  name: otherMember.name,
                  image: otherMember.image,
                  role:
                    otherMember.role === IUser.Role.Student
                      ? "student"
                      : "tutor",
                }}
                sendingMessage={sendingMessageLessonId === item.lesson.id}
                disabled={!!sendingMessageLessonId}
              />
            </motion.div>
          );
        })}
      </div>

      {fetching ? (
        <div className="mt-6">
          <Loading />
        </div>
      ) : null}

      {!fetching ? (
        <InView
          as="div"
          onChange={(inView) => {
            if (inView && hasMore) more();
          }}
        />
      ) : null}

      {cancelLessonId ? (
        <CancelLesson
          close={() => setCancelLessonId(null)}
          onCancel={() => cancelLesson.mutate(cancelLessonId)}
          loading={cancelLesson.isPending}
          open
        />
      ) : null}

      {manageLessonData ? (
        <ManageLesson
          close={() => {
            setManageLessonData(null);
          }}
          {...manageLessonData}
        />
      ) : null}
    </div>
  );
};

export default Content;
