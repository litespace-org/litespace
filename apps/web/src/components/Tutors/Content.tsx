import ManageLesson from "@/components/Lessons/ManageLesson";
import { Loading, Loader, LoadingError } from "@litespace/ui/Loading";
import { TutorCardV1, TutorCard } from "@litespace/ui/TutorCard";
import { Element, ITutor, Void } from "@litespace/types";
import { motion } from "framer-motion";
import React, { useCallback, useState } from "react";
import { InView } from "react-intersection-observer";
import MoreTutorsSoon from "@litespace/assets/MoreTutorsSoon";
import Notification2 from "@litespace/assets/Notification2";
import { Typography } from "@litespace/ui/Typography";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Button } from "@litespace/ui/Button";
import { useToast } from "@litespace/ui/Toast";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import cn from "classnames";
import { router } from "@/lib/routes";
import { Web } from "@litespace/utils/routes";

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
  const toast = useToast();
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const mq = useMediaQuery();

  const openBookingDialog = useCallback((tutor: Tutor) => setTutor(tutor), []);
  const closeBookingDialog = useCallback(() => setTutor(null), []);

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
                  imageUrl={tutor.image}
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
                  imageUrl={tutor.image}
                  topics={tutor.topics}
                />
              )}
            </motion.div>
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
          width={mq.lg ? 554 : 222}
          height={mq.lg ? 350 : 140}
          className="mb-6 sm:mb-10"
        />

        <Typography
          tag="span"
          className="text-black max-w-[328px] lg:max-w-[600px] text-center mb-6 sm:mb-8 text-body lg:text-h4 font-bold"
        >
          {intl("tutors.coming-soon")}
        </Typography>

        <Button
          className={cn("w-full max-w-[380px] md:w-auto")}
          size="large"
          endIcon={<Notification2 className="w-4 h-4" />}
          onClick={() =>
            toast.success({
              title: intl("labels.coming-soon"),
              description: intl("tutors.coming-soon.notification-description"),
            })
          }
        >
          <Typography tag="p" className="text-natural-50 text-body font-medium">
            {intl("tutors.coming.set-notifications")}
          </Typography>
        </Button>
      </div>
    </div>
  );
};

export default Content;
