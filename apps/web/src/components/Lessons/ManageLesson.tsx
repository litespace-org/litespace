import { VerifyEmail } from "@/components/Common/VerifyEmail";
import { useOnError } from "@/hooks/error";
import { useEnableNotificationsToastAction } from "@/hooks/notification";
import dayjs from "@/lib/dayjs";
import { asSlotBoundries } from "@/lib/lesson";
import Notification from "@litespace/assets/Notification";
import { useFindAvailabilitySlots } from "@litespace/headless/availabilitySlots";
import { useRender } from "@litespace/headless/common";
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
import { ILesson, Void } from "@litespace/types";
import { Button } from "@litespace/ui/Button";
import { Dialog } from "@litespace/ui/Dialog";
import { ManageLessonDialog } from "@litespace/ui/Lessons";
import { useToast } from "@litespace/ui/Toast";
import { Typography } from "@litespace/ui/Typography";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { LocalId } from "@litespace/ui/locales";
import { isTutorManager, MAX_LESSON_DURATION } from "@litespace/utils";
import { nullable } from "@litespace/utils/utils";
import React, { useCallback, useMemo, useRef, useState } from "react";

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

  const [manageLessonOpen, setManageLessonOpen] = useState<boolean>(true);
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);

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

  // ====== Toast function =========
  const showSuccessToast = useCallback(
    (isCreateAction: boolean) =>
      toast.success({
        title: "",
        description: intl(
          isCreateAction ? "book-lesson.success" : "update-lesson.success",
          { tutor: tutor.data?.name }
        ),
      }),
    [intl, toast, tutor.data?.name]
  );

  // ====== Create Lesson Mutation =========
  const enableNotifications = useEnableNotificationsToastAction();

  const onCreateSuccess = useCallback(() => {
    if (enableNotifications.show) {
      setManageLessonOpen(false);
      return setNotificationsOpen(true);
    }

    if (!enableNotifications.show) showSuccessToast(true);

    invalidate([QueryKey.FindAvailabilitySlots]);
    invalidate([QueryKey.FindLesson]);
    invalidate([QueryKey.FindInfiniteLessons]);
    invalidate([QueryKey.FindTutors]);
    close();
  }, [enableNotifications.show, showSuccessToast, invalidate, close]);

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
    if (enableNotifications.show) {
      setManageLessonOpen(false);
      return setNotificationsOpen(true);
    }
    if (tutor.data?.name) showSuccessToast(false);

    invalidate([QueryKey.FindAvailabilitySlots]);
    invalidate([QueryKey.FindLesson]);
    invalidate([QueryKey.FindInfiniteLessons]);
    invalidate([QueryKey.FindTutors]);
    close();
  }, [
    enableNotifications.show,
    tutor.data?.name,
    showSuccessToast,
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
          open={manageLessonOpen}
          type={payload.type}
          slotId={payload.type === "update" ? payload.slotId : undefined}
          start={payload.type === "update" ? payload.start : undefined}
          duration={payload.type === "update" ? payload.duration : undefined}
          imageUrl={nullable(tutor.data?.image)}
          name={nullable(tutor.data?.name)}
          tutorId={tutorId}
          close={() => {
            close();
            setManageLessonOpen(false);
          }}
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

      <NotificationsDialog
        open={notificationsOpen}
        close={() => {
          setNotificationsOpen(false);
          showSuccessToast(payload.type === "book");
        }}
        enableNotifications={() => {
          setNotificationsOpen(false);
          enableNotifications.action();
        }}
      />
    </>
  );
};

const LIST_ITEMS: LocalId[] = [
  "book-lesson.success.activate-notifications.benefits-1",
  "book-lesson.success.activate-notifications.benefits-2",
  "book-lesson.success.activate-notifications.benefits-3",
  "book-lesson.success.activate-notifications.benefits-4",
];

const List: React.FC = () => {
  const intl = useFormatMessage();

  return (
    <div className="flex flex-col">
      {LIST_ITEMS.map((item, idx) => {
        return (
          <div key={idx} className="flex items-center">
            <div className="bg-natural-700 w-1 h-1 overflow-hidden mx-2" />
            <Typography
              tag="p"
              className="text-caption font-regular text-natural-700"
            >
              {intl(item)}
            </Typography>
          </div>
        );
      })}
    </div>
  );
};

const NotificationsDialog: React.FC<{
  open: boolean;
  close: Void;
  enableNotifications: Void;
}> = ({ open, close, enableNotifications }) => {
  const intl = useFormatMessage();

  return (
    <Dialog
      open={open}
      close={close}
      title={
        <div className="w-12 h-12 bg-brand-50 rounded-full overflow-hidden flex items-center justify-center">
          <Notification className="relative w-6 h-6 [&>*]:stroke-brand-500 bg-brand-100 rounded-full overflow-hidden p-1" />
        </div>
      }
    >
      <div className="flex flex-col gap-1 mt-4 mb-6">
        <Typography
          tag="p"
          className="text-body font-semibold text-natural-950"
        >
          {intl("book-lesson.success.activate-notifications.desc")}
        </Typography>
        <List />
      </div>
      <div className="flex gap-3">
        <Button
          size="large"
          variant="secondary"
          className="text flex-1"
          onClick={close}
        >
          {intl("labels.not-now")}
        </Button>
        <Button
          size="large"
          className="text flex-1"
          onClick={enableNotifications}
        >
          {intl("labels.enable-notifications")}
        </Button>
      </div>
    </Dialog>
  );
};

export default ManageLesson;
