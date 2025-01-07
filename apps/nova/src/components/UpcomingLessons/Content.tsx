import { Loader, Loading, LoadingError } from "@litespace/luna/Loading";
import {
  LessonCard,
  EmptyLessons,
  CancelLesson,
} from "@litespace/luna/Lessons";
import { asFullAssetUrl } from "@litespace/luna/backend";
import { ILesson, Void } from "@litespace/types";
import React, { useCallback, useState } from "react";
import { Route } from "@/types/routes";
import { InView } from "react-intersection-observer";
import { motion } from "framer-motion";
import { useCancelLesson } from "@litespace/headless/lessons";
import { useToast } from "@litespace/luna/Toast";
import { useQueryClient } from "@tanstack/react-query";
import { QueryKey } from "@litespace/headless/constants";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import BookLesson from "@/components/Lessons/BookLesson";
import { useUserContext } from "@litespace/headless/context/user";

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
  const queryClient = useQueryClient();
  const intl = useFormatMessage();
  const toast = useToast();
  const { user: currentUser } = useUserContext();

  const [tutorId, setTutorId] = useState<number | null>(null);
  const [lessonId, setLessonId] = useState<number | null>(null);

  const onCancelSuccess = useCallback(() => {
    toast.success({ title: intl("cancel-lesson.success") });
    setLessonId(null);
    queryClient.invalidateQueries({
      queryKey: [QueryKey.FindInfiniteLessons],
    });
  }, [toast, queryClient, intl]);

  const onCancelError = useCallback(() => {
    toast.error({ title: intl("cancel-lesson.error") });
  }, [toast, intl]);

  const cancelLesson = useCancelLesson({
    onSuccess: onCancelSuccess,
    onError: onCancelError,
  });

  const canceled = useCallback(
    (item: Lessons[0], tutor: ILesson.PopuldatedMember) => {
      if (!item.lesson.canceledBy) return null;
      if (item.lesson.canceledBy === tutor.userId) return "tutor";
      return "student";
    },
    []
  );

  if (loading)
    return (
      <div className="mt-[15vh]">
        <Loader size="large" text={intl("upcoming-lessons.loading")} />
      </div>
    );

  if (error)
    return (
      <div className="mt-[15vh]">
        <LoadingError
          size="large"
          error={intl("upcoming-lessons.loading-error")}
          retry={refetch}
        />
      </div>
    );

  if (!list) return null;

  if (!list.length)
    return (
      <div className="mt-28">
        <EmptyLessons tutorsPage={Route.Tutors} />;
      </div>
    );

  return (
    <div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(265px,1fr))] gap-x-3 gap-y-6">
        {list.map((item) => {
          const member = item.members.find(
            (member) => member.role !== currentUser?.role
          );
          if (!member) return;
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={item.lesson.id}
            >
              <LessonCard
                start={item.lesson.start}
                duration={item.lesson.duration}
                onJoin={() => console.log("join")}
                onCancel={() => setLessonId(item.lesson.id)}
                onRebook={() => setTutorId(member.userId)}
                // TODO: implement tutor sendMsg button functionality
                onSendMsg={() => console.log("Not implemented yet!")}
                canceled={canceled(item, member)}
                member={{
                  id: member.userId,
                  name: member.name,
                  image: member.image
                    ? asFullAssetUrl(member.image)
                    : undefined,
                  role: member.role === "student" ? "student" : "tutor",
                }}
              />
            </motion.div>
          );
        })}
      </div>

      {fetching ? <Loading className="mt-6 text-natural-950" /> : null}

      {!fetching ? (
        <InView
          as="div"
          onChange={(inView) => {
            if (inView && hasMore) more();
          }}
        />
      ) : null}

      {lessonId ? (
        <CancelLesson
          close={() => setLessonId(null)}
          onCancel={() => cancelLesson.mutate(lessonId)}
          loading={cancelLesson.isPending}
          open
        />
      ) : null}

      {tutorId ? (
        <BookLesson
          tutorId={tutorId}
          open={!!tutorId}
          close={() => setTutorId(null)}
        />
      ) : null}
    </div>
  );
};

export default Content;
