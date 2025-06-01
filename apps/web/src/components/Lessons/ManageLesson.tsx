import { ManageLessonDialog } from "@litespace/ui/Lessons";
import { ILesson, Void } from "@litespace/types";
import {
  useCreateLesson,
  useFindLessons,
  useUpdateLesson,
} from "@litespace/headless/lessons";
import React, { useMemo, useCallback, useRef } from "react";
import { useToast } from "@litespace/ui/Toast";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { QueryKey } from "@litespace/headless/constants";
import { useFindAvailabilitySlots } from "@litespace/headless/availabilitySlots";
import { useFindTutorInfo } from "@litespace/headless/tutor";
import { nullable } from "@litespace/utils/utils";
import dayjs from "@/lib/dayjs";
import { useInvalidateQuery } from "@litespace/headless/query";
import { useUser } from "@litespace/headless/context/user";
import { useOnError } from "@/hooks/error";
import { VerifyEmail } from "@/components/Common/VerifyEmail";
import { useRender } from "@litespace/headless/common";
import { useEnableNotificationsToastAction } from "@/hooks/notification";
import { useSubscription } from "@litespace/headless/context/subscription";
import { asSlotBoundries } from "@/lib/lesson";
import { isTutorManager, MAX_LESSON_DURATION } from "@litespace/utils";

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
 * A wrapper for the book lesson dialog where users can either
 * book new lessons or edit existing lesson
 */
const ManageLesson: React.FC<Props> = ({ close, tutorId, ...payload }) => {
  const { user } = useUser();
  const toast = useToast();
  const intl = useFormatMessage();
  const invalidate = useInvalidateQuery();
  const now = useRef(dayjs());

  const verifyEmailDialog = useRender();

  // ====== Check if user has any booked lessons =========
  const lessons = useFindLessons({
    canceled: false,
    users: user ? [user?.id] : [],
    after: now.current.toISOString(),
    userOnly: true,
    size: 1,
  });
  const hasBookedLessons = useMemo(() => {
    return !!lessons.query.data && !!lessons.query.data.list.length;
  }, [lessons]);

  // ====== get tutorInfo =========
  const { query: tutor } = useFindTutorInfo(tutorId);

  // ====== get subscribtion details and get the boundries you filter the availability slots on =========
  const { info, remainingWeeklyMinutes } = useSubscription();
  const slotBoundries = useMemo(
    () =>
      asSlotBoundries({
        start: info?.start,
        end: info?.end,
      }),
    [info]
  );

  const tutorAvailabilitySlots = useFindAvailabilitySlots({
    userIds: [tutorId],
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

  // ====== Create Lesson Mutation =========
  const enableNotifications = useEnableNotificationsToastAction();
  const onCreateSuccess = useCallback(() => {
    if (tutor.data?.name)
      toast.success({
        title: intl("book-lesson.success", { tutor: tutor.data.name }),
        actions: enableNotifications.show ? [enableNotifications.action] : [],
      });
    invalidate([QueryKey.FindAvailabilitySlots]);
    invalidate([QueryKey.FindLesson]);
    invalidate([QueryKey.FindInfiniteLessons]);
    invalidate([QueryKey.FindTutors]);
    close();
  }, [
    intl,
    toast,
    tutor.data?.name,
    enableNotifications.show,
    enableNotifications.action,
    invalidate,
    close,
  ]);

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

  // ====== Update Lesson Mutation =========
  const onUpdateSuccess = useCallback(() => {
    if (tutor.data?.name)
      toast.success({
        title: intl("update-lesson.success", { tutor: tutor.data.name }),
        actions: enableNotifications.show ? [enableNotifications.action] : [],
      });
    invalidate([QueryKey.FindAvailabilitySlots]);
    invalidate([QueryKey.FindLesson]);
    invalidate([QueryKey.FindInfiniteLessons]);
    invalidate([QueryKey.FindTutors]);
    close();
  }, [
    intl,
    toast,
    tutor.data?.name,
    enableNotifications.show,
    enableNotifications.action,
    invalidate,
    close,
  ]);

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

  // ====== Submit Lesson Details =========
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

  if (!user) return null;

  return (
    <>
      {!verifyEmailDialog.open ? (
        <ManageLessonDialog
          remainingWeeklyMinutes={asRemainingWeeklyMinutes}
          open
          type={payload.type}
          slotId={payload.type === "update" ? payload.slotId : undefined}
          start={payload.type === "update" ? payload.start : undefined}
          duration={payload.type === "update" ? payload.duration : undefined}
          imageUrl={nullable(tutor.data?.image)}
          name={nullable(tutor.data?.name)}
          tutorId={tutorId}
          close={close}
          confirmationLoading={createLessonMutation.isPending}
          loading={
            tutorAvailabilitySlots.isLoading ||
            tutor.isPending ||
            lessons.query.isPending
          }
          sendVerifyEmail={() => {
            verifyEmailDialog.show();
          }}
          bookedSlots={bookedSlots}
          slots={tutorAvailabilitySlots.data?.slots.list || []}
          onSubmit={onSubmit}
          isVerified={user?.verifiedEmail}
          hasBookedLessons={hasBookedLessons}
          retry={tutorAvailabilitySlots.refetch}
          error={
            tutorAvailabilitySlots.isError ||
            lessons.query.isError ||
            tutor.isError
          }
        />
      ) : null}

      <VerifyEmail
        open={verifyEmailDialog.open}
        close={verifyEmailDialog.hide}
      />
    </>
  );
};

export default ManageLesson;
