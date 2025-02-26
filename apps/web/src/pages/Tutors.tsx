import PageTitle from "@/components/Common/PageTitle";
import Content from "@/components/Tutors/Content";
import { useTutors } from "@litespace/headless/tutor";
import { useWebFormatMessage } from "@/hooks/intl";
import React from "react";

const Tutors: React.FC = () => {
  const intl = useWebFormatMessage();
  const tutors = useTutors();

  return (
    <div className="w-full p-6 mx-auto max-w-screen-3xl">
      <PageTitle
        title={intl("tutors.title")}
        fetching={tutors.query.isFetching && !tutors.query.isLoading}
        className="mb-6"
      />

      <Content
        tutors={tutors.list}
        loading={tutors.query.isLoading}
        fetching={tutors.query.isFetching && !tutors.query.isLoading}
        error={tutors.query.isError}
        more={tutors.more}
        hasMore={tutors.query.hasNextPage && !tutors.query.isPending}
        refetch={tutors.query.refetch}
      />
    </div>
  );
};

export default Tutors;
