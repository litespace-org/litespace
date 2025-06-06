import React, { useMemo } from "react";
import { useFindInterviews } from "@litespace/headless/interviews";
import { Loading, LoadingError } from "@litespace/ui/Loading";
import { first } from "lodash";
import Book from "@/components/TutorOnboarding/Steps/Interview/Book";
import dayjs from "@/lib/dayjs";
import {
  destructureInterviewStatus,
  INTERVIEW_DURATION,
  INTERVIEW_MIN_RETRY_PERIOD_IN_DAYS,
} from "@litespace/utils";
import Pending from "@/components/TutorOnboarding/Steps/Interview/Pending";
import Result from "@/components/TutorOnboarding/Steps/Interview/Result";

const Interview: React.FC<{ selfId: number }> = ({ selfId }) => {
  const { query } = useFindInterviews({
    users: [selfId],
    page: 1,
    size: 1,
  });

  const interview = useMemo(
    () => first(query.data?.list) || null,
    [query.data?.list]
  );

  const state = useMemo((): "book" | "pending" | "result" => {
    // book a new interview if no existing interviews are found
    if (!interview) return "book";
    const status = destructureInterviewStatus(interview.status);

    // give the tutor the option to join the interview in case it is still in
    // progress.
    const end = dayjs(interview.start).add(INTERVIEW_DURATION, "minutes");
    if (end.isAfter(dayjs()) && status.pending) return "pending";

    const rebook =
      status.rejected &&
      dayjs().diff(interview.createdAt, "days") >=
        INTERVIEW_MIN_RETRY_PERIOD_IN_DAYS;
    // allow the tutor to rebook an interview in case the previous interview was
    // canceled or was rejected more than 3 months ago.
    if (status.canceled || rebook) return "book";

    return "result";
  }, [interview]);

  if (query.isLoading)
    return (
      <div className="mx-auto mt-[15vh]">
        <Loading size="large" />
      </div>
    );

  if (query.isError)
    return (
      <div className="mx-auto mt-[15vh]">
        <LoadingError size="small" retry={query.refetch} />
      </div>
    );

  if (state === "book")
    return <Book sync={query.refetch} syncing={query.isPending} />;
  if (state === "pending" && interview)
    return (
      <Pending
        interview={interview}
        sync={query.refetch}
        syncing={query.isPending}
      />
    );
  if (state === "result") return <Result />;
  throw new Error("unsupported interview state, should never happen");
};

export default Interview;
