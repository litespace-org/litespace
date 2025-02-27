import { Loading, Loader, LoadingError } from "@litespace/ui/Loading";

import { Element, ITutor, Void } from "@litespace/types";
import { motion } from "framer-motion";
import React from "react";
import { InView } from "react-intersection-observer";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import { router } from "@/lib/routes";
import { Web } from "@litespace/utils/routes";
import TutorCard from "@/components/Tutors/TutorCard";

type Tutor = Element<ITutor.FindOnboardedTutorsApiResponse["list"]>;

const Content: React.FC<{
  tutors: ITutor.FindOnboardedTutorsApiResponse["list"] | null;
  loading: boolean;
  fetching: boolean;
  error: boolean;
  hasMore: boolean;
  more: Void;
  refetch: Void;
}> = ({ tutors, loading, error, more, hasMore, fetching, refetch }) => {
  const intl = useFormatMessage();
  const mq = useMediaQuery();

  if (loading)
    return (
      <div className="mt-[15vh]">
        <Loader
          size={mq.lg ? "large" : "small"}
          text={intl("tutors.loading")}
        />
      </div>
    );

  if (error)
    return (
      <div className="mt-[15vh]">
        <LoadingError
          error={intl("tutors.error")}
          size={mq.lg ? "large" : "small"}
          retry={refetch}
        />
      </div>
    );

  if (!tutors) return null;
  return (
    <div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {tutors.map((tutor) => {
          const profileUrl = router.web({
            route: Web.TutorProfile,
            id: tutor.id,
          });

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={tutor.id}
            >
              {mq.lg ? (
                <TutorCard
                  id={tutor.id}
                  about={tutor.about}
                  name={tutor.name}
                  lessonCount={tutor.lessonCount}
                  studentCount={tutor.studentCount}
                  rating={tutor.avgRating}
                  profileUrl={profileUrl}
                  imageUrl={tutor.image}
                  topics={tutor.topics}
                />
              ) : (
                <TutorCard
                  id={tutor.id}
                  about={tutor.about}
                  name={tutor.name}
                  lessonCount={tutor.lessonCount}
                  studentCount={tutor.studentCount}
                  rating={tutor.avgRating}
                  profileUrl={profileUrl}
                  imageUrl={tutor.image}
                  topics={tutor.topics}
                />
              )}
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
