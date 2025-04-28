import { ManageLessonDialog } from "@litespace/ui/Lessons";
import { ILesson, Void } from "@litespace/types";
import {
  useCreateLesson,
  useFindLessons,
  useUpdateLesson,
} from "@litespace/headless/lessons";
import { useMemo, useCallback } from "react";
import { useToast } from "@litespace/ui/Toast";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { QueryKey } from "@litespace/headless/constants";
import { useFindAvailabilitySlots } from "@litespace/headless/availabilitySlots";
import { useFindTutorInfo } from "@litespace/headless/tutor";
import { nullable } from "@litespace/utils/utils";
import { getErrorMessageId } from "@litespace/ui/errorMessage";
import dayjs from "@/lib/dayjs";
import { useInvalidateQuery } from "@litespace/headless/query";
import { capture } from "@/lib/sentry";
import { useUserContext } from "@litespace/headless/context/user";
import { useSendVerifyEmail } from "@litespace/headless/auth";
import { VERIFY_EMAIL_CALLBACK_URL } from "@/lib/routes";
import { useOnError } from "@/hooks/error";

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
  const { user } = useUserContext();
  const toast = useToast();
  const intl = useFormatMessage();
  const invalidate = useInvalidateQuery();

  const availabilitySlotsQuery = useMemo(
    () => ({
      userId: tutorId,
      after: dayjs.utc().toISOString(),
      before: dayjs.utc().add(2, "week").toISOString(),
    }),
    [tutorId]
  );

  const lessons = useFindLessons({
    canceled: false,
    users: user ? [user?.id] : [],
    after: dayjs().toISOString(),
    userOnly: true,
    size: 1,
  });

  const hasBookedLessons = useMemo(() => {
    return !!lessons.query.data && !!lessons.query.data.list.length;
  }, [lessons]);

  const { query: tutorAvailabilitySlots } = useFindAvailabilitySlots(
    availabilitySlotsQuery
  );
  const { query: tutor } = useFindTutorInfo(tutorId);

  // Create Lesson
  const onCreateSuccess = useCallback(() => {
    if (tutor.data?.name)
      toast.success({
        title: intl("book-lesson.success", { tutor: tutor.data.name }),
      });
    invalidate([QueryKey.FindAvailabilitySlots]);
    invalidate([QueryKey.FindLesson]);
    invalidate([QueryKey.FindInfiniteLessons]);
    invalidate([QueryKey.FindTutors]);
    close();
  }, [close, tutor.data?.name, toast, intl, invalidate]);

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

  const onSendVerifyEmailSuccess = useCallback(() => {
    toast.success({
      title: intl("student-settings.confirm-email.success.title"),
      description: intl("student-settings.confirm-email.success.desc"),
    });
  }, [toast, intl]);

  const onSendVerifyEmailError = useCallback(
    (error: unknown) => {
      capture(error);

      toast.error({
        title: intl("student-settings.confirm-email.error"),
        description: intl(getErrorMessageId(error)),
      });
    },
    [toast, intl]
  );

  const sendVerifyEmail = useSendVerifyEmail({
    onSuccess: onSendVerifyEmailSuccess,
    onError: onSendVerifyEmailError,
  });

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
    <ManageLessonDialog
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
      sendVerifyEmail={() => sendVerifyEmail.mutate(VERIFY_EMAIL_CALLBACK_URL)}
      bookedSlots={bookedSlots}
      slots={tutorAvailabilitySlots.data?.slots.list || []}
      onSubmit={onSubmit}
      isVerified={user?.verifiedEmail}
      hasBookedLessons={hasBookedLessons}
      open
      retry={tutorAvailabilitySlots.refetch}
      error={
        tutorAvailabilitySlots.isError || lessons.query.isError || tutor.isError
      }
    />
  );
};

export default ManageLesson;
