import React from "react";
import { useTutors } from "@litespace/headless/tutor";
import Content from "@/components/Tutors/Content";
import PageTitle from "@/components/Common/PageTitle";
import { useFormatMessage } from "@litespace/luna/hooks/intl";

const Tutors: React.FC = () => {
  const intl = useFormatMessage();
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
      />
    </div>
  );
};

export default Tutors;
