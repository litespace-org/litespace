import { atlas } from "@/lib/atlas";
import { useAppSelector } from "@/redux/store";
import { profileSelector } from "@/redux/user/me";
import { useQuery } from "react-query";
import React from "react";
import { ILesson } from "@litespace/types";
import List from "@/components/Lessons/List";

const Lessons: React.FC = () => {
  const profile = useAppSelector(profileSelector);

  const lessons = useQuery({
    queryFn: async (): Promise<ILesson.FindUserLessonsApiResponse> => {
      if (!profile) return { list: [], total: 0 };
      return atlas.lesson.findUserLessons(profile.id, { page: 1, size: 10 });
    },
    enabled: !!profile,
  });

  return (
    <div className="w-full">
      {lessons.data && profile ? (
        <List list={lessons.data.list} user={profile} />
      ) : null}
    </div>
  );
};

export default Lessons;
