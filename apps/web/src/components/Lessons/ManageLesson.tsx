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

  const tutorAvailabilitySlots = useFindAvailabilitySlots({
    userIds: [tutorId],
    after: now.current.utc().toISOString(),
    before: now.current.utc().add(2, "week").toISOString(),
  });
  const { query: tutor } = useFindTutorInfo(tutorId);
  const enableNotifications = useEnableNotificationsToastAction();

  // book lesson
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

  // update lesson
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
