import { CALLBACK_URL } from "@/types/routes";
import { BookLessonDialog } from "@litespace/ui/Lessons";
import { ILesson, Void } from "@litespace/types";
import { useCreateLesson, useFindLessons } from "@litespace/headless/lessons";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useToast } from "@litespace/ui/Toast";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useQueryClient } from "@tanstack/react-query";
import { QueryKey } from "@litespace/headless/constants";
import { useFindAvailabilitySlots } from "@litespace/headless/availabilitySlots";
import { useFindTutorInfo } from "@litespace/headless/tutor";
import { orNull } from "@litespace/utils/utils";
import { getErrorMessageId } from "@litespace/ui/errorMessage";
import dayjs from "@/lib/dayjs";
import { useUserContext } from "@litespace/headless/context/user";
import { ConfirmationDialog } from "@litespace/ui/ConfirmationDialog";
import Calendar from "@litespace/assets/Calendar";
import SmsTracking from "@litespace/assets/SmsTracking";
import { useSendVerifyEmail } from "@litespace/headless/auth";

const BookLessonDialogWrapper = ({
  close,
  tutorId,
}: {
  close: Void;
  tutorId: number;
}) => {
  const toast = useToast();
  const intl = useFormatMessage();
  const queryClient = useQueryClient();

  const availabilitySlotsQuery = useMemo(
    () => ({
      userId: tutorId,
      after: dayjs.utc().toISOString(),
      before: dayjs.utc().add(2, "week").toISOString(),
    }),
    [tutorId]
  );

  const tutorAvailabilitySlots = useFindAvailabilitySlots(
    availabilitySlotsQuery
  );
  const tutor = useFindTutorInfo(tutorId);

  const onSuccess = useCallback(() => {
    close();
    if (tutor.data?.name)
      toast.success({
        title: intl("book-lesson.success", { tutor: tutor.data.name }),
      });

    queryClient.invalidateQueries({
      queryKey: [
        QueryKey.FindAvailabilitySlots,
        QueryKey.FindLesson,
        QueryKey.FindTutors,
      ],
    });
  }, [close, tutor.data, toast, intl, queryClient]);

  const onError = useCallback(
    (error: unknown) => {
      const errorMessage = getErrorMessageId(error);
      toast.error({
        title: intl("book-lesson.error"),
        description: intl(errorMessage),
      });
    },
    [toast, intl]
  );

  const bookLessonMutation = useCreateLesson({ onSuccess, onError });

  const onBook = useCallback(
    ({
      slotId,
      start,
      duration,
    }: {
      slotId: number;
      start: string;
      duration: ILesson.Duration;
    }) => bookLessonMutation.mutate({ tutorId, slotId, duration, start }),
    [tutorId, bookLessonMutation]
  );

  return (
    <BookLessonDialog
      imageUrl={orNull(tutor.data?.image)}
      name={orNull(tutor.data?.name)}
      tutorId={tutorId}
      close={close}
      confirmationLoading={bookLessonMutation.isPending}
      loading={
        tutorAvailabilitySlots.isLoading || tutor.isLoading || tutor.isFetching
      }
      bookedSlots={tutorAvailabilitySlots.data?.subslots || []}
      slots={tutorAvailabilitySlots.data?.slots.list || []}
      onBook={onBook}
      open
    />
  );
};

const BookingEligibility = ({
  close,
  tutorId,
}: {
  close: Void;
  tutorId: number;
}) => {
  const { user } = useUserContext();
  const intl = useFormatMessage();
  const toast = useToast();
  const [typeOfDialog, setTypeOfDialog] = useState<
    "book" | "verify" | "has-booked-lesson"
  >("verify");
  const [isReady, setIsReady] = useState(false);

  const userBookedLessons = useFindLessons({
    users: user ? [user.id] : [],
    userOnly: true,
  });

  const onSuccess = useCallback(() => {}, []);
  const onError = useCallback(
    (error: unknown) => {
      const errorMessage = getErrorMessageId(error);
      toast.error({
        title: intl("page.send.verify.email.failure"),
        description: intl(errorMessage),
      });
    },
    [intl, toast]
  );

  const sendVerifyEmail = useSendVerifyEmail({ onSuccess, onError });

  const sendEmail = useCallback(() => {
    sendVerifyEmail.mutate(CALLBACK_URL);
    close();
  }, [close, sendVerifyEmail]);

  useEffect(() => {
    if (userBookedLessons.query.isPending || !user) return;

    if (!user.verified) {
      setTypeOfDialog("verify");
      setIsReady(true);
      return;
    }

    const bookedLessons = userBookedLessons.query.data;
    const futureLessons =
      bookedLessons?.list.filter(
        (item) =>
          !item.lesson.canceledAt &&
          dayjs().isBefore(
            dayjs(item.lesson.start).add(item.lesson.duration, "minute")
          )
      ) || [];

    if (futureLessons.length) {
      setTypeOfDialog("has-booked-lesson");
      setIsReady(true);
      return;
    }

    setTypeOfDialog("book");
    setIsReady(true);
  }, [userBookedLessons, user]);

  if (!isReady) return null;

  if (typeOfDialog === "verify")
    return (
      <ConfirmationDialog
        title={intl("lessons.book.verify-dialog.title")}
        description={intl("lessons.book.verify-dialog.description")}
        actions={{
          primary: {
            label: intl("lessons.book.verify-dialog.confirm"),
            onClick: sendEmail,
            loading: sendVerifyEmail.isPending,
            disabled: sendVerifyEmail.isPending,
          },
        }}
        open
        close={close}
        icon={<SmsTracking className="[&>*]:stroke-brand-700" />}
      />
    );

  if (typeOfDialog === "has-booked-lesson")
    return (
      <ConfirmationDialog
        title={intl("lessons.book.has-booked-dialog.title")}
        description={intl("lessons.book.has-booked-dialog.description")}
        actions={{
          primary: {
            label: intl("lessons.book.has-booked-dialog.confirm"),
            onClick: close,
          },
        }}
        open
        close={close}
        icon={<Calendar className="[&>*]:stroke-brand-700" />}
      />
    );

  return <BookLessonDialogWrapper close={close} tutorId={tutorId} />;
};

export default BookingEligibility;
