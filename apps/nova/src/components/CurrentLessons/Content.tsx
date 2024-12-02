import React from "react";
import { UsePaginateResult } from "@/types/query";
import { Element, ILesson, IUser, Void } from "@litespace/types";
import { LessonCard } from "@litespace/luna/LessonCard";
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

        const student = item.members.find(
          (member) => member.role === IUser.Role.Student
        );

        if (!tutor || !student) return;

        return (
          <LessonCard
            key={item.lesson.id}
            start={item.lesson.start}
            duration={item.lesson.duration}
            onJoin={() => console.log("join")}
            onCancel={() => console.log("canceled")}
            onRebook={() => console.log("rebook")}
            canceled={
              item.lesson.canceledBy === tutor.userId
                ? "tutor"
                : item.lesson.canceledBy === student?.userId
                ? "student"
                : null
            }
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
