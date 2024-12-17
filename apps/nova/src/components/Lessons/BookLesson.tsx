import { useFindUserRulesWithSlots } from "@litespace/headless/rule";
import { BookLessonDialog } from "@litespace/luna/Lessons";
import { ILesson, Void } from "@litespace/types";
import { useCreateLesson } from "@litespace/headless/lessons";
import dayjs from "dayjs";
import { useCallback, useMemo } from "react";
import { useToast } from "@litespace/luna/Toast";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { useQueryClient } from "@tanstack/react-query";
import { QueryKey } from "@litespace/headless/constants";
import { useFindTutorInfo } from "@litespace/headless/tutor";
import { orNull } from "@litespace/sol/utils";

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
  const rulesQuery = useFindUserRulesWithSlots(
    useMemo(
      () => ({
        id: tutorId,
        after: dayjs().utc().toISOString(),
        before: dayjs.utc().add(60, "days").toISOString(),
      }),
      [tutorId]
    )
  );
  const tutor = useFindTutorInfo(tutorId);

  const onSuccess = useCallback(() => {
    close();

    if (tutor.data && tutor.data.name)
      toast.success({
        title: intl("book-lesson.success", { tutor: tutor.data.name }),
      });

    queryClient.invalidateQueries({
      queryKey: [
        QueryKey.FindRulesWithSlots,
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
      ruleId,
      start,
      duration,
    }: {
      ruleId: number;
      start: string;
      duration: ILesson.Duration;
    }) => bookLessonMutation.mutate({ tutorId, ruleId, start, duration }),
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
      loading={rulesQuery.isLoading || tutor.isLoading || tutor.isFetching}
      rules={rulesQuery.data?.rules || []}
      slots={rulesQuery.data?.slots || []}
      notice={orNull(tutor.data?.notice)}
      onBook={onBook}
    />
  );
};

export default BookLesson;
