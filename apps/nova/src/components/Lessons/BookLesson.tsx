import { useFindUserRulesWithSlots } from "@litespace/headless/rule";
import { BookLessonDialog } from "@litespace/luna/Lessons";
import { ILesson, Void } from "@litespace/types";
import { useCreateLesson } from "@litespace/headless/lessons";
import dayjs from "dayjs";
import { useCallback } from "react";
import { useToast } from "@litespace/luna/Toast";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { useQueryClient } from "@tanstack/react-query";
import { QueryKey } from "@litespace/headless/constants";

const BookLesson = ({
  open,
  close,
  user,
}: {
  open: boolean;
  close: Void;
  user: {
    tutorId: number;
    name: string | null;
    imageUrl: string | null;
    notice: number;
  };
}) => {
  const intl = useFormatMessage();
  const toast = useToast();
  const before = dayjs().toISOString();
  const after = dayjs(before).add(user.notice, "minutes").toISOString();
  const queryClient = useQueryClient();
  const rulesQuery = useFindUserRulesWithSlots({
    id: user.tutorId,
    before,
    after,
  });

  const onSuccess = useCallback(() => {
    close();
    toast.success({ title: intl("book-lesson.success", { tutor: user.name }) });
    queryClient.invalidateQueries({
      queryKey: [
        QueryKey.FindRulesWithSlots,
        QueryKey.FindLesson,
        QueryKey.FindTutors,
      ],
    });
  }, [toast, intl, user.name, close, queryClient]);

  const onError = useCallback(() => {
    toast.error({ title: intl("book-lesson.error") });
  }, [toast, intl]);

  const bookLessonMutation = useCreateLesson({
    tutorId: user.tutorId,
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
    }) => bookLessonMutation.mutate({ ruleId, start, duration }),
    [bookLessonMutation]
  );

  return (
    <BookLessonDialog
      {...user}
      open={open}
      close={close}
      confirmationLoading={bookLessonMutation.isPending}
      loading={rulesQuery.isLoading}
      rules={rulesQuery.data?.rules || []}
      slots={rulesQuery.data?.slots || []}
      notice={user.notice}
      onBook={onBook}
    />
  );
};

export default BookLesson;
