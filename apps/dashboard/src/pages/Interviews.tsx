import PageTitle from "@/components/common/PageTitle";
import List from "@/components/interviews/List";
import { useFindInterviews } from "@litespace/headless/interviews";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import cn from "classnames";
import React from "react";

export const Interviews: React.FC = () => {
  const intl = useFormatMessage();
  const query = useFindInterviews({ userOnly: false });
  console.log(query.query);

  return (
    <div className={cn("w-full flex flex-col max-w-screen-2xl mx-auto p-6")}>
      <header className="flex items-center justify-between mb-3">
        <PageTitle
          title={intl("dashboard.interviews.title")}
          count={query.query.data?.list.length}
          fetching={query.query.isFetching && !query.query.isLoading}
        />
      </header>
      <List {...query} query={query} refresh={query.query.refetch} />
    </div>
  );
};

export default Interviews;
