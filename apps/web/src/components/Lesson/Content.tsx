import React, { useMemo } from "react";
import { useOnError } from "@/hooks/error";
import { useFindLesson } from "@litespace/headless/lessons";
import { IUser } from "@litespace/types";
import { Loading, LoadingError } from "@litespace/ui/Loading";
import Session from "@/components/Session";
import { RemoteMember } from "@/components/Session/types";
import { asRateLessonQuery } from "@/lib/query";
import { router } from "@/lib/routes";
import { Web } from "@litespace/utils/routes";
import { useNavigate } from "react-router-dom";

const Content: React.FC<{
  lessonId: number;
  self: IUser.Self;
}> = ({ lessonId, self }) => {
  const navigate = useNavigate();
  const lessonQuery = useFindLesson(lessonId);

  useOnError({
    type: "query",
    error: lessonQuery.error,
    keys: lessonQuery.keys,
  });

  const member = useMemo((): RemoteMember | null => {
    if (!lessonQuery.data) return null;

    const member = lessonQuery.data.members.find(
      (member) => member.userId !== self.id
    );

    if (!member) return null;

    return {
      id: member.userId,
      name: member.name,
      role: member.role,
      image: member.image,
    };
  }, [lessonQuery.data, self.id]);

  if (lessonQuery.isPending)
    return (
      <div className="mt-[15vh]">
        <Loading size="large" />
      </div>
    );

  if (lessonQuery.isError || !lessonQuery.data || !member)
    return (
      <div className="mt-[15vh] max-w-fit mx-auto">
        <LoadingError size="small" retry={lessonQuery.refetch} />
      </div>
    );

  return (
    <Session
      type="lesson"
      sessionId={lessonQuery.data.lesson.sessionId}
      localMember={self}
      remoteMember={member}
      onLeave={() => {
        if (!lessonQuery.data) return;
        const student = self.role === IUser.Role.Student;

        const query = asRateLessonQuery({
          lessonId: lessonId,
          start: lessonQuery.data.lesson.start,
          tutorId: member.id,
          tutorName: member.name,
          duration: lessonQuery.data.lesson.duration,
        });

        navigate(
          router.web({
            route: Web.UpcomingLessons,
            query: student ? query : {},
          })
        );
      }}
      start={lessonQuery.data.lesson.start}
      duration={lessonQuery.data.lesson.duration}
    />
  );
};

export default Content;
