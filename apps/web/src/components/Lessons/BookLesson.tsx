import { BookLessonDialog } from "@litespace/ui/Lessons";
import { ILesson, Void } from "@litespace/types";
import { useCreateLesson } from "@litespace/headless/lessons";
import { useCallback } from "react";
import { useToast } from "@litespace/ui/Toast";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useQueryClient } from "@tanstack/react-query";
import { QueryKey } from "@litespace/headless/constants";
import { useFindTutorInfo } from "@litespace/headless/tutor";
import { orNull } from "@litespace/utils/utils";
import { useFindAvailabilitySlots } from "@litespace/headless/availabilitySlots";

const BookLesson = ({
  open,
  close,
  tutorId,
}: {
  open: boolean;
  close: Void;
  tutorId: number;
}) => {
  const intl = useFormatMessage();
  const toast = useToast();
  const queryClient = useQueryClient();
  const slotsQuery = useFindAvailabilitySlots({ userId: tutorId });
  const tutor = useFindTutorInfo(tutorId);

  const onSuccess = useCallback(() => {
    close();

    if (tutor.data && tutor.data.name)
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

  const onError = useCallback(() => {
    toast.error({ title: intl("book-lesson.error") });
  }, [toast, intl]);

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
    }) => bookLessonMutation.mutate({ tutorId, slotId, start, duration }),
    [bookLessonMutation, tutorId]
  );

  return (
    <BookLessonDialog
      imageUrl={orNull(tutor.data?.image)}
      name={orNull(tutor.data?.name)}
      tutorId={tutorId}
      open={open}
      close={close}
      confirmationLoading={bookLessonMutation.isPending}
      loading={slotsQuery.isLoading || tutor.isLoading || tutor.isFetching}
      slots={slotsQuery.data?.slots.list || []}
      notice={orNull(tutor.data?.notice)}
      onBook={onBook}
    />
  );
};

export default BookLesson;
