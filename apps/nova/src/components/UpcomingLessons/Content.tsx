import { Loading } from "@litespace/luna/Loading";
import { LessonCard, EmptyLessons } from "@litespace/luna/Lessons";
import { asFullAssetUrl } from "@litespace/luna/backend";
import { ILesson, IUser, Void } from "@litespace/types";
import React, { useCallback } from "react";
import { Route } from "@/types/routes";
import { InView } from "react-intersection-observer";
import { motion } from "framer-motion";

type Lessons = ILesson.FindUserLessonsApiResponse["list"];

export const Content: React.FC<{
  list: Lessons | null;
  loading: boolean;
  fetching: boolean;
  error: boolean;
  hasMore: boolean;
  more: Void;
}> = ({ list, loading, fetching, error, hasMore, more }) => {
  const canceled = useCallback(
    (item: Lessons[0], tutor: ILesson.PopuldatedMember) => {
      if (!item.lesson.canceledBy && !item.lesson.canceledBy) return null;
      if (item.lesson.canceledBy === tutor.userId) return "tutor";
      return "student";
    },
    []
  );

  if (loading) return <Loading className="h-[30vh]" />;

  // todo: add error element
  if (error) return "TODO: ERROR";

  if (!list) return null;

  if (!list.length)
    return (
      <div className="mt-28">
        <EmptyLessons tutorsPage={Route.Tutors} />;
      </div>
    );

  return (
    <div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(265px,1fr))] gap-x-3 gap-y-6">
        {list.map((item) => {
          const tutor = item.members.find(
            (member) => member.role === IUser.Role.Tutor
          );
          if (!tutor) return;
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={item.lesson.id}
            >
              <LessonCard
                start={item.lesson.start}
                duration={item.lesson.duration}
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
            </motion.div>
          );
        })}
      </div>

      {fetching ? <Loading className="mt-6 text-natural-950" /> : null}

      {!fetching ? (
        <InView
          as="div"
          onChange={(inView) => {
            if (inView && hasMore) more();
          }}
        />
      ) : null}
    </div>
  );
};

export default Content;
