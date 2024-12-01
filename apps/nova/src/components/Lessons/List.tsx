import React, { useMemo } from "react";
import { Element, ILesson, IUser } from "@litespace/types";
import { Timeline, TimelineItem } from "@litespace/luna/Timeline";
import Lesson from "@/components/Lessons/Lesson";
import { Hash, X } from "react-feather";

const List: React.FC<{
  list: Element<ILesson.FindUserLessonsApiResponse["list"]>[];
  user: IUser.Self;
}> = ({ list, user }) => {
  const timeline = useMemo((): TimelineItem[] => {
    const lessons = list.map(
      ({ lesson, members }): TimelineItem => ({
        id: lesson.id,
        children: <Lesson lesson={lesson} members={members} user={user} />,
        icon: lesson.canceledBy ? <X /> : <Hash />,
      })
    );
    return lessons;
  }, [list, user]);

  return (
    <div className="w-full">
      <Timeline timeline={timeline} />
    </div>
  );
};

export default List;
