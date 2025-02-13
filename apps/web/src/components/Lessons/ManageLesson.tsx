import { ManageLessonDialog } from "@litespace/ui/Lessons";
import { ILesson, Void } from "@litespace/types";
import {
  useCreateLesson,
  useFindLesson,
  useUpdateLesson,
} from "@litespace/headless/lessons";
import { useMemo, useCallback } from "react";
import { useToast } from "@litespace/ui/Toast";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { QueryKey } from "@litespace/headless/constants";
import { useFindAvailabilitySlots } from "@litespace/headless/availabilitySlots";
import { useFindTutorInfo } from "@litespace/headless/tutor";
import { orNull } from "@litespace/utils/utils";
import { getErrorMessageId } from "@litespace/ui/errorMessage";
import dayjs from "@/lib/dayjs";
import { useInvalidateQuery } from "@litespace/headless/query";

/**
 * This is wrapper component for the dialog component where users can either
 * book new lessons or edit existing lesson
 */
const ManageLesson = ({
  close,
  tutorId,
  lessonId,
}: {
  close: Void;
  tutorId: number;
  lessonId?: number;
}) => {
  const toast = useToast();
  const intl = useFormatMessage();
  const invalidate = useInvalidateQuery();

  const lessonData = useFindLesson(lessonId);

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

  // Create Lesson
  const onCreateSuccess = useCallback(() => {
    if (tutor.data?.name)
      toast.success({
        title: intl("book-lesson.success", { tutor: tutor.data.name }),
      });
    invalidate([QueryKey.FindAvailabilitySlots]);
    invalidate([QueryKey.FindLesson]);
    invalidate([QueryKey.FindTutors]);
    close();
  }, [close, tutor.data?.name, toast, intl, invalidate]);

  const onCreateError = useCallback(
    (error: unknown) => {
      const errorMessage = getErrorMessageId(error);
      toast.error({
        title: intl("book-lesson.error"),
        description: intl(errorMessage),
      });
    },
    [toast, intl]
  );

  const createLessonMutation = useCreateLesson({
    onSuccess: onCreateSuccess,
    onError: onCreateError,
  });

  //Update Lesson
  const onUpdateSuccess = useCallback(() => {
    if (tutor.data?.name)
      toast.success({
        title: intl("update-lesson.success", { tutor: tutor.data.name }),
      });
    invalidate([QueryKey.FindAvailabilitySlots]);
    invalidate([QueryKey.FindLesson]);
    invalidate([QueryKey.FindInfiniteLessons]);
    invalidate([QueryKey.FindTutors]);
    close();
  }, [close, tutor.data?.name, toast, intl, invalidate]);

  const onUpdateError = useCallback(
    (error: unknown) => {
      const errorMessage = getErrorMessageId(error);
      toast.error({
        title: intl("update-lesson.error"),
        description: intl(errorMessage),
      });
    },
    [toast, intl]
  );

  const updateLessonMutation = useUpdateLesson({
    onSuccess: onUpdateSuccess,
    onError: onUpdateError,
  });

  const onSubmit = useCallback(
    ({
      slotId,
      start,
      duration,
    }: {
      slotId: number;
      start: string;
      duration: ILesson.Duration;
    }) => {
      // no lessonId -> Create New Lesson
      if (!lessonId) {
        createLessonMutation.mutate({ tutorId, slotId, duration, start });
        return;
      }
      // lessonId -> Edit Existing Lesson
      updateLessonMutation.mutate({ lessonId, slotId, duration, start });
    },
    [tutorId, createLessonMutation, updateLessonMutation, lessonId]
  );

  const bookedSlots = useMemo(() => {
    if (!tutorAvailabilitySlots.data || !tutorAvailabilitySlots.data?.subslots)
      return [];
    if (!lessonId || !lessonData.data?.lesson)
      return tutorAvailabilitySlots.data.subslots;

    const lesson = lessonData.data?.lesson;
    return tutorAvailabilitySlots.data.subslots.filter(
      (slot) =>
        !dayjs(slot.start).isSame(dayjs(lesson.start)) &&
        !dayjs(slot.end).isSame(
          dayjs(lesson.start).add(lesson.duration, "minute")
        )
    );
  }, [tutorAvailabilitySlots.data, lessonId, lessonData]);

  return (
    <ManageLessonDialog
      imageUrl={orNull(tutor.data?.image)}
      name={orNull(tutor.data?.name)}
      tutorId={tutorId}
      close={close}
      confirmationLoading={createLessonMutation.isPending}
      loading={
        tutorAvailabilitySlots.isLoading || tutor.isLoading || tutor.isFetching
      }
      bookedSlots={bookedSlots}
      slots={tutorAvailabilitySlots.data?.slots.list || []}
      onSubmit={onSubmit}
      open
    />
  );
};

export default ManageLesson;
