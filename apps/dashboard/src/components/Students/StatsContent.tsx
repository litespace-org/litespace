import LablesTable, { TableLablesRow } from "@/components/Common/LabelsTable";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Loading } from "@litespace/ui/Loading";
import { formatNumber } from "@litespace/ui/utils";
import { Duration } from "@litespace/utils/duration";
import { IUser, Void } from "@litespace/types";
import ErrorElement from "@/components/Common/Error";
import React, { useMemo } from "react";

const StatsContent: React.FC<{
  loading: boolean;
  error: Error | null;
  data?: IUser.FindStudentStatsApiResponse | null;
  refetch: Void;
}> = ({ loading, error, data, refetch }) => {
  const intl = useFormatMessage();

  const labels = useMemo((): TableLablesRow[] => {
    if (!data) return [];
    return [
      {
        label: intl("stats.student.lesson.count.total"),
        value: formatNumber(data.lessonCount.total),
      },
      {
        label: intl("stats.student.lesson.count.ratified"),
        value: formatNumber(data.lessonCount.ratified),
      },
      {
        label: intl("stats.student.lesson.count.canceled"),
        value: formatNumber(data.lessonCount.canceled),
      },
      {
        label: intl("stats.student.lesson.count.future.total"),
        value: formatNumber(data.lessonCount.future.total),
      },
      {
        label: intl("stats.student.lesson.count.future.ratified"),
        value: formatNumber(data.lessonCount.future.ratified),
      },
      {
        label: intl("stats.student.lesson.count.future.canceled"),
        value: formatNumber(data.lessonCount.future.canceled),
      },
      {
        label: intl("stats.student.lesson.count.past.ratified"),
        value: formatNumber(data.lessonCount.future.ratified),
      },
      {
        label: intl("stats.student.lesson.count.past.canceled"),
        value: formatNumber(data.lessonCount.future.canceled),
      },
      {
        label: intl("stats.student.tutor.count.total"),
        value: formatNumber(data.tutorCount.total),
      },
      {
        label: intl("stats.student.tutor.count.ratified"),
        value: formatNumber(data.tutorCount.ratified),
      },
      {
        label: intl("stats.student.tutor.count.canceled"),
        value: formatNumber(data.tutorCount.canceled),
      },
      {
        label: intl("stats.student.time.total"),
        value: Duration.from(data.minutes.total.toString()).format("ar"),
      },
      {
        label: intl("stats.student.time.ratified"),
        value: Duration.from(data.minutes.ratified.toString()).format("ar"),
      },
      {
        label: intl("stats.student.time.canceled"),
        value: Duration.from(data.minutes.canceled.toString()).format("ar"),
      },
    ];
  }, [data, intl]);

  if (loading) return <Loading />;

  if (error)
    return (
      <ErrorElement
        title={intl("stats.student.fetching.error")}
        error={error}
        refetch={refetch}
      />
    );

  return <LablesTable rows={labels} />;
};

export default StatsContent;
