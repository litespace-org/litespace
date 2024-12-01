import Error from "@/components/Common/Error";
import { UsePaginateResult } from "@/types/query";
import { Loading } from "@litespace/luna/Loading";
import { LessonCard } from "@litespace/luna/LessonCard";
import { asFullAssetUrl } from "@litespace/luna/backend";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { Element, ILesson, IUser } from "@litespace/types";
import React, { useCallback } from "react";

type Lessons = ILesson.FindUserLessonsApiResponse["list"];
type ContentProps = UsePaginateResult<Element<Lessons>>;

export const Content: React.FC<ContentProps> = ({ query }) => {
  const intl = useFormatMessage();

  const canceled = useCallback(
    (item: Lessons[0], tutor: ILesson.PopuldatedMember) => {
      if (!item.lesson.canceledBy && !item.lesson.canceledBy) return null;
      if (
        item.lesson.canceledBy === tutor.userId ||
        item.call.canceledBy === tutor.userId
      )
        return "tutor";
      return "student";
    },
    []
  );

  if (query.isLoading) return <Loading className="h-[30vh]" />;

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
    <div className="grid grid-cols-[repeat(auto-fill,minmax(265px,1fr))] gap-x-3 gap-y-6">
      {query.data?.list.map((item) => {
        const tutor = item.members.find(
          (member) => member.role === IUser.Role.Tutor
        );

        if (!tutor) return;

        return (
          <LessonCard
            key={item.lesson.id}
            start={item.call.start}
            duration={item.call.duration}
            onJoin={() => console.log("join")}
            onCancel={() => console.log("canceled")}
            onRebook={() => console.log("rebook")}
            canceled={canceled(item, tutor)}
            tutor={{
              id: tutor.userId,
              name: tutor.name,
              image: tutor.image ? asFullAssetUrl(tutor.image) : undefined,
            }}
          />
        );
      })}
    </div>
  );
};

export default Content;
