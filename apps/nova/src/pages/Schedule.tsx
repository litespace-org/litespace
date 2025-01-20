import React, { useCallback, useMemo, useState } from "react";
import { Calendar, LessonProps } from "@litespace/luna/Calendar";
import dayjs from "@/lib/dayjs";
import { useInfiniteLessons } from "@litespace/headless/lessons";
import Header, { View } from "@/components/LessonSchedule/Header";
import { AnimatePresence, motion } from "framer-motion";
import LessonsList from "@/components/UpcomingLessons/Content";
import { useUserContext } from "@litespace/headless/context/user";

const variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

const Schedule: React.FC = () => {
  const [date, setDate] = useState(dayjs().startOf("week"));
  const [view, setView] = useState<View>("calendar");
  const { user } = useUserContext();

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

  const onJoinHandler = useCallback(
    (lessonId: number) =>
      alert(`Not implemented yet! - Lesson Id: ${lessonId}`),
    []
  );
  const onCancelHandler = useCallback(
    (lessonId: number) =>
      alert(`Not implemented yet! - Lesson Id: ${lessonId}`),
    []
  );
  const onEditHandler = useCallback(
    (lessonId: number) =>
      alert(`Not implemented yet! - Lesson Id: ${lessonId}`),
    []
  );
  const onRebookHandler = useCallback(
    (lessonId: number) =>
      alert(`Not implemented yet! - Lesson Id: ${lessonId}`),
    []
  );

  return (
    <div className="w-full p-6 mx-auto overflow-hidden max-w-screen-3xl">
      <div className="mb-8">
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
        {view === "calendar" ? (
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
                onJoin: onJoinHandler,
                onCancel: onCancelHandler,
                onEdit: onEditHandler,
                onRebook: onRebookHandler,
              }}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {view === "list" ? (
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
    </div>
  );
};

export default Schedule;
