import { BookLessonDialog } from "@litespace/ui/Lessons";
import { ILesson, Void } from "@litespace/types";
import { useCreateLesson } from "@litespace/headless/lessons";
import dayjs from "dayjs";
import { useCallback, useMemo } from "react";
import { useToast } from "@litespace/ui/Toast";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useQueryClient } from "@tanstack/react-query";
import { QueryKey } from "@litespace/headless/constants";
import { useFindAvailabilitySlots } from "@litespace/headless/availabilitySlots";
import { useFindTutorInfo } from "@litespace/headless/tutor";
import { orNull } from "@litespace/utils/utils";
import { getErrorMessageId } from "@litespace/ui/errorMessage";

const BookLesson = ({ close, tutorId }: { close: Void; tutorId: number }) => {
  const intl = useFormatMessage();
  const toast = useToast();
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

    if (tutor.data && tutor.data.name)
      toast.success({
        title: intl("book-lesson.success", { tutor: tutor.data.name }),
      });

    queryClient.invalidateQueries({
      queryKey: [
        QueryKey.FindRulesWithSlots,
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

  const bookLessonMutation = useCreateLesson({
    onSuccess,
    onError,
  });

  const onBook = useCallback(
    ({
      slotId,
      start,
      duration,
    }: {
      slotId: number;
      start: string;
      duration: ILesson.Duration;
    }) =>
      bookLessonMutation.mutate({
        tutorId,
        slotId,
        duration,
        start,
        ruleId: 5, // TODO: Remove it when removed from the backend
      }),
    [tutorId, bookLessonMutation]
  );

  return (
    <BookLessonDialog
      imageUrl={orNull(tutor.data?.image)}
      name={orNull(tutor.data?.name)}
      tutorId={tutorId}
      open={true}
      close={close}
      confirmationLoading={bookLessonMutation.isPending}
      loading={
        tutorAvailabilitySlots.isLoading || tutor.isLoading || tutor.isFetching
      }
      bookedSlots={tutorAvailabilitySlots.data?.subslots || []}
      slots={tutorAvailabilitySlots.data?.slots.list || []}
      onBook={onBook}
    />
  );
};

export default BookLesson;
