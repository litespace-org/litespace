import PageTitle from "@/components/Common/PageTitle";
import Content from "@/components/Tutors/Content";
import { useOnError } from "@/hooks/error";
import { useTutors } from "@litespace/headless/tutor";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import React from "react";

const Tutors: React.FC = () => {
  const intl = useFormatMessage();
  const tutors = useTutors();

  useOnError({
    type: "query",
    error: tutors.query.error,
    keys: tutors.keys,
  });

  return (
    <div className="w-full p-6 mx-auto max-w-screen-3xl">
      <PageTitle
        title={intl("tutors.title")}
        fetching={tutors.query.isFetching && !tutors.query.isLoading}
        className="mb-6"
      />
      <Typography
        tag="p"
        className="text-natural-700 -mt-4 mb-4 md:max-w-3xl mx-auto text-center"
      >
        {intl("tutors.description")}
      </Typography>
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
