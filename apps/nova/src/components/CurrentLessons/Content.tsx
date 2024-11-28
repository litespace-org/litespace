import Error from "@/components/Common/Error";
import { UsePaginateResult } from "@/types/query";
import { Loading } from "@litespace/luna/Loading";
import { UpcomingLessonCard } from "@litespace/luna/UpcomingLessonCard";
import { asFullAssetUrl } from "@litespace/luna/backend";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { Element, ILesson, IUser } from "@litespace/types";
import React from "react";

type Lessons = ILesson.FindUserLessonsApiResponse["list"];
type ContentProps = UsePaginateResult<Element<Lessons>>;

export const Content: React.FC<ContentProps> = ({ query }) => {
  const intl = useFormatMessage();
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(265px,1fr))] gap-3">
      {query.data?.list.map((item) => {
        const tutor = item.members.find(
          (member) => member.role === IUser.Role.Tutor
        );
        if (!tutor) return;
        if (query.isLoading) return <Loading className="h-1/4" />;
        if (query.error)
          return (
            <Error
              title={intl("error.alert")}
              error={query.error}
              refetch={query.refetch}
            />
          );
        if (!query.data) return null;
        return (
          <UpcomingLessonCard
            key={item.lesson.id}
            start={item.call.start}
            duration={item.call.duration}
            onJoin={() => console.log("join")}
            onCancel={() => console.log("canceled")}
            onRebook={() => console.log("rebook")}
            canceled={!!item.lesson.canceledBy || !!item.call.canceledBy}
            tutor={{
              id: tutor.userId,
              name: tutor.name,
              image: tutor.image ? asFullAssetUrl(tutor.image) : undefined,
              rating: 3,
              studentCount: 100,
            }}
          />
        );
      })}
    </div>
  );
};

export default Content;
