import React, { useMemo } from "react";
import { useOnError } from "@/hooks/error";
import { useFindLesson } from "@litespace/headless/lessons";
import { useGetSessionToken } from "@litespace/headless/sessions";
import { IUser } from "@litespace/types";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Loading, LoadingError } from "@litespace/ui/Loading";
import { optional } from "@litespace/utils";
import Session from "@/components/SessionV3";
import { RemoteMember } from "@/components/SessionV3/types";
import { asRateLessonQuery } from "@/lib/query";
import { router } from "@/lib/routes";
import { Web } from "@litespace/utils/routes";
import { useNavigate } from "react-router-dom";

const Content: React.FC<{
  lessonId: number;
  self: IUser.Self;
}> = ({ lessonId, self }) => {
  const navigate = useNavigate();
  const intl = useFormatMessage();
  const { query: lessonQuery, keys: lessonQueryKeys } = useFindLesson(lessonId);
  const { query: tokenQuery, keys: tokenQueryKeys } = useGetSessionToken(
    optional(lessonQuery.data?.lesson.sessionId)
  );

  useOnError({
    type: "query",
    error: lessonQuery.error,
    keys: lessonQueryKeys,
  });

  useOnError({
    type: "query",
    error: tokenQuery.error,
    keys: tokenQueryKeys,
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
      gender: IUser.Gender.Male,
      role: member.role,
      image: member.image,
    };
  }, [lessonQuery.data, self.id]);

  if (lessonQuery.isPending || tokenQuery.isPending)
    return (
      <div className="mt-[15vh]">
        <Loading size="large" />
      </div>
    );

  if (
    lessonQuery.isError ||
    !lessonQuery.data ||
    tokenQuery.isError ||
    !tokenQuery.data ||
    !member
  )
    return (
      <div className="mt-[15vh] max-w-fit mx-auto">
        <LoadingError
          size="small"
          retry={() => {
            if (lessonQuery.isError || !lessonQuery.data)
              return lessonQuery.refetch();

            if (tokenQuery.isError || !tokenQuery.data)
              return tokenQuery.refetch();
          }}
          error={intl("lesson.loading-error")}
        />
      </div>
    );

  return (
    <Session
      type="lesson"
      localMember={self}
      token={tokenQuery.data.token}
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
    />
  );
};

export default Content;
