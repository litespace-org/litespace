import PageTitle from "@/components/Common/PageTitle";
import List from "@/components/SessionEvents/List";
import { useFindSessionEvents } from "@litespace/headless/sessionEvent";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import cn from "classnames";
import React from "react";

export const SessionEvents: React.FC = () => {
  const intl = useFormatMessage();
  const events = useFindSessionEvents();

  return (
    <div
      className={cn("w-full flex flex-col gap-6 max-w-screen-3xl mx-auto p-6")}
    >
      <header className="flex items-center justify-between">
        <PageTitle
          title={intl("dashboard.session-events.title")}
          count={events.query.data?.total}
          fetching={events.query.isFetching && !events.query.isLoading}
        />
      </header>

      <List
        list={events.query.data?.list}
        next={events.next}
        prev={events.prev}
        goto={events.goto}
        page={events.page}
        totalPages={events.totalPages}
        error={events.query.isError}
        fetching={events.query.isFetching}
        loading={events.query.isLoading}
        refetch={events.query.refetch}
      />
    </div>
  );
};

export default SessionEvents;
