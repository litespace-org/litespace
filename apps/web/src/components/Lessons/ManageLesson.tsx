import SubscriptionDialog from "@/components/Lessons/SubscriptionDialog";
import { useOnError } from "@/hooks/error";
import dayjs from "@/lib/dayjs";
import { asSlotBoundries } from "@/lib/lesson";
import { useFindAvailabilitySlots } from "@litespace/headless/availabilitySlots";
import { QueryKey } from "@litespace/headless/constants";
import { useSubscription } from "@litespace/headless/context/subscription";
import { useUser } from "@litespace/headless/context/user";
import {
  useCreateLesson,
  useFindLessons,
  useUpdateLesson,
} from "@litespace/headless/lessons";
import { useInvalidateQuery } from "@litespace/headless/query";
import { useFindTutorInfo } from "@litespace/headless/tutor";
import { IAvailabilitySlot, ILesson, Void } from "@litespace/types";
import { ManageLessonDialog } from "@litespace/ui/Lessons";
import { useToast } from "@litespace/ui/Toast";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { isTutorManager, MAX_LESSON_DURATION } from "@litespace/utils";
import { useSubscriptionWeekBoundaries } from "@litespace/headless/subscription";
import { nstr, nullable } from "@litespace/utils/utils";
import React, { useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { router } from "@/lib/routes";
import { Web } from "@litespace/utils/routes";

type Base = {
  close: Void;
  onSuccess?: Void;
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
 * A wrapper for the book lesson dialog where users can either
 * book new lessons or edit existing lesson
 */
const ManageLesson: React.FC<Props> = ({ close, tutorId, ...payload }) => {
  const { user } = useUser();
  const toast = useToast();
  const intl = useFormatMessage();
  const navigate = useNavigate();
  const invalidate = useInvalidateQuery();
  const now = useRef(dayjs());

  // ====== get subscribtion details and get the boundries you filter the availability slots on =========
  const { info, remainingWeeklyMinutes, refetch, paidLessonStatus } =
    useSubscription();

  const weekBoundaries = useSubscriptionWeekBoundaries(info);

  const slotBoundries = useMemo(
    () =>
      asSlotBoundries({
        start: weekBoundaries.start.toISOString(),
        end: weekBoundaries.end.toISOString(),
      }),
    [weekBoundaries.start, weekBoundaries.end]
  );

  // ====== get tutorInfo =========
  const tutor = useFindTutorInfo(tutorId);

  // ====== Check if user has any booked lessons =========
  const lessons = useFindLessons({
    canceled: false,
    users: user ? [user?.id] : [],
    after: now.current.add(tutor.data?.notice || 0, "minutes").toISOString(),
    userOnly: true,
    size: 1,
  });
  const hasBookedLessons = useMemo(() => {
    return !!lessons.query.data && !!lessons.query.data.list.length;
  }, [lessons]);

  const canBook = useMemo(() => {
    return !!info || paidLessonStatus !== ILesson.PaidLessonStatus.NotEligible;
  }, [info, paidLessonStatus]);

  const tutorAvailabilitySlots = useFindAvailabilitySlots({
    userIds: [tutorId],
    purposes: [
      IAvailabilitySlot.Purpose.General,
      IAvailabilitySlot.Purpose.Lesson,
    ],
    ...slotBoundries,
  });

  /**
   * if user is subscribed use the real weakly minutes, if not, look for the tutor type
   * isTutorManager -> user can book
   * if not -> user can't book
   */
  const asRemainingWeeklyMinutes = useMemo(() => {
    if (info) return remainingWeeklyMinutes;
    if (isTutorManager(tutor.data)) return MAX_LESSON_DURATION;
    return 0;
  }, [remainingWeeklyMinutes, tutor.data, info]);

  // ====== Create lesson mutation =========
  const onCreateSuccess = useCallback(() => {
    if (payload.onSuccess) payload.onSuccess();
    invalidate([QueryKey.FindAvailabilitySlots]);
    invalidate([QueryKey.FindLesson]);
    invalidate([QueryKey.FindInfiniteLessons]);
    invalidate([QueryKey.FindTutors]);
    close();
  }, [payload, invalidate, close]);

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

  // ====== Update lesson mutation =========
  const onUpdateSuccess = useCallback(() => {
    if (payload.onSuccess) payload.onSuccess();
    invalidate([QueryKey.FindAvailabilitySlots]);
    invalidate([QueryKey.FindLesson]);
    invalidate([QueryKey.FindInfiniteLessons]);
    invalidate([QueryKey.FindTutors]);
    close();
  }, [payload, invalidate, close]);

  const onUpdateError = useOnError({
    type: "mutation",
    handler: ({ messageId }) => {
      toast.error({
        title: intl("update-lesson.error"),
        description: intl(messageId),
      });
    },
  });

  const updateLessonMutation = useUpdateLesson({
    onSuccess: onUpdateSuccess,
    onError: onUpdateError,
  });

  // ====== Submit lesson details =========
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
      if (
        payload.type === "book" &&
        paidLessonStatus === ILesson.PaidLessonStatus.EligibleWithPayment
      )
        return navigate(
          router.web({
            route: Web.Checkout,
            query: {
              type: "paid-lesson",
              tutorId: nstr(tutorId),
              slotId: nstr(slotId),
              duration: nstr(duration),
              start,
            },
          })
        );

      if (payload.type === "book")
        return createLessonMutation
          .mutateAsync({
            tutorId,
            slotId,
            duration,
            start,
          })
          .then(() => refetch());

      updateLessonMutation
        .mutateAsync({
          lessonId: payload.lessonId,
          slotId,
          duration,
          start,
        })
        .then(() => refetch());
    },
    [
      payload.type,
      // @ts-expect-error property 'lessonId' does not exist on type payload all the time.
      payload.lessonId,
      paidLessonStatus,
      navigate,
      tutorId,
      createLessonMutation,
      updateLessonMutation,
      refetch,
    ]
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

  if (!user) return null;

  return (
    <>
      <SubscriptionDialog open={!canBook} close={close} />

      <ManageLessonDialog
        remainingWeeklyMinutes={asRemainingWeeklyMinutes}
        open={canBook}
        type={payload.type}
        slotId={payload.type === "update" ? payload.slotId : undefined}
        start={payload.type === "update" ? payload.start : undefined}
        duration={payload.type === "update" ? payload.duration : undefined}
        imageUrl={nullable(tutor.data?.image)}
        name={nullable(tutor.data?.name)}
        tutorId={tutorId}
        dateBoundaries={weekBoundaries}
        close={close}
        confirmationLoading={createLessonMutation.isPending}
        loading={
          tutorAvailabilitySlots.isLoading ||
          tutor.isPending ||
          lessons.query.isPending
        }
        bookedSlots={bookedSlots}
        slots={tutorAvailabilitySlots.data?.slots.list || []}
        onSubmit={onSubmit}
        subscribed={!!info}
        hasBookedLessons={hasBookedLessons}
        retry={tutorAvailabilitySlots.refetch}
        error={
          tutorAvailabilitySlots.isError ||
          lessons.query.isError ||
          tutor.isError
        }
      />
    </>
  );
};

export default ManageLesson;
