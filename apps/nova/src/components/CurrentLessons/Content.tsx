import React from "react";
import { UsePaginateResult } from "@/types/query";
import { Element, ILesson, IUser, Void } from "@litespace/types";
import { UpcomingLessonCard } from "@litespace/luna/UpcomingLessonCard";
import { asFullAssetUrl } from "@litespace/luna/backend";

type Lessons = ILesson.FindUserLessonsApiResponse["list"];

type ContentProps = {
  query: UsePaginateResult<Element<Lessons>>;
  goto: (page: number) => void;
  next: Void;
  prev: Void;
  totalPages: number;
  page: number;
  refresh: Void;
};

export const Content: React.FC<ContentProps> = ({ query }) => {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-3">
      {query.query.data?.list.map((item) => {
        const tutor = item.members.find(
          (member) => member.role === IUser.Role.Tutor
        );
        if (!tutor) return;

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
