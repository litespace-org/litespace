import { Loading, LoadingError } from "@litespace/ui/Loading";
import { LessonCard, EmptyLessons, CancelLesson } from "@litespace/ui/Lessons";
import { ILesson, IUser, Void } from "@litespace/types";
import React, { useCallback, useMemo, useState } from "react";
import { InView } from "react-intersection-observer";
import { motion } from "framer-motion";
import { useCancelLesson } from "@litespace/headless/lessons";
import { useToast } from "@litespace/ui/Toast";
import { useQueryClient } from "@tanstack/react-query";
import { QueryKey } from "@litespace/headless/constants";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import ManageLesson, {
  ManageLessonPayload,
} from "@/components/Lessons/ManageLesson";
import { useUser } from "@litespace/headless/context/user";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import { getErrorMessageId } from "@litespace/ui/errorMessage";
import { useNavigateToRoom } from "@/hooks/chat";
import { useNavigate } from "react-router-dom";
import { capture } from "@/lib/sentry";
import { Web } from "@litespace/utils/routes";
import { router } from "@/lib/routes";
import { isStudent } from "@litespace/utils/user";
import { useSubscription } from "@litespace/headless/context/subscription";
import dayjs from "dayjs";
import { Typography } from "@litespace/ui/Typography";
import { Button } from "@litespace/ui/Button";
import { UNCANCELLABLE_LESSON_HOURS } from "@litespace/utils";
import CloseCircle from "@litespace/assets/CloseCircle";
import { ConfirmationDialog } from "@litespace/ui/ConfirmationDialog";
type Lessons = ILesson.FindUserLessonsApiResponse["list"];

export const Content: React.FC<{
  list: Lessons | null;
  loading: boolean;
  fetching: boolean;
  error: boolean;
  hasMore: boolean;
  more: Void;
  refetch: Void;
}> = ({ list, loading, fetching, error, hasMore, more, refetch }) => {
  const subscription = useSubscription();
  const { lg } = useMediaQuery();
  const queryClient = useQueryClient();
  const intl = useFormatMessage();
  const toast = useToast();
  const { user } = useUser();
  const navigate = useNavigate();

  const [cancelLessonData, setCancelLessonData] = useState<{
    id: number | null;
    start: string | null;
    otherMemberName: string | null;
    duration: number | null;
    tutorId: number | null;
    slotId: number | null;
  }>({
    id: null,
    start: null,
    otherMemberName: null,
    duration: null,
    tutorId: null,
    slotId: null,
  });
  const [manageLessonData, setManageLessonData] =
    useState<ManageLessonPayload | null>(null);

  const onCancelSuccess = useCallback(() => {
    toast.success({ title: intl("cancel-lesson.success") });
    subscription.refetch();
    setCancelLessonData(() => ({
      id: null,
      start: null,
      otherMemberName: null,
      duration: null,
      tutorId: null,
      slotId: null,
    }));
    queryClient.invalidateQueries({
      queryKey: [QueryKey.FindInfiniteLessons],
    });
  }, [toast, intl, subscription, queryClient]);

  const onCancelError = useCallback(
    (error: unknown) => {
      capture(error);
      const errorMessage = getErrorMessageId(error);
      toast.error({
        title: intl("cancel-lesson.error"),
        description: intl(errorMessage),
      });
    },
    [toast, intl]
  );

  const cancelLesson = useCancelLesson({
    onSuccess: onCancelSuccess,
    onError: onCancelError,
  });

  const getCancellerRole = useCallback(
    (canceledBy: number | null, tutorId: number) => {
      if (!canceledBy) return null;
      if (canceledBy === tutorId) return "tutor";
      return "student";
    },
    []
  );

  const { lessonId: sendingMessageLessonId, onSendMessage } =
    useNavigateToRoom();

  if (loading)
    return (
      <div className="mt-[15vh]">
        <Loading
          size={lg ? "large" : "small"}
          text={intl("upcoming-lessons.loading")}
        />
      </div>
    );

  if (error)
    return (
      <div className="mt-[15vh] mx-auto max-w-fit">
        <LoadingError
          size={lg ? "large" : "small"}
          error={intl("upcoming-lessons.loading-error")}
          retry={refetch}
        />
      </div>
    );

  if (!list || !list.length || !user)
    return (
      <div className="mt-[15vh]">
        <EmptyLessons tutorsPage={Web.Tutors} isStudent={isStudent(user)} />
      </div>
    );

  return (
    <div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(265px,1fr))] gap-x-2 md:gap-x-3 gap-y-4 md:gap-y-6">
        {list.map((item) => {
          const tutor = item.members.find(
            (member) =>
              member.role === IUser.Role.Tutor ||
              member.role === IUser.Role.TutorManager
          );

          const otherMember = item.members.find(
            (member) => member.role !== user.role
          );

          if (!tutor || !otherMember) return null;
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={item.lesson.id}
            >
              <LessonCard
                start={item.lesson.start}
                duration={item.lesson.duration}
                onJoin={() =>
                  navigate(
                    router.web({
                      route: Web.Lesson,
                      id: item.lesson.id,
                    })
                  )
                }
                onCancel={() =>
                  setCancelLessonData(() => ({
                    id: item.lesson.id,
                    start: item.lesson.start,
                    otherMemberName: otherMember.name,
                    duration: item.lesson.duration,
                    tutorId: tutor.userId,
                    slotId: item.lesson.slotId,
                  }))
                }
                onEdit={() => {
                  setManageLessonData({
                    type: "update",
                    lessonId: item.lesson.id,
                    slotId: item.lesson.slotId,
                    start: item.lesson.start,
                    duration: item.lesson.duration,
                    tutorId: tutor.userId,
                  });
                }}
                onRebook={() =>
                  setManageLessonData({ type: "book", tutorId: tutor.userId })
                }
                onSendMsg={() =>
                  onSendMessage(item.lesson.id, [user.id, otherMember?.userId])
                }
                canceled={getCancellerRole(
                  item.lesson.canceledBy,
                  tutor.userId
                )}
                reported={item.lesson.reported}
                member={{
                  id: otherMember.userId,
                  name: otherMember.name,
                  image: otherMember.image,
                  role:
                    otherMember.role === IUser.Role.Student
                      ? "student"
                      : "tutor",
                }}
                sendingMessage={sendingMessageLessonId === item.lesson.id}
                disabled={!!sendingMessageLessonId}
              />
            </motion.div>
          );
        })}
      </div>

      {fetching ? (
        <div className="mt-6">
          <Loading />
        </div>
      ) : null}

      {!fetching ? (
        <InView
          as="div"
          onChange={(inView) => {
            if (inView && hasMore) more();
          }}
        />
      ) : null}

      {cancelLessonData.id ? (
        <CancelDialogs
          isStudent={user.role === IUser.Role.Student}
          start={cancelLessonData.start}
          otherMemberName={cancelLessonData.otherMemberName}
          close={() =>
            setCancelLessonData({
              id: null,
              start: null,
              otherMemberName: null,
              duration: null,
              slotId: null,
              tutorId: null,
            })
          }
          onEdit={() =>
            setManageLessonData(() => {
              return {
                lessonId: cancelLessonData.id || 0,
                duration: cancelLessonData.duration || 0,
                start: cancelLessonData.start || "",
                slotId: cancelLessonData.slotId || 0,
                tutorId: cancelLessonData.tutorId || 0,
                type: "update",
              };
            })
          }
          cancel={() => {
            if (!cancelLessonData.id) return;
            cancelLesson.mutate({ id: cancelLessonData.id });
          }}
        />
      ) : null}

      {manageLessonData ? (
        <ManageLesson
          close={() => {
            setManageLessonData(null);
          }}
          onSuccess={() => {
            toast.success({ title: intl("update-lesson.success") });
          }}
          {...manageLessonData}
        />
      ) : null}
    </div>
  );
};

