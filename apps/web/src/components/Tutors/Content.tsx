import ManageLesson from "@/components/Lessons/ManageLesson";
import { Loading, LoadingError } from "@litespace/ui/Loading";
import { TutorCard } from "@/components/Tutors/TutorCard";
import { Element, ITutor, Void } from "@litespace/types";
import React, { useCallback, useState } from "react";
import { InView } from "react-intersection-observer";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import {
  isValidTutorAbout,
  isValidTutorBio,
  isValidTutorName,
} from "@litespace/utils";
import { NotificationsDialog } from "@/components/Lessons/NotificationDialog";
import { useUser } from "@litespace/headless/context/user";
import { router } from "@/lib/routes";
import { Web } from "@litespace/utils/routes";
import { useNavigate } from "react-router-dom";
import { useToast } from "@litespace/ui/Toast";
import { StudentDashboardTour } from "@/constants/tour";
import { track } from "@/lib/ga";

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
  const { user } = useUser();
  const intl = useFormatMessage();
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [notiDialogOpen, setNotiDialogOpen] = useState<boolean>(false);
  const mq = useMediaQuery();
  const navigate = useNavigate();
  const toast = useToast();

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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {tutors.map((tutor, i) =>
          isValidTutorName(tutor.name) === true &&
          isValidTutorBio(tutor.bio) === true &&
          isValidTutorAbout(tutor.about) === true ? (
            <TutorCard
              id={
                i === 0
                  ? StudentDashboardTour.stepId(1, {
                      next: () => {
                        navigate(
                          router.web({
                            route: Web.TutorProfile,
                            id: tutor.id,
                          })
                        );
                      },
                    })
                  : undefined
              }
              key={tutor.id}
              tutorId={tutor.id}
              about={tutor.about}
              name={tutor.name}
              role={tutor.role}
              rating={tutor.avgRating}
              onBook={() => {
                openBookingDialog(tutor);
                track("book_lesson", "tutors", "book_lesson_from_tutor_card");
              }}
              image={tutor.image}
              topics={tutor.topics}
            />
          ) : null
        )}
      </div>

      {tutor ? (
        <ManageLesson
          type="book"
          close={closeBookingDialog}
          tutorId={tutor.id}
          onSuccess={() => {
            toast.success({
              title: intl("book-lesson.success", { tutor: tutor.name }),
            });
            if (!user?.notificationMethod) setNotiDialogOpen(true);
            else navigate(router.web({ route: Web.Lessons }));
          }}
        />
      ) : null}

      <NotificationsDialog
        open={notiDialogOpen}
        close={() => {
          setNotiDialogOpen(false);
          navigate(router.web({ route: Web.Lessons }));
        }}
      />

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
