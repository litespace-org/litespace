import Title from "@/components/Common/Title";
import List from "@/components/Lesson";
import { useFindLesson } from "@litespace/headless/lessons";
import { useFindSessionEventsBySessionId } from "@litespace/headless/sessionEvent";
import { Replace } from "@litespace/types";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Dashboard, UrlParamsOf } from "@litespace/utils/routes";
import cn from "classnames";
import React, { useMemo } from "react";
import { useParams } from "react-router-dom";

type LessonParams = Replace<UrlParamsOf<Dashboard.Lesson>, "lessonId", string>;

const Lesson: React.FC = () => {
  const intl = useFormatMessage();
  const params = useParams<LessonParams>();

  const lessonId = useMemo(() => Number(params.lessonId), [params]);

  const lesson = useFindLesson(lessonId);
  const events = useFindSessionEventsBySessionId(lesson.data?.lesson.sessionId);

  return (
    <div
      className={cn("w-full flex flex-col gap-6 max-w-screen-3xl mx-auto p-6")}
    >
      <header className="flex items-center justify-between">
        <Title
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

export default Lesson;