export default Content;

const CancelDialogs: React.FC<{
  isStudent: boolean;
  start: string | null;
  otherMemberName: string | null;
  close: Void;
  onEdit: Void;
  cancel: Void;
}> = ({ isStudent, start, otherMemberName, close, onEdit, cancel }) => {
  const intl = useFormatMessage();

  const [canCancel, setCanCancel] = useState<boolean>(!isStudent);

  const hoursToStart = useMemo(() => {
    const now = dayjs();
    const diff = dayjs(start).diff(now, "hours");
    return diff;
  }, [start]);

  return (
    <div>
      {isStudent ? (
        <ConfirmationDialog
          title=""
          type="main"
          className="!w-[400px]"
          close={close}
          open={hoursToStart <= UNCANCELLABLE_LESSON_HOURS}
          actions={{
            primary: {
              label: intl("labels.ok"),
              onClick: close,
            },
          }}
          icon={<CloseCircle className="[&>*]:!stroke-brand-500" />}
        >
          <Typography tag="p" className="font-cairo font-semibold text-body">
            {intl("cancel-lesson.with-tutor.title", {
              value: otherMemberName,
            })}
          </Typography>

          <Typography
            tag="p"
            className="mt-1 text-caption text-natural-700 font-cairo font-normal"
          >
            {intl("cancel-lesson.description.within-6-hours")}
          </Typography>
        </ConfirmationDialog>
      ) : null}
      {isStudent ? (
        <ConfirmationDialog
          title=""
          open={hoursToStart > UNCANCELLABLE_LESSON_HOURS && !canCancel}
          className="!w-[100%] max-w-[550px] md:max-w-[400px] mx-auto"
          icon={<CloseCircle className="[&>*]:!stroke-brand-500" />}
          close={close}
        >
          <Typography
            tag="p"
            className="font-cairo font-semibold text-body mb-1"
          >
            {intl("cancel-lesson.description.before-6-hours-1", {
              value: otherMemberName,
            })}
          </Typography>

          <Typography
            tag="p"
            className="font-cairo font-normal text-caption text-natural-700"
          >
            {intl("cancel-lesson.description.before-6-hours-2")}
          </Typography>

          <Typography
            tag="p"
            className="font-cairo font-normal text-caption text-natural-700"
          >
            {intl("cancel-lesson.description.before-6-hours-3")}
          </Typography>

          <Typography
            tag="p"
            className="font-cairo font-normal text-caption text-natural-700"
          >
            {intl("cancel-lesson.description.before-6-hours-4")}
          </Typography>

          <div className="flex flex-row items-center gap-3 mt-[24px]">
            <Button
              className="flex-1"
              variant="secondary"
              size="large"
              onClick={() => {
                onEdit();
                close();
              }}
            >
              {intl("cancel-lesson.with-tutor.buttons.change-date")}
            </Button>

            <Button className="flex-1" size="large" onClick={close}>
              {intl("labels.confirm")}
            </Button>
          </div>

          <Button
            className="w-full mt-[16px] "
            size="large"
            type="natural"
            variant="secondary"
            onClick={() => setCanCancel(true)}
          >
            {intl("cancel-lesson.with-tutor.buttons.cancel")}
          </Button>
        </ConfirmationDialog>
      ) : null}

      <CancelLesson
        open={canCancel}
        close={() => {
          setCanCancel(false);
          close();
        }}
        onCancel={cancel}
        otherMemberName={otherMemberName}
        isStudent={isStudent}
      />
    </div>
  );
};
