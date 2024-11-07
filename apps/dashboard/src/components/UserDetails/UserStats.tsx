import { useFindTutorStats } from "@litespace/headless/tutor";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import React from "react";
import PageTitle from "@/components/common/PageTitle";
import ErrorElement from "@/components/common/Error";
import Stats from "@/components/Tutor/Stats";
import { Loading } from "@litespace/luna/Loading";

type UserStatsProps = {
  id: number;
};

const UserStats: React.FC<UserStatsProps> = ({ id }) => {
  const intl = useFormatMessage();
  const stats = useFindTutorStats(id);

  if (stats.isLoading) return <Loading className="h-[40vh]" />;
  if (stats.isError)
    return (
      <ErrorElement
        title={intl("error.unexpected")}
        refetch={stats.refetch}
        error={stats.error}
      />
    );
  if (!stats.data) return;
  return (
    <>
      <PageTitle
        title={intl("dashboard.user.stats.title")}
        variant="secondary"
        fetching={stats.isFetching && !stats.isLoading}
        classNames="p-4"
      />
      <Stats data={stats.data} />
    </>
  );
};

export default UserStats;
