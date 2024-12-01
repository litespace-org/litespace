import PageTitle from "@/components/Common/PageTitle";
import Content from "@/components/UpcomingLessons/Content";
import { useAppSelector } from "@/redux/store";
import { profileSelectors } from "@/redux/user/profile";
import { useFindLessons } from "@litespace/headless/lessons";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import React from "react";

const UpcomingLessons: React.FC = () => {
  const intl = useFormatMessage();
  const profile = useAppSelector(profileSelectors.full);

  const query = useFindLessons({
    users: profile.value?.user ? [profile.value.user?.id] : [],
    userOnly: true,
    future: true,
    past: true,
    ratified: true,
    canceled: true,
  });

  return (
    <div className="p-6 max-w-screen-3xl mx-auto w-full">
      <PageTitle title={intl("page.upcoming-lessons.title")} className="mb-6" />
      <Content {...query} />
    </div>
  );
};

export default UpcomingLessons;
