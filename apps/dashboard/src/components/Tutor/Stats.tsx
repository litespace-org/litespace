import Title from "@/components/Common/Title";
import StatsContent from "@/components/Tutor/StatsContent";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { IInvoice } from "@litespace/types";
import { UseQueryResult } from "@tanstack/react-query";
import React from "react";

const Stats: React.FC<{
  stats: UseQueryResult<IInvoice.StatsApiResponse | null>;
}> = ({ stats }) => {
  const intl = useFormatMessage();

  return (
    <>
      <header className="flex items-center justify-between mb-3">
        <Title
          title={intl("stats.tutor.financial.title")}
          fetching={stats.isFetching && !stats.isLoading}
        />
      </header>
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
