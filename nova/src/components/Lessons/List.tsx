import React, { useMemo } from "react";
import { Element, ILesson, IUser } from "@litespace/types";
import { Timeline, TimelineItem } from "@litespace/luna";
import Lesson from "@/components/Lessons/Lesson";
import { Hash } from "react-feather";

const List: React.FC<{
  list: Element<ILesson.FindUserLessonsApiResponse["list"]>[];
  user: IUser.Self;
}> = ({ list, user }) => {
  const timeline = useMemo((): TimelineItem[] => {
    const lessons = list.map(
      ({ call, lesson, members }): TimelineItem => ({
        id: lesson.id,
        children: (
          <Lesson lesson={lesson} members={members} call={call} user={user} />
        ),
        icon: <Hash />,
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
