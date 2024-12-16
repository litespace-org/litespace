import { Loading } from "@litespace/luna/Loading";
import {
  LessonCard,
  EmptyLessons,
  CancelLesson,
} from "@litespace/luna/Lessons";
import { asFullAssetUrl } from "@litespace/luna/backend";
import { Element, ILesson, IUser, Void } from "@litespace/types";
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
import { useFindTutorInfo } from "@litespace/headless/tutor";

type Lessons = ILesson.FindUserLessonsApiResponse["list"];

const findTutorId = (item: Element<Lessons>) => {
  return item.members.find((member) => member.role === IUser.Role.Tutor)!
    .userId;
};

export const Content: React.FC<{
  list: Lessons | null;
  loading: boolean;
  fetching: boolean;
  error: boolean;
  hasMore: boolean;
  more: Void;
}> = ({ list, loading, fetching, error, hasMore, more }) => {
  const queryClient = useQueryClient();
  const intl = useFormatMessage();
  const toast = useToast();

  /**
   * Rebooking will set the tutor id, which in turn will result in
   * getting the tutor info  /I am fetching it again to get the notice period of the tutor/
   */
  const [tutorId, setTutorId] = useState<number | null>(null);
  const tutorInfoQuery = useFindTutorInfo(tutorId);

  const openBookingDialog = useCallback(
    (tutorId: number) => setTutorId(tutorId),
    []
  );
  const closeBookingDialog = useCallback(() => setTutorId(null), []);

  const [lessonId, setLessonId] = useState<number | null>(null);
  const closeCancellationDialog = useCallback(() => setLessonId(null), []);
  const orderCancellation = useCallback((id: number) => setLessonId(id), []);

  const onCancelSuccess = useCallback(() => {
    toast.success({ title: intl("cancel-lesson.success") });
    closeCancellationDialog();
    queryClient.invalidateQueries({
      queryKey: [QueryKey.FindInfiniteLessons],
    });
  }, [toast, closeCancellationDialog, queryClient, intl]);

  const onCancelError = useCallback(() => {
    toast.error({ title: intl("cancel-lesson.error") });
  }, [toast, intl]);

  const cancelLesson = useCancelLesson({
    onSuccess: onCancelSuccess,
    onError: onCancelError,
  });

  const canceled = useCallback(
    (item: Lessons[0], tutor: ILesson.PopuldatedMember) => {
      if (!item.lesson.canceledBy && !item.lesson.canceledBy) return null;
      if (item.lesson.canceledBy === tutor.userId) return "tutor";
      return "student";
    },
    []
  );

  if (loading) return <Loading className="h-[30vh]" />;

  // todo: add error element
  if (error) return "TODO: ERROR";

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
          const tutor = item.members.find(
            (member) => member.role === IUser.Role.Tutor
          );
          if (!tutor) return;
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
                onCancel={() => orderCancellation(item.lesson.id)}
                onRebook={() => openBookingDialog(findTutorId(item))}
                rebookLoading={
                  tutorInfoQuery.isLoading && tutorId === findTutorId(item)
                }
                canceled={canceled(item, tutor)}
                tutor={{
                  id: tutor.userId,
                  name: tutor.name,
                  image: tutor.image ? asFullAssetUrl(tutor.image) : undefined,
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
          close={closeCancellationDialog}
          id={lessonId}
          onCancel={() => cancelLesson.mutate(lessonId)}
        />
      ) : null}

      {tutorId && !tutorInfoQuery.isLoading ? (
        <BookLesson
          user={{
            ...tutorInfoQuery.data!,
            tutorId: tutorInfoQuery.data!.id,
            imageUrl: tutorInfoQuery.data!.image,
            notice: tutorInfoQuery.data!.notice || 30,
          }}
          open={!!tutorId}
          close={closeBookingDialog}
        />
      ) : null}
    </div>
  );
};

export default Content;
