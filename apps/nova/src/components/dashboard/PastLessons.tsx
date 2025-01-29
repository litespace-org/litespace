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
import dayjs from "dayjs";
import { Loading } from "@litespace/luna/Loading";
import { useNavigate } from "react-router-dom";
import { useFindRoomByMembers } from "@litespace/headless/chat";

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

  return (
    <div className="grid gap-6 ">
      <Typography
        element="subtitle-2"
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

      {lessonsQuery.query.isFetching &&
      !lessonsQuery.query.isLoading &&
      !lessonsQuery.query.error ? (
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
