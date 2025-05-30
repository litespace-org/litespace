import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { IUser } from "@litespace/types";
import { UseQueryResult } from "@tanstack/react-query";
import React from "react";
import PageTitle from "@/components/Common/PageTitle";
import StatsContent from "@/components/Students/StatsContent";

const Stats: React.FC<{
  stats: UseQueryResult<IUser.FindStudentStatsApiResponse | null>;
}> = ({ stats }) => {
  const intl = useFormatMessage();

  return (
    <>
      <PageTitle
        title={intl("stats.student.title")}
        fetching={stats.isFetching && !stats.isLoading}
      />

      <StatsContent
        loading={stats.isLoading}
        error={stats.error}
        data={stats.data}
        refetch={stats.refetch}
      />
    </>
  );
};

export default Stats;
