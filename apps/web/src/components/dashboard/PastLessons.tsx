import { useCallback, useEffect, useMemo, useState } from "react";
import { Route } from "@/types/routes";
import { useUserContext } from "@litespace/headless/context/user";
import { useInfiniteLessons } from "@litespace/headless/lessons";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { PastLessonsSummary, PastLessonsTable } from "@litespace/ui/Lessons";
import { Typography } from "@litespace/ui/Typography";
import { ILesson, IUser } from "@litespace/types";
import BookLesson from "@/components/Lessons/BookLesson";
import { InView } from "react-intersection-observer";
import { Loading } from "@litespace/ui/Loading";
import { useNavigate } from "react-router-dom";
import { useFindRoomByMembers } from "@litespace/headless/chat";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import dayjs from "dayjs";
import cn from "classnames";

function asLessons(
  list: ILesson.FindUserLessonsApiResponse["list"] | null,
  userRole: IUser.Role,
  userId: number
) {
  if (!list) return [];

  return list.map((lesson) => {
    const otherMember = lesson.members.find(
      (member) => member.userId !== userId
    );

    if (!otherMember)
      throw new Error("Other member not found; should never happen.");

    return {
      id: lesson.lesson.id,
      start: lesson.lesson.start,
      duration: lesson.lesson.duration,
      isTutor:
        userRole === IUser.Role.Tutor || userRole === IUser.Role.TutorManager,
      currentMember: userId,
      otherMember: {
        /**
         * Id of the user wheather student or tutor or tutor manager
         */
        id: otherMember.userId,
        name: otherMember.name,
        imageUrl: otherMember.image,
      },
    };
  });
}

export const PastLessons: React.FC = () => {
  const intl = useFormatMessage();
  const mq = useMediaQuery();
  const [tutor, setTutor] = useState<number | null>(null);
  const [members, setMembers] = useState<number[]>([]);

  const closeRebookingDialog = useCallback(() => {
    setTutor(null);
  }, []);

  const openRebookingDialog = useCallback((tutorId: number) => {
    setTutor(tutorId);
  }, []);

  const { user } = useUserContext();
  const now = useMemo(() => dayjs.utc().toISOString(), []);

  const lessonsQuery = useInfiniteLessons({
    users: user ? [user?.id] : [],
    userOnly: true,
    before: now,
  });

  const lessons = useMemo(
    () => (user ? asLessons(lessonsQuery.list, user.role, user.id) : []),
    [lessonsQuery.list, user]
  );

  const findRoom = useFindRoomByMembers(members);
  const [sendingMessage, setSendingMessage] = useState(0);

  const navigate = useNavigate();

  const onSendMessage = useCallback((lessonId: number, members: number[]) => {
    setMembers(members);
    setSendingMessage(lessonId);
  }, []);

  useEffect(() => {
    if (!findRoom.data?.room) return;
    setSendingMessage(0);
    navigate(`${Route.Chat}?room=${findRoom.data.room}`);
  }, [findRoom.data?.room, navigate]);

  if (!mq.lg)
    return (
      <PastLessonsSummary
        tutorsRoute={Route.Tutors}
        onRebook={openRebookingDialog}
        lessons={lessons}
        loading={lessonsQuery.query.isPending}
        error={lessonsQuery.query.isError}
        retry={lessonsQuery.query.refetch}
        isTutor={
          user?.role === IUser.Role.Tutor ||
          user?.role === IUser.Role.TutorManager
        }
        onSendMessage={onSendMessage}
        sendingMessage={sendingMessage}
        more={() => {
          if (lessonsQuery.query.hasNextPage) lessonsQuery.more();
        }}
        hasMore={lessonsQuery.query.hasNextPage}
        loadingMore={lessonsQuery.query.isFetching}
      />
    );

  return (
    <div
      className={cn(
        !mq.lg && [
          "tw-border tw-border-transparent hover:tw-border-natural-100 tw-h-min-96",
          "tw-rounded-lg tw-p-4 sm:tw-p-6 tw-shadow-ls-x-small tw-bg-natural-50",
        ]
      )}
    >
      <Typography
        element={{
          default: "body",
          sm: "subtitle-2",
        }}
        weight="bold"
        className="text-natural-950 "
      >
        {user?.role === IUser.Role.Student
          ? intl("student-dashboard.past-lessons.title")
          : intl("tutor-dashboard.past-lessons.title")}
      </Typography>

      <PastLessonsTable
        tutorsRoute={Route.Tutors}
        onRebook={openRebookingDialog}
        lessons={lessons}
        loading={lessonsQuery.query.isPending}
        error={lessonsQuery.query.isError}
        retry={lessonsQuery.query.refetch}
        isTutor={
          user?.role === IUser.Role.Tutor ||
          user?.role === IUser.Role.TutorManager
        }
        onSendMessage={onSendMessage}
        sendingMessage={sendingMessage}
      />

      {!lessonsQuery.query.isFetching && lessonsQuery.query.hasNextPage ? (
        <InView
          as="div"
          onChange={(inView) => {
            if (inView && lessonsQuery.query.hasNextPage) lessonsQuery.more();
          }}
        />
      ) : null}

      {lessonsQuery.query.isFetching && !lessonsQuery.query.isLoading ? (
        <Loading />
      ) : null}

      {tutor ? (
        <BookLesson close={closeRebookingDialog} tutorId={tutor} open />
      ) : null}
    </div>
  );
};
