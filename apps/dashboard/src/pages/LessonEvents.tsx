import PageTitle from "@/components/Common/PageTitle";
import List from "@/components/LessonEvents";
import { useFindLesson } from "@litespace/headless/lessons";
import { useFindSessionEventsBySessionId } from "@litespace/headless/sessionEvent";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import cn from "classnames";
import React, { useMemo } from "react";
import { useParams } from "react-router-dom";

type LessonEventsParams = {
  lessonId: string;
};

export const LessonEvents: React.FC = () => {
  const intl = useFormatMessage();
  const params = useParams<LessonEventsParams>();

  const lessonId = useMemo(() => Number(params.lessonId), [params]);

  const lesson = useFindLesson(lessonId);
  const events = useFindSessionEventsBySessionId(lesson.data?.lesson.sessionId);

  return (
    <div
      className={cn("w-full flex flex-col gap-6 max-w-screen-3xl mx-auto p-6")}
    >
      <header className="flex items-center justify-between">
        <PageTitle
          title={intl("dashboard.session-events.title")}
          fetching={events.isFetching && !events.isLoading}
        />
      </header>

      {lesson.data && events.data ? (
        <List
          data={{ events: events.data, lesson: lesson.data }}
          error={events.error}
          loading={events.isLoading}
          refetch={events.refetch}
        />
      ) : null}
    </div>
  );
};

export default LessonEvents;
