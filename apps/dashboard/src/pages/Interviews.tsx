import PageTitle from "@/components/common/PageTitle";
import List from "@/components/interviews/List";
import { useFindInterviews } from "@litespace/headless/interviews";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import cn from "classnames";
import React from "react";

export const Interviews: React.FC = () => {
  const intl = useFormatMessage();
  const interviews = useFindInterviews();

  return (
    <div className={cn("w-full flex flex-col max-w-screen-2xl mx-auto p-6")}>
      <header className="flex items-center justify-between mb-3">
        <PageTitle
          title={intl("dashboard.interviews.title")}
          count={interviews.query.data?.total}
          fetching={interviews.query.isFetching && !interviews.query.isLoading}
        />
      </header>

      <List
        {...interviews}
        query={interviews}
        refresh={interviews.query.refetch}
      />
    </div>
  );
};

export default Interviews;
