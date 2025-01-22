import BookLesson from "@/components/Lessons/BookLesson";
import { Route } from "@/types/routes";
import { Loading } from "@litespace/luna/Loading";
import { TutorCardV1, TutorCard } from "@litespace/luna/TutorCard";
import { asFullAssetUrl } from "@litespace/luna/backend";
import { Element, ITutor, Void } from "@litespace/types";
import { motion } from "framer-motion";
import React, { useCallback, useState } from "react";
import { InView } from "react-intersection-observer";
import MoreTutorsSoon from "@litespace/assets/MoreTutorsSoon";
import Notification2 from "@litespace/assets/Notification2";
import { Typography } from "@litespace/luna/Typography";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { Button, ButtonSize } from "@litespace/luna/Button";
import { useToast } from "@litespace/luna/Toast";
import { useMediaQueries } from "@litespace/luna/hooks/media";
import cn from "classnames";

type Tutor = Element<ITutor.FindOnboardedTutorsApiResponse["list"]>;

const Content: React.FC<{
  tutors: ITutor.FindOnboardedTutorsApiResponse["list"] | null;
  loading: boolean;
  fetching: boolean;
  error: boolean;
  more: Void;
  hasMore: boolean;
}> = ({ tutors, loading, error, more, hasMore, fetching }) => {
  const intl = useFormatMessage();
  const toast = useToast();
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const mq = useMediaQueries();

  const openBookingDialog = useCallback((tutor: Tutor) => setTutor(tutor), []);
  const closeBookingDialog = useCallback(() => setTutor(null), []);

  if (loading) return <Loading className="h-[30vh]" />;
  // todo: add error component
  if (error) return "ERROR: TODO";
  if (!tutors) return null;
  return (
    <div>
      <div className="grid sm:grid-cols-[repeat(auto-fill,minmax(568px,1fr))] gap-6">
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
              {mq.sm ? (
                <TutorCardV1
                  id={tutor.id}
                  bio={tutor.bio}
                  about={tutor.about}
                  name={tutor.name}
                  lessonCount={tutor.lessonCount}
                  studentCount={tutor.studentCount}
                  rating={tutor.avgRating}
                  onBook={() => openBookingDialog(tutor)}
                  profileUrl={profileUrl}
                  imageUrl={tutor.image ? asFullAssetUrl(tutor.image) : null}
                  topics={tutor.topics}
                />
              ) : (
                <TutorCard
                  id={tutor.id}
                  bio={tutor.bio}
                  about={tutor.about}
                  name={tutor.name}
                  lessonCount={tutor.lessonCount}
                  studentCount={tutor.studentCount}
                  rating={tutor.avgRating}
                  onBook={() => openBookingDialog(tutor)}
                  profileUrl={profileUrl}
                  imageUrl={tutor.image ? asFullAssetUrl(tutor.image) : null}
                  topics={tutor.topics}
                />
              )}
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

      <div className="mt-8 sm:mt-[60px] mb-2 sm:mb-[132px] flex flex-col items-center">
        <MoreTutorsSoon
          width={mq.sm ? 554 : 222}
          height={mq.sm ? 350 : 140}
          className="mb-6 sm:mb-10"
        />

        <Typography
          element={mq.sm ? "h4" : "body"}
          weight="bold"
          className="text-black max-w-[600px] text-center mb-6 sm:mb-8"
        >
          {intl("tutors.coming-soon")}
        </Typography>

        <Button
          className={cn({ "tw-w-full": !mq.sm })}
          size={ButtonSize.Large}
          onClick={() =>
            toast.success({
              title: intl("labels.coming-soon"),
              description: intl("tutors.coming-soon.notification-description"),
            })
          }
        >
          <div className="flex items-center gap-[10px]">
            <Typography
              element="body"
              weight="bold"
              className="text-natural-50"
            >
              {intl("tutors.coming.set-notifications")}
            </Typography>
            <Notification2 width={24} height={24} />
          </div>
        </Button>
      </div>
    </div>
  );
};

export default Content;
