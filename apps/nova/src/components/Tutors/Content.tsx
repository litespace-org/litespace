import { Loading } from "@litespace/luna/Loading";
import { Element, ITutor, Void } from "@litespace/types";
import React, { useCallback, useState } from "react";
import { TutorCard } from "@litespace/luna/TutorCard";
import { asFullAssetUrl } from "@litespace/luna/backend";
import { Route } from "@/types/routes";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { InView } from "react-intersection-observer";
import BookLesson from "@/components/Lessons/BookLesson";

type Tutor = Element<ITutor.FindOnboardedTutorsApiResponse["list"]>;

const Content: React.FC<{
  tutors: ITutor.FindOnboardedTutorsApiResponse["list"] | null;
  loading: boolean;
  fetching: boolean;
  error: boolean;
  more: Void;
  hasMore: boolean;
}> = ({ tutors, loading, error, more, hasMore, fetching }) => {
  const navigate = useNavigate();

  const [tutor, setTutor] = useState<Tutor | null>(null);

  const openBookingDialog = useCallback((tutor: Tutor) => setTutor(tutor), []);
  const closeBookingDialog = useCallback(() => setTutor(null), []);

  if (loading) return <Loading className="h-[30vh]" />;
  // todo: add error component
  if (error) return "ERROR: TODO";
  if (!tutors) return null;
  return (
    <div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(256px,1fr))] gap-6">
        {tutors.map((tutor) => {
          const profileUrl = Route.TutorProfile.replace(
            ":id",
            tutor.id.toString()
          );
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={tutor.id}
            >
              <TutorCard
                id={tutor.id}
                bio={tutor.bio}
                about={tutor.about}
                name={tutor.name}
                lessonCount={tutor.lessonCount}
                studentCount={tutor.studentCount}
                rating={tutor.avgRating}
                onBook={() => openBookingDialog(tutor)}
                onOpenProfile={() => navigate(profileUrl)}
                profileUrl={profileUrl}
                imageUrl={tutor.image ? asFullAssetUrl(tutor.image) : null}
              />
            </motion.div>
          );
        })}
      </div>

      {tutor ? (
        <BookLesson
          close={closeBookingDialog}
          open={!!tutor}
          tutorId={tutor.id}
        />
      ) : null}

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
