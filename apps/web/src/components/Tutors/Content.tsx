import ManageLesson from "@/components/Lessons/ManageLesson";
import { Loading, LoadingError } from "@litespace/ui/Loading";
import { TutorCard } from "@/components/Tutors/TutorCard";
import { Element, ITutor, Void } from "@litespace/types";
import React, { useCallback, useState } from "react";
import { InView } from "react-intersection-observer";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useMediaQuery } from "@litespace/headless/mediaQuery";

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

  if (error || !tutors)
    return (
      <div className="mt-[15vh] max-w-fit mx-auto">
        <LoadingError
          error={intl("tutors.error")}
          size={mq.lg ? "large" : "small"}
          retry={refetch}
        />
      </div>
    );

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {tutors.map((tutor) => (
          <TutorCard
            key={tutor.id}
            free={false} // todo: access user role from the tutors cache
            id={tutor.id}
            bio={tutor.id == 49 ? tutor.bio : null}
            name={tutor.name}
            rating={tutor.avgRating}
            onBook={() => openBookingDialog(tutor)}
            image={tutor.image}
          />
        ))}
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
