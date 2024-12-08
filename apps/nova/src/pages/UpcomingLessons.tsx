import PageTitle from "@/components/Common/PageTitle";
import Content from "@/components/UpcomingLessons/Content";
import { useUser } from "@litespace/headless/context/user";
import { useInfiniteLessons } from "@litespace/headless/lessons";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import React from "react";

const UpcomingLessons: React.FC = () => {
  const intl = useFormatMessage();
  const { user } = useUser();

  const lessons = useInfiniteLessons({
    users: user ? [user?.id] : [],
    userOnly: true,
    future: true,
    past: true,
    ratified: true,
    canceled: true,
  });

  if (!user) return;

  return (
    <div className="px-6 py-8 max-w-screen-3xl mx-auto w-full">
      <PageTitle title={intl("page.upcoming-lessons.title")} className="mb-6" />
      <Content
        list={lessons.list}
        loading={lessons.query.isLoading}
        fetching={lessons.query.isFetching && !lessons.query.isLoading}
        error={lessons.query.isError}
        more={lessons.more}
        hasMore={lessons.query.hasNextPage && !lessons.query.isPending}
      />
    </div>
  );
};

export default UpcomingLessons;
