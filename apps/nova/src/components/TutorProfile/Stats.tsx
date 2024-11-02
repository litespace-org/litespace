import { formatNumber } from "@litespace/luna/components/utils";
import { Card } from "@litespace/luna/components/Card";
import { Loading } from "@litespace/luna/components/Loading";
import { LocalId } from "@litespace/luna/locales";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { ITutor } from "@litespace/types";
import { UseQueryResult } from "@tanstack/react-query";
import React, { useMemo } from "react";
import humanize from "humanize-duration";

type StatProps = { id: LocalId; value: React.ReactNode };

const Stat: React.FC<StatProps> = ({ id, value }) => {
  const intl = useFormatMessage();
  return (
    <Card className="w-full h-full">
      <h3 className="mb-1 text-xl font-semibold text-foreground-light">
        {intl(id)}
      </h3>
      <span className="text-3xl leading-none md:text-4xl">{value}</span>
    </Card>
  );
};

const Stats: React.FC<{
  query: UseQueryResult<ITutor.FindTutorStatsApiResponse | null, Error>;
}> = ({ query }) => {
  const stats = useMemo((): StatProps[] => {
    if (!query.data) return [];
    return [
      {
        id: "stats.teaching.hours",
        // todo: move to luna
        value: humanize(query.data.totalMinutes * 60 * 1000, {
          language: "ar",
          digitReplacements: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
        }),
      },
      {
        id: "stats.student.count",
        value: formatNumber(query.data.studentCount),
      },
      { id: "stats.lesson.count", value: formatNumber(query.data.lessonCount) },
    ];
  }, [query.data]);

  if (query.isLoading) return <Loading className="h-60" />;
  if (query.isError || !query.data) return <h1>Error</h1>;

  return (
    <div className="grid grid-cols-12 gap-4">
      {stats.map((stat) => (
        <div className="h-full col-span-12 lg:col-span-6" key={stat.id}>
          <Stat {...stat} />
        </div>
      ))}
    </div>
  );
};

export default Stats;
