import PageTitle from "@/components/Common/PageTitle";
import Content from "@/components/UpcomingLessons/Content";
import { useAppSelector } from "@/redux/store";
import { profileSelectors } from "@/redux/user/profile";
import { useInfiniteLessons } from "@litespace/headless/lessons";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import React from "react";

const UpcomingLessons: React.FC = () => {
  const intl = useFormatMessage();
  const profile = useAppSelector(profileSelectors.full);

  const lessons = useInfiniteLessons({
    users: profile.value?.user ? [profile.value.user?.id] : [],
    userOnly: true,
    future: true,
    past: true,
    ratified: true,
    canceled: true,
  });

  if (!profile.value?.user) return;

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
