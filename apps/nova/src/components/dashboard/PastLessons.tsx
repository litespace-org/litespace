import { Route } from "@/types/routes";
import { useUserContext } from "@litespace/headless/context/user";
import { useInfiniteLessons } from "@litespace/headless/lessons";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { PastLessonsTable } from "@litespace/luna/Lessons";
import { Typography } from "@litespace/luna/Typography";
import { ILesson, IUser } from "@litespace/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import BookLesson from "@/components/Lessons/BookLesson";
import { InView } from "react-intersection-observer";
import dayjs from "@/lib/dayjs";
import { Loading } from "@litespace/luna/Loading";
import { useFindRoomByMembers } from "@litespace/headless/chat";
import { useNavigate } from "react-router-dom";

function asLessons(
  list: ILesson.FindUserLessonsApiResponse["list"] | null,
  userRole: IUser.Role
) {
  if (!list) return [];

  return list.map((lesson) => {
    const tutor = lesson.members.find(
      (member) =>
        member.role === IUser.Role.Tutor ||
        member.role === IUser.Role.TutorManager
    );

    const student = lesson.members.find(
      (member) => member.role === IUser.Role.Student
    );

    return {
      id: lesson.lesson.id,
      start: lesson.lesson.start,
      duration: lesson.lesson.duration,
      isTutor:
        userRole === IUser.Role.Tutor || userRole === IUser.Role.TutorManager,
      currentMember:
        userRole === IUser.Role.Student
          ? student?.userId || 0
          : tutor?.userId || 0,
      otherMember: {
        /**
         * Id of the user wheather student or tutor or tutor manager
         */
        id:
          userRole === IUser.Role.Student
            ? tutor?.userId || 0
            : student?.userId || 0,
        name:
          userRole === IUser.Role.Student
            ? tutor?.name || null
            : student?.name || null,
        imageUrl:
          userRole === IUser.Role.Student
            ? tutor?.image || null
            : student?.image || null,
      },
      /**
       * id of the other member in the lesson: student when user is tutor and vice versa
       */
    };
  });
}

export const PastLessons: React.FC = () => {
  const intl = useFormatMessage();
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
    () => (user?.role ? asLessons(lessonsQuery.list, user.role) : []),
    [lessonsQuery.list, user?.role]
  );

  const findRoom = useFindRoomByMembers(members);
  const [sendingMessage, setSendingMessage] = useState(0);

  const navigate = useNavigate();

  const handleSendMessage = useCallback(
    (lessonId: number, members: number[]) => {
      setMembers(members);
      setSendingMessage(lessonId);
    },
    []
  );

  useEffect(() => {
    if (!findRoom.data?.room) return;
    setSendingMessage(0);
    navigate(`/chat?room=${findRoom.data?.room}`);
  }, [findRoom.data?.room, navigate]);

  return (
    <div className="grid gap-6 ">
      <Typography
        element="subtitle-2"
        weight="bold"
        className="text-natural-950 "
      >
        {intl("student-dashboard.previous-lessons.title")}
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
        onSendMessage={handleSendMessage}
        sendingMessage={sendingMessage}
        // setSendingMessage={setSendingMessage}
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
        <BookLesson
          close={closeRebookingDialog}
          open={!!tutor}
          tutorId={tutor}
        />
      ) : null}
    </div>
  );
};
