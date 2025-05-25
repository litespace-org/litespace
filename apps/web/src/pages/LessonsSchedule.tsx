import React, { useCallback, useMemo, useState } from "react";
import { Calendar, LessonProps } from "@litespace/ui/Calendar";
import dayjs from "@/lib/dayjs";
import {
  useCancelLesson,
  useInfiniteLessons,
} from "@litespace/headless/lessons";
import Header, { View } from "@/components/LessonSchedule/Header";
import { AnimatePresence, motion } from "framer-motion";
import LessonsList from "@/components/UpcomingLessons/Content";
import { useUser } from "@litespace/headless/context/user";
import cn from "classnames";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import { useNavigate } from "react-router-dom";
import { CancelLesson } from "@litespace/ui/Lessons";
import ManageLesson, {
  ManageLessonPayload,
} from "@/components/Lessons/ManageLesson";
import { useToast } from "@litespace/ui/Toast";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useInvalidateQuery } from "@litespace/headless/query";
import { QueryKey } from "@litespace/headless/constants";
import { getErrorMessageId } from "@litespace/ui/errorMessage";
import { IUser } from "@litespace/types";
import { capture } from "@/lib/sentry";
import { router } from "@/lib/routes";
import { Web } from "@litespace/utils/routes";

const variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

const LessonsSchedule: React.FC = () => {
  const { md, lg } = useMediaQuery();
  const [date, setDate] = useState(dayjs().startOf("week"));
  const [view, setView] = useState<View>("list");
  const { user } = useUser();
  const navigate = useNavigate();
  const [lessonId, setLessonId] = useState<number | null>(null);
  const [manageLessonData, setManageLessonData] =
    useState<ManageLessonPayload | null>(null);
  const intl = useFormatMessage();
  const toast = useToast();
  const invalidate = useInvalidateQuery();

  const lessons = useInfiniteLessons({
    users: user ? [user.id] : [],
    userOnly: true,
    after: date.toISOString(),
    before: date.add(1, "week").toISOString(),
    full: true,
  });

  const calendarLessons: LessonProps[] = useMemo(() => {
    if (!lessons.list || !user) return [];
    return lessons.list.map(({ lesson, members }) => {
      const otherMember = members.find((member) => member.userId !== user?.id);

      if (!otherMember)
        throw new Error("Other member not found; should never happen");

      return {
        id: lesson.id,
        otherMember: {
          id: otherMember.userId,
          image: otherMember.image,
          name: otherMember.name,
        },
        canceled: !!lesson.canceledBy,
        start: lesson.start,
        end: dayjs(lesson.start).add(lesson.duration, "minutes").toISOString(),
      };
    });
  }, [lessons.list, user]);

  const onCancelSuccess = useCallback(() => {
    toast.success({ title: intl("cancel-lesson.success") });
    setLessonId(null);
    invalidate([QueryKey.FindInfiniteLessons]);
  }, [toast, intl, invalidate]);

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

  const onJoin = useCallback(
    (lessonId: number) => {
      navigate(router.web({ route: Web.Lesson, id: lessonId }));
    },
    [navigate]
  );

  const onCancel = useCallback((lessonId: number) => {
    setLessonId(lessonId);
  }, []);

  const getTutorId = useCallback(
    (lessonId: number) => {
      const item = lessons.list?.find((item) => item.lesson.id === lessonId);
      if (!item) return null;

      const tutor = item.members.find(
        (member) => member.role !== IUser.Role.Student
      );
      return tutor?.userId || null;
    },
    [lessons.list]
  );

  const onRebook = useCallback(
    (lessonId: number) => {
      const tutorId = getTutorId(lessonId);
      if (!tutorId) return;
      setManageLessonData({ type: "book", tutorId });
    },
    [getTutorId]
  );

  const onEdit = useCallback(
    (lessonId: number) => {
      // Only students can edit the time of the lesson
      if (!user || user.role !== IUser.Role.Student) return;

      const item = lessons.list?.find(({ lesson }) => lesson.id === lessonId);
      if (!item) return;

      const tutor = item.members.find(
        (member) => member.role !== IUser.Role.Student
      );
      if (!tutor) return;

      setManageLessonData({
        type: "update",
        tutorId: tutor.userId,
        duration: item.lesson.duration,
        start: item.lesson.start,
        lessonId: item.lesson.id,
        slotId: item.lesson.slotId,
      });
    },
    [lessons.list, user]
  );

  return (
    <div className="w-full p-4 md:p-6 mx-auto overflow-hidden max-w-screen-3xl">
      <div
        className={cn("mb-4 md:mb-6", {
          "rounded-b-3xl -mx-4 -mt-4 p-4 shadow-header bg-natural-50": !md,
        })}
      >
        <Header
          date={date}
          nextWeek={() => {
            setDate((prev) => prev.add(1, "week"));
          }}
          prevWeek={() => {
            setDate((prev) => prev.subtract(1, "week"));
          }}
          view={view}
          setView={setView}
        />
      </div>
      <AnimatePresence mode="wait" initial={false}>
        {view === "calendar" && lg ? (
          <motion.div
            variants={variants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <Calendar
              key="calendar"
              date={date}
              lessons={calendarLessons}
              lessonActions={{
                onJoin,
                onCancel,
                onEdit,
                onRebook,
              }}
              loading={lessons.query.isPending}
              error={lessons.query.isError}
              retry={lessons.query.refetch}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {view === "list" || !lg ? (
          <motion.div
            variants={variants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <LessonsList
              key="list"
              list={lessons.list}
              loading={lessons.query.isLoading}
              error={lessons.query.isError}
              fetching={lessons.query.isFetching && !lessons.query.isLoading}
              more={lessons.more}
              hasMore={lessons.query.hasNextPage && !lessons.query.isPending}
              refetch={lessons.query.refetch}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      {lessonId ? (
        <CancelLesson
          close={() => setLessonId(null)}
          onCancel={() => cancelLesson.mutate(lessonId)}
          loading={cancelLesson.isPending}
          open
        />
      ) : null}

      {manageLessonData ? (
        <ManageLesson
          {...manageLessonData}
          close={() => {
            setManageLessonData(null);
          }}
        />
      ) : null}
    </div>
  );
};

export default LessonsSchedule;
