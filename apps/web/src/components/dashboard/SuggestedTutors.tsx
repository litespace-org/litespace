import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TutorCard } from "@/components/Tutors/TutorCard";
import { NotificationsDialog } from "@/components/Lessons/NotificationDialog";
import ManageLesson from "@/components/Lessons/ManageLesson";
import { Element, ITutor, Void } from "@litespace/types";
import { Loading, LoadingError } from "@litespace/ui/Loading";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import { useToast } from "@litespace/ui/Toast";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import { Web } from "@litespace/utils/routes";
import { useUser } from "@litespace/headless/context/user";
import { router } from "@/lib/routes";
import LeftArrowHead from "@litespace/assets/LeftArrowHead";
import RightArrowHead from "@litespace/assets/RightArrowHead";

type Tutor = Element<ITutor.FindOnboardedTutorsApiResponse["list"]>;

export const SuggestedTutors: React.FC<{
  tutors: ITutor.FindOnboardedTutorsApiResponse["list"] | null;
  loading: boolean;
  error: boolean;
  refetch: Void;
}> = ({ tutors, loading, error, refetch }) => {
  const intl = useFormatMessage();
  const mq = useMediaQuery();
  const { user } = useUser();

  const openBookingDialog = useCallback((tutor: Tutor) => setTutor(tutor), []);
  const [notiDialogOpen, setNotiDialogOpen] = useState<boolean>(false);
  const closeBookingDialog = useCallback(() => setTutor(null), []);
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const navigate = useNavigate();
  const toast = useToast();

  if (loading)
    return (
      <div className="mt-[15vh]">
        <Loading
          size={mq.lg ? "large" : "small"}
          text={intl("student-dashboard-tutors.loading")}
        />
      </div>
    );

  if (error || !tutors)
    return (
      <div className="mt-[15vh] max-w-fit mx-auto">
        <LoadingError
          error={intl("student-dashboard-tutors.error")}
          size={mq.lg ? "large" : "small"}
          retry={refetch}
        />
      </div>
    );

  return (
    <>
      <div className="flex justify-between">
        <Typography
          tag="h1"
          className="text-subtitle-2 text-natural-950 font-cairo font-bold"
        >
          {intl("student-dashboard.suggested-tutors")}
        </Typography>

        {/* to be implemented in the future as in the prototypeToDo nvgate arrows */}
        <LeftArrowHead className="[&>*]:stroke-primary-700 hidden w-4 h-4 icon" />
        <RightArrowHead className="[&>*]:stroke-primary-700 hidden w-4 h-4 icon" />
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

      <div className="md:hidden flex flex-col max-sm:p-2 gap-4 xl:grid xl:grid-cols-3 xl:gap-6">
        {tutors.map((tutor) => (
          <TutorCard
            key={tutor.id}
            tutorId={tutor.id}
            about={tutor.about}
            name={tutor.name}
            image={tutor.image}
            rating={tutor.avgRating}
            topics={tutor.topics || []}
            onBook={() => openBookingDialog(tutor)}
            buttonSize="large"
            cardHeight="h-80 max-h-80 lg:h-[298px]"
          />
        ))}
      </div>

      <div className="hidden xl:hidden md:grid md:gap-6 md:grid-cols-2 gap-6">
        {tutors.slice(0, 2).map((tutor) => (
          <TutorCard
            key={tutor.id}
            tutorId={tutor.id}
            about={tutor.about}
            name={tutor.name}
            image={tutor.image}
            rating={tutor.avgRating}
            topics={tutor.topics || []}
            onBook={() => openBookingDialog(tutor)}
            buttonSize="large"
            cardHeight="h-[20rem] mb:h-[26rem] lg:h-[244px]"
          />
        ))}
      </div>
    </>
  );
};
