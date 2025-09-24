import React, { useMemo } from "react";
import { useOnError } from "@/hooks/error";
import { useFindLesson } from "@litespace/headless/lessons";
import { IUser } from "@litespace/types";
import { Loading, LoadingError } from "@litespace/ui/Loading";
import { RemoteMember } from "@/components/Session/types";

import PreSession from "@/components/Session/PreSession";
import { useUser } from "@litespace/headless/context/user";

const Content: React.FC<{
  lessonId: number;
  self: IUser.Self;
}> = ({ lessonId, self }) => {
  const { user } = useUser();
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

  if (!user) return null;

  return (
    <PreSession
      type={"lesson"}
      start={lessonQuery.data.lesson.start}
      duration={lessonQuery.data.lesson.duration}
      sessionId={lessonQuery.data.lesson.sessionId}
      sessionTypeId={lessonId}
      member={member}
    />
  );
};

export default Content;
