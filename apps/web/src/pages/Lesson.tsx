import React, { useCallback, useMemo, useState } from "react";
import { useFindLesson } from "@litespace/headless/lessons";
import { useParams } from "react-router-dom";
import { useUserContext } from "@litespace/headless/context/user";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import cn from "classnames";
import SessionWrapper from "@/components/Session/Session";

/**
 * @todos
 * 1. Only "join" the session in case the user is listening and the peer is ready.
 * 2. Handle loading & errors.
 * 3. Improve and align terminology.
 * 4. Leave the session on permission-state changed.
 */
const Lesson: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const mq = useMediaQuery();
  const { user } = useUserContext();

  const lessonId = useMemo(() => {
    if (!id) return;
    const lessonId = Number(id);
    if (Number.isNaN(lessonId)) return;
    return lessonId;
  }, [id]);

  const lesson = useFindLesson(lessonId);

  const lessonMembers = useMemo(() => {
    if (!lesson.data || !user) return null;
    const current = lesson.data.members.find(
      (member) => member.userId === user.id
    );

    const other = lesson.data.members.find(
      (member) => member.userId !== user.id
    );

    if (!current || !other) return null;
    return { current, other };
  }, [lesson.data, user]);

  const [chatEnabled, setChatEnabled] = useState<boolean>(false);

  const toggleChat = useCallback(() => {
    setChatEnabled((prev) => !prev);
  }, []);

  return (
    <div
      className={cn(
        "max-w-screen-3xl mx-auto w-full grow overflow-hidden",
        chatEnabled && !mq.lg ? "" : "p-6"
      )}
    >
      <SessionWrapper
        error={lesson.isError}
        loading={lesson.isLoading}
        refetch={lesson.refetch}
        members={lessonMembers}
        type="lesson"
        id={lessonId}
        sessionData={
          lesson.data
            ? {
                duration: lesson.data.lesson.duration,
                start: lesson.data.lesson.start,
                sessionId: lesson.data.lesson.sessionId,
              }
            : undefined
        }
        chatEnabled={chatEnabled}
        toggleChat={toggleChat}
      />
    </div>
  );
};

export default Lesson;
