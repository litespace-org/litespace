import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { IUser } from "@litespace/types";
import { UseQueryResult } from "@tanstack/react-query";
import React from "react";
import PageTitle from "@/components/common/PageTitle";
import Row from "@/components/Students/Row";

type ReactProps = {
  stats: UseQueryResult<IUser.FindStudentStatsApiResponse>;
};

const Stats: React.FC<ReactProps> = ({ stats }) => {
  const intl = useFormatMessage();

  return (
    <>
      <PageTitle
        className="p-4"
        title={intl("stats.student.title")}
        fetching={stats.isFetching}
        variant="secondary"
      />
      <div className="rounded-md border border-border-strong">
        <table className="w-full table-auto">
          <tbody>
            <Row
              th={intl("stats.lesson.count.total")}
              td={stats.data?.lessonCount.total}
            />
            <Row
              th={intl("stats.lesson.count.ratified")}
              td={stats.data?.lessonCount.ratified}
            />
            <Row
              th={intl("stats.lesson.count.canceled")}
              td={stats.data?.lessonCount.canceled}
            />
            <Row
              th={intl("stats.lesson.count.future.total")}
              td={stats.data?.lessonCount.future.total}
            />
            <Row
              th={intl("stats.lesson.count.future.ratified")}
              td={stats.data?.lessonCount.future.ratified}
            />
            <Row
              th={intl("stats.lesson.count.future.canceled")}
              td={stats.data?.lessonCount.future.canceled}
            />
            <Row
              th={intl("stats.lesson.count.past.total")}
              td={stats.data?.lessonCount.past.total}
            />
            <Row
              th={intl("stats.lesson.count.past.ratified")}
              td={stats.data?.lessonCount.past.ratified}
            />
            <Row
              th={intl("stats.lesson.count.past.canceled")}
              td={stats.data?.lessonCount.past.canceled}
            />
            <Row
              th={intl("stats.tutor.count.total")}
              td={stats.data?.tutorCount.total}
            />
            <Row
              th={intl("stats.tutor.count.ratified")}
              td={stats.data?.tutorCount.ratified}
            />
            <Row
              th={intl("stats.tutor.count.canceled")}
              td={stats.data?.tutorCount.canceled}
            />
            <Row th={intl("stats.time.total")} td={stats.data?.minutes.total} />
            <Row
              th={intl("stats.time.ratified")}
              td={stats.data?.minutes.ratified}
            />
            <Row
              th={intl("stats.time.canceled")}
              td={stats.data?.minutes.canceled}
            />
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Stats;
