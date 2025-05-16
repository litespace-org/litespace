import PageTitle from "@/components/Common/PageTitle";
import { AddTutorDialog, Content } from "@/components/Tutors";
import { useFindFullTutors } from "@litespace/headless/tutor";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import React from "react";

const Tutors: React.FC = () => {
  const intl = useFormatMessage();

  const { query, key: queryKey } = useFindFullTutors();

  return (
    <div className="flex flex-col gap-6 p-6 max-w-screen-3xl mx-auto w-full">
      <div className="flex justify-between items-center">
        <PageTitle title={intl("dashboard.tutors.title")} />
        <AddTutorDialog queryKey={queryKey} />
      </div>
      <Content
        queryKey={queryKey}
        tutors={query.query.data?.list}
        fetching={query.query.isFetching}
        loading={query.query.isLoading}
        error={query.query.isError}
        next={query.next}
        prev={query.prev}
        goto={query.goto}
        retry={query.query.refetch}
        page={query.page}
        totalPages={query.totalPages}
      />
    </div>
  );
};

export default Tutors;
