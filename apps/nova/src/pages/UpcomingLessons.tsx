import PageTitle from "@/components/Common/PageTitle";
import Content from "@/components/UpcomingLessons/Content";
import { Route } from "@/types/routes";
import { useUserContext } from "@litespace/headless/context/user";
import { useInfiniteLessons } from "@litespace/headless/lessons";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const UpcomingLessons: React.FC = () => {
  const intl = useFormatMessage();
  const navigate = useNavigate();
  const { user } = useUserContext();

  const lessons = useInfiniteLessons({
    users: user ? [user?.id] : [],
    userOnly: true,
    future: true,
    past: true,
    ratified: true,
    canceled: true,
  });

  useEffect(() => {
    if (!user) return navigate(Route.Root);
  }, [navigate, user]);

  return (
    <div className="p-6 max-w-screen-3xl mx-auto w-full h-full">
      <PageTitle title={intl("upcoming-lessons.title")} className="mb-6" />
      <Content
        list={lessons.list}
        loading={lessons.query.isLoading}
        fetching={lessons.query.isFetching && !lessons.query.isLoading}
        error={lessons.query.isError}
        more={lessons.more}
        hasMore={lessons.query.hasNextPage && !lessons.query.isPending}
        refetch={lessons.query.refetch}
      />
    </div>
  );
};

export default UpcomingLessons;
