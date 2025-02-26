import { ManageLessonDialog } from "@litespace/ui/Lessons";
import { ILesson, Void } from "@litespace/types";
import { useCreateLesson, useUpdateLesson } from "@litespace/headless/lessons";
import { useMemo, useCallback } from "react";
import { useToast } from "@litespace/ui/Toast";
import { useWebFormatMessage } from "@/hooks/intl";
import { QueryKey } from "@litespace/headless/constants";
import { useFindAvailabilitySlots } from "@litespace/headless/availabilitySlots";
import { useFindTutorInfo } from "@litespace/headless/tutor";
import { orNull } from "@litespace/utils/utils";
import { getErrorMessageId } from "@litespace/ui/errorMessage";
import dayjs from "@/lib/dayjs";
import { useInvalidateQuery } from "@litespace/headless/query";
import { capture } from "@/lib/sentry";

type Base = {
  close: Void;
};

export type ManageLessonPayload =
  | {
      type: "book";
      tutorId: number;
    }
  | {
      type: "update";
      tutorId: number;
      lessonId: number;
      slotId: number;
      start: string;
      duration: number;
    };

type Props = Base & ManageLessonPayload;

/**
 * This is wrapper component for the dialog component where users can either
 * book new lessons or edit existing lesson
 */
const ManageLesson = ({ close, tutorId, ...payload }: Props) => {
  const toast = useToast();
  const intl = useWebFormatMessage();
  const invalidate = useInvalidateQuery();

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
      capture(error);
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
      capture(error);
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
      if (payload.type === "book")
        return createLessonMutation.mutate({
          tutorId,
          slotId,
          duration,
          start,
        });

      updateLessonMutation.mutate({
        lessonId: payload.lessonId,
        slotId,
        duration,
        start,
      });
    },
    [payload, createLessonMutation, tutorId, updateLessonMutation]
  );

  const bookedSlots = useMemo(() => {
    if (!tutorAvailabilitySlots.data?.subslots) return [];
    if (payload.type === "book") return tutorAvailabilitySlots.data.subslots;
    const start = dayjs.utc(payload.start);
    const end = start.add(payload.duration, "minutes");
    return tutorAvailabilitySlots.data.subslots.filter(
      (slot) => !start.isSame(slot.start) || !end.isSame(slot.end)
    );
  }, [tutorAvailabilitySlots.data?.subslots, payload]);

  return (
    <ManageLessonDialog
      slotId={payload.type === "update" ? payload.slotId : undefined}
      start={payload.type === "update" ? payload.start : undefined}
      duration={payload.type === "update" ? payload.duration : undefined}
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
