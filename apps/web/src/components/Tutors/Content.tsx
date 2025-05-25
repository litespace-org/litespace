import ManageLesson from "@/components/Lessons/ManageLesson";
import { Loading, LoadingError } from "@litespace/ui/Loading";
import { TutorCard } from "@litespace/ui/TutorCard";
import { Element, ITutor, Void } from "@litespace/types";
import React, { useCallback, useState } from "react";
import { InView } from "react-intersection-observer";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import { router } from "@/lib/routes";
import { Web } from "@litespace/utils/routes";
import { Link } from "react-router-dom";
import { isTutorManager } from "@litespace/utils";

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
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const mq = useMediaQuery();

  const openBookingDialog = useCallback((tutor: Tutor) => setTutor(tutor), []);
  const closeBookingDialog = useCallback(() => setTutor(null), []);

  if (loading)
    return (
      <div className="mt-[15vh]">
        <Loading
          size={mq.lg ? "large" : "small"}
          text={intl("tutors.loading")}
        />
      </div>
    );

  if (error)
    return (
      <div className="mt-[15vh] max-w-fit mx-auto">
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {tutors.map((tutor) => {
          const profileUrl = router.web({
            route: Web.TutorProfile,
            id: tutor.id,
          });

          return (
            <Link
              to={profileUrl}
              key={tutor.id}
              className="focus-visible:ring outline-none focus-visible:ring-secondary-600 ring-offset-2 rounded-xl"
            >
              <TutorCard
                free={isTutorManager(tutor)}
                id={tutor.id}
                bio={tutor.bio}
                name={tutor.name}
                rating={tutor.avgRating}
                action={{
                  onClick: () => openBookingDialog(tutor),
                  label: intl("labels.book-now"),
                }}
                image={tutor.image}
              />
            </Link>
          );
        })}
      </div>

      {tutor ? (
        <ManageLesson
          type="book"
          close={closeBookingDialog}
          tutorId={tutor.id}
        />
      ) : null}

      {fetching ? (
        <div className="mt-6">
          <Loading />
        </div>
      ) : null}

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
