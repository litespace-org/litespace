import { useOnError } from "@/hooks/error";
import { useFindLesson } from "@litespace/headless/lessons";
import { useLogger } from "@litespace/headless/logger";
import { IUser } from "@litespace/types";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Loader, LoadingError } from "@litespace/ui/Loading";
import React, { useMemo } from "react";
import Session from "@/components/Session";
import { asRateLessonQuery } from "@/lib/query";
import { router } from "@/lib/routes";
import { Web } from "@litespace/utils/routes";
import { useNavigate } from "react-router-dom";

const Content: React.FC<{ lessonId: number; self: IUser.Self }> = ({
  lessonId,
  self,
}) => {
  const navigate = useNavigate();
  const intl = useFormatMessage();
  const { query: lesson, keys } = useFindLesson(lessonId);
  const logger = useLogger();

  useOnError({
    type: "query",
    error: lesson.error,
    keys,
  });

  const member = useMemo(() => {
    if (!lesson.data) return;

    const member = lesson.data.members.find(
      (member) => member.userId !== self.id
    );

    if (!member)
      return logger.error(
        "The other member is not found; should never happen.",
        lesson.data
      );

    return member;
  }, [lesson.data, logger, self.id]);

  if (lesson.isPending || lesson.isLoading)
    return (
      <div className="mt-[15vh]">
        <Loader size="small" text={intl("lesson.loading")} />
      </div>
    );

  if (lesson.isError || !lesson.data || !member)
    return (
      <div className="mt-[15vh] max-w-fit mx-auto">
        <LoadingError
          size="small"
          retry={lesson.refetch}
          error={intl("lesson.loading-error")}
        />
      </div>
    );

  return (
    <Session
      self={self}
      type="lesson"
      resourceId={lessonId}
      sessionId={lesson.data.lesson.sessionId}
      start={lesson.data.lesson.start}
      duration={lesson.data.lesson.duration}
      member={{
        id: member.userId,
        name: member.name,
        gender: IUser.Gender.Male,
        role: member.role,
        image: member.image,
      }}
      onLeave={() => {
        if (!lesson.data) return;
        const student = self.role === IUser.Role.Student;

        const query = asRateLessonQuery({
          lessonId: lessonId,
          start: lesson.data.lesson.start,
          tutorId: member.userId,
          tutorName: member.name,
          duration: lesson.data.lesson.duration,
        });

        navigate(
          router.web({
            route: Web.UpcomingLessons,
            query: student ? query : {},
          })
        );
      }}
    />
  );
};

export default Content;
