import { useOnError } from "@/hooks/error";
import { asSlotBoundries } from "@/lib/lesson";
import { useFindAvailabilitySlots } from "@litespace/headless/availabilitySlots";
import { QueryKey } from "@litespace/headless/constants";
import { useSubscription } from "@litespace/headless/context/subscription";
import { useCreateLesson, useFindLessons } from "@litespace/headless/lessons";
import { useInvalidateQuery } from "@litespace/headless/query";
import { useCreateRatingTutor } from "@litespace/headless/rating";
import { useSubscriptionWeekBoundaries } from "@litespace/headless/subscription";
import { IAvailabilitySlot, ILesson } from "@litespace/types";
import { Dialog } from "@litespace/ui/Dialog";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { ManageLessonDialog, RateLesson } from "@litespace/ui/Lessons";
import { useToast } from "@litespace/ui/Toast";
import { dayjs, MAX_LESSON_DURATION, nullable } from "@litespace/utils";
import React, { useCallback, useMemo } from "react";

const PostSessionDialogs: React.FC<{
  postSession: boolean;
  tutorName: string | null;
  tutorId: number;
  studentId: number;
  tutorRateByUser?: number;
  isTutorManager: boolean;
  tutorImage: string | null;
}> = ({
  postSession,
  tutorName,
  tutorId,
  studentId,
  tutorRateByUser,
  isTutorManager,
  tutorImage,
}) => {
  const intl = useFormatMessage();
  const toast = useToast();
  const invalidate = useInvalidateQuery();

  const { info, remainingWeeklyMinutes, refetch } = useSubscription();

  const lessons = useFindLessons({
    canceled: false,
    users: studentId ? [studentId] : [],
    after: dayjs().toISOString(),
    userOnly: true,
    size: 1,
  });

  const hasBookedLessons = useMemo(() => {
    return !!lessons.query.data && !!lessons.query.data.list.length;
  }, [lessons]);

  const asRemainingWeeklyMinutes = useMemo(() => {
    if (info) return remainingWeeklyMinutes;
    if (isTutorManager) return MAX_LESSON_DURATION;
    return 0;
  }, [info, remainingWeeklyMinutes, isTutorManager]);

  const weekBoundaries = useSubscriptionWeekBoundaries(info);

  const slotBoundries = useMemo(
    () =>
      asSlotBoundries({
        start: weekBoundaries.start.toISOString(),
        end: weekBoundaries.end.toISOString(),
      }),
    [weekBoundaries.start, weekBoundaries.end]
  );

  const tutorAvailabilitySlots = useFindAvailabilitySlots({
    userIds: [tutorId],
    purposes: [
      IAvailabilitySlot.Purpose.General,
      IAvailabilitySlot.Purpose.Lesson,
    ],
    ...slotBoundries,
  });

  const bookedSlots = useMemo(() => {
    if (!tutorAvailabilitySlots.data?.subslots) return [];
    // if (payload.type === "book")
    return tutorAvailabilitySlots.data.subslots;
    // const start = dayjs.utc(payload.start);
    // const end = start.add(payload.duration, "minutes");
    // return tutorAvailabilitySlots.data.subslots.filter(
    //   (slot) => !start.isSame(slot.start) || !end.isSame(slot.end)
    // );
  }, [tutorAvailabilitySlots.data?.subslots]);

  const onSuccess = useCallback(() => {
    toast.success({ title: intl("tutor.rate.create.success") });
  }, [intl, toast]);

  const onError = useOnError({
    type: "mutation",
    handler: () => {
      toast.error({ title: intl("tutor.rate.create.error") });
    },
  });

  const createRate = useCreateRatingTutor({ onSuccess, onError });

  // const [isRated, setIsRated] = useState(!!tutorRateByUser);

  console.log(tutorRateByUser);

  const onCreateSuccess = useCallback(() => {
    // if (payload.onSuccess) payload.onSuccess();
    invalidate([QueryKey.FindAvailabilitySlots]);
    invalidate([QueryKey.FindLesson]);
    invalidate([QueryKey.FindInfiniteLessons]);
    invalidate([QueryKey.FindTutors]);
    // close();
  }, [invalidate]);

  const onCreateError = useOnError({
    type: "mutation",
    handler: ({ messageId }) => {
      toast.error({
        title: intl("book-lesson.error"),
        description: intl(messageId),
      });
    },
  });

  const createLessonMutation = useCreateLesson({
    onSuccess: onCreateSuccess,
    onError: onCreateError,
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
      // if (payload.type === "book")
      createLessonMutation
        .mutateAsync({
          tutorId,
          slotId,
          duration,
          start,
        })
        .then(() => refetch());

      // updateLessonMutation
      //   .mutateAsync({
      //     lessonId: payload.lessonId,
      //     slotId,
      //     duration,
      //     start,
      //   })
      //   .then(() => refetch());
    },
    [createLessonMutation, tutorId, refetch]
  );

  if (!postSession) return;
  return (
    <div>
      <Dialog open={!tutorRateByUser}>
        <RateLesson
          close={() => {}}
          onRate={({ value, feedback }) => {
            createRate.mutate({ value, feedback, rateeId: tutorId });
          }}
          rateLoading={false}
          tutorName={tutorName}
          type="session"
          initialRating={tutorRateByUser}
        />
      </Dialog>
      <ManageLessonDialog
        remainingWeeklyMinutes={asRemainingWeeklyMinutes}
        open={!!tutorRateByUser}
        bookedSlots={bookedSlots}
        close={() => {}}
        hasBookedLessons={hasBookedLessons}
        imageUrl={nullable(tutorImage)}
        name={tutorName}
        onSubmit={onSubmit}
        retry={tutorAvailabilitySlots.refetch}
        slots={tutorAvailabilitySlots.data?.slots.list || []}
        subscribed={!!info}
        tutorId={tutorId}
      />
    </div>
  );
};

export default PostSessionDialogs;
