import React from "react";
import PageTitle from "@/components/common/PageTitle";
import List from "@/components/Interviews/List";
import { useFindInterviews } from "@litespace/headless/interviews";
import { useFormatMessage } from "@litespace/luna/hooks/intl";

const Content: React.FC<{ user?: number }> = ({ user }) => {
  const intl = useFormatMessage();
  const interviews = useFindInterviews({ user, userOnly: !!user });

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <PageTitle
          title={intl("dashboard.interviews.title")}
          count={interviews.query.data?.total}
          fetching={interviews.query.isFetching && !interviews.query.isLoading}
        />
      </div>

      <List
        {...interviews}
        query={interviews}
        refresh={interviews.query.refetch}
      />
    </div>
  );
};

export default Content;
