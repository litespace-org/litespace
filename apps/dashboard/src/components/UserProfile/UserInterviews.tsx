import React from "react";
import PageTitle from "@/components/common/PageTitle";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import List from "@/components/interviews/List";
import { useFindInterviews } from "@litespace/headless/interviews";

type UserInterviewsProps = {
  id: number;
  name?: string;
};

const UserInterviews: React.FC<UserInterviewsProps> = ({ id, name }) => {
  const intl = useFormatMessage();
  const interviews = useFindInterviews({
    user: id,
    userOnly: true,
  });

  return (
    <>
      <PageTitle
        className="p-4"
        variant="secondary"
        title={`${intl("dashboard.user.interviews.title")}${name}`}
        fetching={interviews.query.isFetching && !interviews.query.isLoading}
        count={interviews.query.data?.total}
      />
      <List
        {...interviews}
        query={interviews}
        refresh={interviews.query.refetch}
      />
    </>
  );
};

export default UserInterviews;
