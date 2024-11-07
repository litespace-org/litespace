import Detail from "@/components/common/Detail";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { Duration } from "@litespace/sol/duration";
import { ITutor } from "@litespace/types";
import React from "react";

type StatsProps = {
  data: ITutor.FindTutorStatsApiResponse;
};

const Stats: React.FC<StatsProps> = ({ data }) => {
  const intl = useFormatMessage();
  return (
    <div className="p-4 mx-auto border border-border-strong rounded-md drop-shadow-xl">
      <div className="grid gap-6 mt-4 sm:grid-cols-2">
        <Detail variant="row" label={intl("stats.lesson.count")}>
          {data.lessonCount}
          &nbsp;
          {intl("labels.lesson")}
        </Detail>
        <Detail variant="row" label={intl("stats.student.count")}>
          {data.studentCount}
          &nbsp;
          {intl("labels.student")}
        </Detail>
        <Detail variant="row" label={intl("stats.teaching.hours")}>
          {Duration.from(data.totalMinutes.toString()).format("ar")}
        </Detail>
      </div>
    </div>
  );
};

export default Stats;
